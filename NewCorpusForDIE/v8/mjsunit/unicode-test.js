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

// Texts are from the Unibrow test suite.

// Note that this file is in UTF-8.  smjs and testkjs do not read their
// source files as UTF-8, so they will fail on this test.  If you want
// to run the test on them you can do so after filtering it with the
// following piece of perl-based line noise:

// perl -CIO -ne '$_ =~ s/([^\n -~])/"\\u" . sprintf("%04x", ord($1))/ge; print $_;' < unicode-test.js > unicode-test-ascii.js

// The result is predictably illegible even for those fluent in Hindi.

var chinese =
"中国历史\n" +
"[编辑首段]维基百科，自由的百科全书\n" +
"跳转到： 导航, 搜索\n" +
"中國歷史\n" +
"中国历史系列条目\n" +
"史前时期\n" +
"传说时期\n" +
"(另见三皇五帝)\n" +
"夏\n" +
"商\n" +
"西周 	周\n" +
"春秋 	东周\n" +
"战国\n" +
"秦\n" +
"西汉 	汉\n" +
"新朝\n" +
"东汉\n" +
"魏 	蜀 	吴 	三\n" +
"国\n" +
"西晋 	晋\n" +
"东晋 	十六国\n" +
"宋 	南\n" +
"朝 	北魏 	北\n" +
"朝 	南\n" +
"北\n" +
"朝\n" +
"齐\n" +
"梁 	东\n" +
"魏 	西\n" +
"魏\n" +
"陈 	北\n" +
"齐 	北\n" +
"周\n" +
"隋\n" +
"唐\n" +
"（另见武周）\n" +
"五代十国\n" +
"辽\n" +
"(西辽) 	西\n" +
"夏 	北宋 	宋\n" +
"金 	南宋\n" +
"元\n" +
"明\n" +
"清\n" +
"中华民国\n" +
"中华人民\n" +
"共和国 	中华\n" +
"民国\n" +
"（见台湾问题）\n" +
"\n" +
"    * 中国历史年表\n" +
"    * 中国军事史\n" +
"    * 中国美术史\n" +
"    * 中国科学技术史\n" +
"    * 中国教育史\n" +
"\n" +
"中国\n" +
"天坛\n" +
"文化\n" +
"中文 - 文学 - 哲学 - 教育\n" +
"艺术 - 国画 - 戏曲 - 音乐\n" +
"神话 - 宗教 - 术数 - 建筑\n" +
"文物 - 电影 - 服饰 - 饮食\n" +
"武术 - 书法 - 节日 - 姓名\n" +
"地理\n" +
"疆域 - 行政区划 - 城市\n" +
"地图 - 旅游 - 环境 - 生物\n" +
"人口 - 民族 - 交通 - 时区\n" +
"历史\n" +
"年表 - 传说时代 - 朝代\n" +
"民国史 - 共和国史\n" +
"文化史 - 科技史 - 教育史\n" +
"人口史 - 经济史 - 政治史\n" +
"政治\n" +
"中华人民共和国政治 - 中华民国政治\n" +
"宪法 - 外交 - 军事 - 国旗\n" +
"两岸问题 - 两岸关系\n" +
"一个中国 - 中国统一\n" +
"经济\n" +
"金融 - 农业 - 工业 - 商业\n" +
"中国各省经济 - 五年计划\n" +
"其他\n" +
"列表 - 体育 - 人权 - 媒体\n" +
"\n" +
"中国历史自商朝起算约有3600年，自黄帝时代起算约有4000多年。有历史学者认为，在人类文明史中，“历史时代”的定义是指从有文字发明时起算，那之前则称为“史前”；中国历史中传说伏羲做八卦，黄帝时代仓颉造文字；近代考古发现了3600多年前（公元前1600年）商朝的甲骨文、约4000年前至7000年前的陶文、约7000年前至10000年前具有文字性貭的龟骨契刻符号。另外，目前在中国发现最早的史前人类遗址距今约200万年。\n" +
"\n" +
"从政治形态区分中国历史，可见夏朝以前长达3000年以上的三皇五帝是母系氏族社会到父系氏族社会的过渡时代，而夏朝开始君王世袭，周朝建立完备的封建制度至东周逐渐解构，秦朝首度一统各国政治和许多民间分歧的文字和丈量制度，并建立中央集权政治，汉朝起则以文官主治国家直至清朝，清末以降，民主政治、马克思主义等各种政治思潮流传，先促成中华民国的建立，并于其后四、五十年再出现中华人民共和国，而由于内战失败，中华民国政府退守台湾。\n" +
"\n" +
"由经济形态观察，中国古代人口主要由自由民构成，私有制、商业活动发达。周朝时商业主要由封建领主阶层控制的官商贸易和庶民的自由贸易构成。秦汉以后实行中央集权，人口由士、农、工、商等构成，其中以从事农业的自由民为主体，是一个君权官僚制下的以土地为主要生产资本的较为自由的商业经济社会，一些重要的行业由官商垄断。除了农业，手工业以及商业贸易也有很大的发展。早在汉朝丝路的开通，促进了东亚与中亚至欧洲的陆上交通时，国际贸易早已起步；隋唐时大运河的开通促进了南北贸易；唐朝的盛世及外交的开放、交通的建设，更使各国文化、物资得以交流；宋代时出现了纸币；元代时与中亚的商业交流十分繁荣；明清两代受到西方国家海上发展的影响，海上国际贸易发展迅猛。自中华民国成立起试图建立民主国家，实行自由经济，直到1990年代台湾落实民主制度，1950年代以后30多年迅速实现了向工业化社会的转型；而中国大陆则在1949年后采用一党制统治，起先为公有制的计划经济社会，改革开放后逐步向私有制的市场经济社会転型，同时，1980年代以来工业化发展迅猛，数亿人口在短短20多年内从农民转为产业工人（目前仅仅被称为“农民工”的产业工人就达到约2亿）。伴随经济的迅速国际化，中国经济成为全球经济中越来越重要的组成部分。\n" +
"目录\n" +
"[隐藏]\n" +
"\n" +
"    * 1 史前时代\n" +
"    * 2 传说时代\n" +
"    * 3 先秦时期\n" +
"          o 3.1 三代\n" +
"          o 3.2 春秋战国\n" +
"    * 4 秦汉时期\n" +
"    * 5 魏晋南北朝时期\n" +
"    * 6 隋唐五代时期\n" +
"    * 7 宋元时期\n" +
"    * 8 明清时期\n" +
"          o 8.1 清末的内忧外患\n" +
"    * 9 20世纪至今\n" +
"    * 10 参见\n" +
"    * 11 其他特定主题中国史\n" +
"    * 12 注解\n" +
"    * 13 参考文献\n" +
"    * 14 相关著作\n" +
"    * 15 外部链接\n" +
"\n" +
"[编辑] 史前时代\n" +
"大汶口文化的陶鬹，山東莒县大朱村出土\n" +
"大汶口文化的陶鬹，山东莒县大朱村出土\n" +
"\n" +
"迄今为止发现的最早的高等灵长类中华曙猿在4500万年前生活在中国江南一带。考古证据显示224万年至25万年前，中国就有直立人居住，目前考古发现的有巫山人、元谋人、蓝田人、南京直立人、北京直立人等。这些都是目前所知较早的原始人类踪迹。\n" +
"\n" +
"中国史前时代的各种文化是经过了以下几个阶段：以直立猿\n" +
"人为主的旧石器时代早中期（距今约50至40多万年前），接着进入了旧石器时代中晚期，以山顶洞人为代表，距今约在20至10余万年前。新石器时代早期的代表性文化是裴李岗文化，紧接着是以仰韶文化为代表的新石器时代中期。而以龙山文化为代表的新石器时代晚期，大约出现在公元前2500年到公元前1300年间。\n" +
"\n" +
"根据现在的考古学研究，中国的新石器时代呈现多元并立的情形：约西元前5000年到3000年前在河南省、河北省南部、甘肃省南部和山西省南部出现的仰韶文化便具备使用红陶、彩陶以及食用粟和畜养家畜的特质。而大约在同一时间，尚有在浙江省北边出现的河姆渡文化、山东省的大汶口文化。而之后发现的如二里头遗址和三星堆遗址则为青铜器时代的代表。\n" +
"\n" +
"[编辑] 传说时代\n" +
"\n" +
"    主条目：三皇五帝\n" +
"\n" +
"後人所繪的黄帝像\n" +
"后人所绘的黄帝像\n" +
"\n" +
"华夏文明形成于黄河流域中原地区。早期的历史，口口相传。神话中有盘古开天地、女娲造人的说法。传说中的三皇五帝，是夏朝以前数千年杰出首领的代表，具体而言有不同的说法。一般认为，三皇是燧人、伏羲、神农以及女娲、祝融中的三人，五帝一般指黄帝、颛顼、帝喾、尧、舜。自三皇至五帝，历年无确数，最少当不下数千年。\n" +
"\n" +
"据现今整理出来的传说，黄帝原系炎帝部落的一个分支的首领，强大之后在阪泉之战中击败炎帝，成为新部落联盟首领，之后又与东南方的蚩尤部落发生冲突，在涿鹿之战中彻底击败对手，树立了自己的霸主地位。\n" +
"\n" +
"后来黄帝的孙子颛顼和玄孙帝喾继续担任部落联盟的首领。帝喾的儿子尧继位，他是一名贤君，创立了禅让制，传位给了舜。在舜时期，洪水泛滥，鲧采用堵塞的方法，结果洪水更厉害了，鲧被处决，他的儿子禹采用疏导的方法，成功治理了洪水，因此被推举为首领。然而他的儿子启破坏了禅让制方式，自立为王(但据《史记》及香港中学课本所述，启是被推举为领袖)，建立了第一个世袭王朝——夏朝，夏朝持续了400多年，在最后一个夏朝君主——桀末期，东方诸侯国商首领成汤夺取了政权，建立了商朝。\n" +
"\n" +
"[编辑] 先秦时期\n" +
"\n" +
"[编辑] 三代\n" +
"\n" +
"    主条目：夏朝、商朝、周朝和西周\n" +
"\n" +
"甲骨文\n" +
"甲骨文\n" +
"\n" +
"最早的世袭朝代夏朝约在前21世纪到前16世纪，由于这段历史目前没有发现文字性文物做印证，所以只能靠后世的记录和出土文物互相对照考证，中国学者一般认为河南洛阳二里头遗址是夏朝首都遗址，有学者对此持有疑问。根据文字记载，夏朝有了中国最早的历法--夏小正。不过之后的商朝是目前所发现的最早有文字文物的历史时期，存在于前16世纪到约前1046年。据说夏朝最后一个君主——桀，由于荒淫无道而被汤推翻。而商代时文明已经十分发达，有历法、青铜器以及成熟的文字——甲骨文等。商王朝时已经有一个完整的国家组织，并且具有了封建王朝的规模。当时的主要生产部门是农业，不过手工业，特别是青铜器的冶铸水平也已经十分高超。并且已经出现了原始的瓷器。商朝自盘庚之后，定都于殷（今河南安阳），因此也称为殷朝。商朝的王位继承制度是传子或传弟，多按年龄的长幼继承。\n" +
"\n" +
"与此同时，黄河上游的另一个部落周正在逐步兴起，到了大约前1046年，周武王伐纣，在牧野之战中取得决定性胜利，商朝灭亡。周朝正式建立，建都渭河流域的镐京（今陕西西安附近）。之后周朝的势力又慢慢渗透到黄河下游和淮河一带。周王朝依然是封建贵族统治，有许多贵族的封国（诸侯）。到鼎盛时，周朝的影响力已经在南方跨过长江，东北到今天的辽宁，西至甘肃，东到山东。周朝时的宗法制度已经建立，政权机构也较完善。自唐尧、虞舜至周朝皆封建时代，帝王与诸侯分而治之[1]。中国最早有确切时间的历史事件是发生于公元前841年西周的国人暴动。\n" +
"\n" +
"[编辑] 春秋战国\n" +
"\n" +
"    主条目：周朝、东周、春秋时期和战国 (中国)\n" +
"\n" +
"先師孔子行教像，為唐朝画家吳道子所画\n" +
"先师孔子行教像，为唐朝画家吴道子所画\n" +
"\n" +
"前770年，由于遭到北方游牧部落犬戎的侵袭，周平王东迁黄河中游的洛邑（今河南洛阳），东周开始。此后，周王朝的影响力逐渐减弱，取而代之的是大大小小一百多个小国（诸侯国和附属国），史称春秋时期。春秋时期的大国共有十几个，其中包括了晋、秦、郑、齐及楚等。这一时期社会动荡，战争不断，先后有五个国家称霸，即齐、宋、晋、楚、秦(又有一说是齐、晋、楚、吴、越)，合称春秋五霸。到了前546年左右，黄河流域的争霸基本结束，晋、楚两国平分了霸权。前403年，晋国被分成韩、赵、魏三个诸侯国，史称“三家分晋”。再加上被田氏夺去了政权的齐国，和秦、楚及燕，并称战国七雄，战国时期正式开始。大部分马克思主义史学家将战国开始划为封建社会，然而大部分西方及台湾学者却又将之划为封建社会的崩溃。前356年秦国商鞅变法开始后，秦国国力大大增强，最后终于在前221年消灭六国最后的齐国，完成统一，中国历史也进入了新时代。\n" +
"\n" +
"春秋战国时期学术思想比较自由，史称百家争鸣。出现了多位对之后中国有深远影响的思想家（诸子百家），例如老子、孔子、墨子、庄子、孟子、荀子、韩非等人。出现了很多学术流派，较出名的有十大家，即道家（自然）、儒家（伦理）、阴阳家（星象占卜）、法家（法治）、名家（修辞辩论）、墨家（科技）、众、杂、农家（农业）、小说家（小说）等。文化上则出现了第一个以个人名字出现在中国文学史上的诗人屈原，他著有楚辞、离骚等文学作品。孔子编成了诗经。战争史上出现了杰出的兵法家孙武、孙膑、吴起等等。科技史上出现了墨子，建筑史上有鲁班，首次发明了瓦当，奠定了中国建筑技术的基础。能制造精良的战车与骑兵，同时此时中国的冶金也十分发达，能制造精良的铁器，在农业上出现了各种灌溉机械，大大提高了生产率，从而为以后人口大大膨胀奠定了基础。历史上出现了春秋（左传），国语，战国策。中华文化的源头基本上都可以在这一时期找到。\n" +
"\n" +
"这一时期科技方面也取得了很大进步。夏朝发明了干支纪年，出现了十进位制。西周人用圭表测日影来确定季节；春秋时期确定了二十八宿；后期则产生了古四分历。\n" +
"\n" +
"[编辑] 秦汉时期\n" +
"\n" +
"    主条目：秦朝、汉朝、西汉、新朝和东汉\n" +
"\n" +
"北京八達嶺長城\n" +
"北京八达岭长城\n" +
"\n" +
"前221年，秦并其他六国后统一了中国主体部分，成为了中国历史上第一个统一的中央集权君主统治国家，定都咸阳（今西安附近）。由于秦王嬴政自认“功盖三皇，德过五帝”，于是改用皇帝称号，自封始皇帝，人称秦始皇，传位后的皇帝称二世，直至千世万世。他对国家进行了许多项改革，包括了中央集权的确立，取代了周朝的诸侯分封制；统一了文字，方便官方行文；统一度量衡，便于工程上的计算。秦始皇还大力修筑驰道，并连接了战国时赵国、燕国和秦国的北面围城，筑成了西起临洮、东至辽东的万里长城以抵御北方来自匈奴，东胡等游牧民族的侵袭。秦始皇推崇法治，重用法家的李斯作为丞相，并听其意见，下令焚书坑儒，收缴天下兵器，役使七十万人修筑阿房宫以及自己的陵墓——包括兵马俑等。部分史学家对以上事件存有怀疑，认为由于秦始皇的一系列激进改革得罪了贵族，平民无法适应，才在史书上留此一笔。[来源请求]\n" +
"\n" +
"前210年，秦始皇病死于出巡途中，胡亥（即秦二世）杀害太子扶苏即位。但十个月后，陈胜、吴广在大泽乡揭竿而起，包括六国遗臣等野心家乘势作乱，前206年刘邦围攻咸阳，秦王子婴自缚出城投降，秦亡。此后，汉王刘邦与西楚霸王项羽展开了争夺天下的楚汉战争。 前202年十二月，项羽被汉军围困于垓下（今安徽灵壁），四面楚歌。项羽在乌江自刎而死。楚汉之争至此结束。汉高祖刘邦登基，定都长安（今陕西西安），西汉开始。到了汉武帝时，西汉到达鼎盛。并与罗马，安息(帕提亚），贵霜并称为四大帝国。武帝实行推恩令，彻底削弱了封国势力，强化监察制度，实现中央集权；他派遣卫青、霍去病、李广等大将北伐，成功地击溃了匈奴，控制了西域，还派遣张骞出使西域，开拓了著名的丝绸之路，发展了对外贸易，使中国真正了解了外面的世界，促进中西文化交流。儒家学说也被确立为官方的主流意识形态，成为了占统治地位的思想。其他艺术与文化也蒸蒸日上。同时期还出现了第一部通史性质的巨著——《史记》，同时这时的中国出现造纸术，大大推动了文化发展。\n" +
"\n" +
"西汉发展到了一世纪左右开始逐渐衰败。公元9年，外戚王莽夺权，宣布进行一系列的改革，改国号为新。然而这些改革却往往不切实际，最终导致农民纷纷起义。公元25年刘秀复辟了汉朝，定都洛阳，史称东汉，而他就是汉光武帝。东汉的发展延续了西汉的传统，此时出现了天文学家张衡。汉的文化吸取了秦的教训，显得相当开明，当时佛教通过西域到达中国，在河南洛阳修建了中国的第一座佛教寺庙——白马寺，佛教正式传入中国。\n" +
"\n" +
"[编辑] 魏晋南北朝时期\n" +
"\n" +
"    主条目：魏晋南北朝、三国、晋朝、十六国和南北朝\n" +
"\n" +
"赤壁\n" +
"赤壁\n" +
"\n" +
"东汉中后期，宦官和外戚长期争权，在黄巾起义的打击下，到了公元二世纪左右时再度衰败，196年曹操控制了东汉朝廷，把汉献帝迎至许都，“挟天子以令诸侯”，220年，曹操死后，长子曹丕废汉献帝自立，建立魏国，同时尚有刘氏的汉和孙氏的吴，历史进入了三国时期。\n" +
"\n" +
"265年，魏权臣司马炎称帝，建立晋朝。280年三国归晋，再度统一。晋朝的文化也有一定发展，当时由于战乱纷纷，很多学士选择归隐，不问世事，典型的代表人物是陶渊明（陶潜），当时的书法艺术也十分兴盛。290年晋武帝死后不到一年，十六年的朝廷权利斗争开始，史称“八王之乱”。与此同时，中原周边的五个游牧民族（匈奴、鲜卑、羌、氐、羯）与各地流民起来反晋，史称五胡乱华。这些游牧民族纷纷建立自己的国家，从304年到409年，北部中国陆陆续续有多个国家建立，包括了汉、前赵、后赵、前燕、前凉、前秦、后秦、后燕、西秦、后凉、北凉、南凉、南燕、西凉、夏和北燕, 史称十六国。\n" +
"\n" +
"自东汉后期开始，为躲避战乱，北方的汉族人民大量迁居南方，造成经济重心南移；晋朝南迁，建都建康（今江苏南京），历史上称此前为西晋，南迁后为东晋。最后，拓跋鲜卑统一北方，建立北朝的第一个王朝——北魏，形成了南北朝的对立。南朝经历了宋、齐、梁、陈的更替，而北朝则有北魏、东魏、西魏、北齐和北周。南北朝时期是佛教十分盛行的时期，西方的佛教大师络绎不绝地来到中国，许多佛经被翻译成汉文。\n" +
"\n" +
"[编辑] 隋唐五代时期\n" +
"\n" +
"    主条目：隋朝、唐朝和五代十国\n" +
"\n" +
"唐代画家张萱作《捣练图》。\n" +
"唐代画家张萱作《捣练图》。\n" +
"\n" +
"581年，杨坚取代北周建立了隋朝，并于589年灭掉南朝最后一个政权——陈，中国历经了三百多年的分裂之后再度实现了统一。不过隋朝也是一个短命的王朝，在修筑了巨大工程——京杭大运河后就灭亡了，只经历了两代37年。\n" +
"\n" +
"618年，唐高祖李渊推翻隋朝建立了唐朝，它是中国历史上延续时间最长的朝代之一。626年，唐太宗李世民即位，唐朝开始进入鼎盛时期，史称贞观之治。长安（今陕西西安）是当时世界上最大的城市，唐王朝也是当时最发达的文明。高宗李治之妻武则天迁都洛阳，并称帝，成为中国史上唯一的女皇帝，改国号周，并定佛教为国教，广修佛寺，大兴土木。隋唐时期开创的科举制是当时比较科学与公平的人材选拔制度。唐王朝与许多邻国发展了良好的关系，文成公主嫁到吐蕃，带去了大批丝织品和手工艺品。日本则不断派遣使节、学问僧和留学生到中国。唐朝的文化也处于鼎盛，特别是诗文得到较大的发展，还编撰了许多纪传体史书。唐代涌现出许多伟大的文学家，例如诗人李白、杜甫、白居易、杜牧，以及散文家韩愈、柳宗元。唐代的佛教是最兴盛的宗教，玄奘曾赴天竺取经，回国后译成1335卷的经文，并于西安修建了大雁塔以存放佛经。唐朝前期对宗教采取宽容政策，佛教外，道教、摩尼教(Manicheism)、景教和伊斯兰教等也得到了广泛传播。这一切都在李世民的曾孙唐玄宗李隆基统治时期达到顶峰，史称开元盛世。然而在755年，爆发了安史之乱，唐朝由此开始走向衰落。\n" +
"\n" +
"875年，黄巢起义爆发，唐朝再度分裂，并于907年灭亡，形成了五代十国的混乱局面。\n" +
"\n" +
"[编辑] 宋元时期\n" +
"\n" +
"    主条目：辽朝、金朝、西夏、宋朝和元朝\n" +
"\n" +
"清明上河圖局部，描繪了清明時節，北宋京城汴梁及汴河兩岸的繁華和熱鬧的景象和優美的自然風光。\n" +
"清明上河图局部，描绘了清明时节，北宋京城汴梁及汴河两岸的繁华和热闹的景象和优美的自然风光。\n" +
"\n" +
"经过了五十多年的纷争后，960年北宋控制了中国大部分地区，但是燕云十六州在北方契丹族建立的辽朝手中(五代中的后晋太祖“儿皇帝”石敬瑭所献)，河西走廊被党项族建立的西夏趁中原内乱占据，北宋初期虽然曾出兵讨还(宋太宗)但是以失败告终，木以成舟,无可奈何,不得不向日益坐大的辽和西夏交纳岁币。北宋晚期发生了分别以王安石、司马光为首的党派斗争，增加了社会的不安。到了1125年松花江流域女真族，也就是后来的满族，建立的金国势力逐渐强大，1125年，金国灭辽。金国随即开始进攻积弱的北宋，1127年(靖康元年)金国攻破北宋首都汴京（今河南开封），俘虏三千多皇族，其中包括了当时的皇帝宋钦宗和太上皇宋徽宗，因为钦宗其时的年号为靖康，史称靖康之难，北宋灭亡。同年宋钦宗的弟弟赵构在南京应天府（今河南商丘）即皇位，定都临安（今浙江杭州），史称南宋，偏安江南。\n" +
"\n" +
"此后金与南宋多次交战，英雄人物层出不穷(如名将岳飞)。直到1234年，蒙古南宋联合灭金。随即蒙古与南宋对抗，经历了空前绝后的大规模血腥战争(如襄樊之战, 钓鱼城之战)。1271年忽必烈建立元朝，定都大都（今北京）。元军于1279年与南宋进行了崖山海战，8岁的小皇帝赵昺被民族英雄陆秀夫背着以身殉国惨烈地跳海而死。崖山海战以元朝的胜利告终，南宋随之灭亡。另有一说, 原华夏文明至此夭折.[来源请求]\n" +
"\n" +
"北宋时期中国出现印刷术和火药。当时中国经济发达，中国海上贸易十分兴盛，福建泉州一带成为繁华的港口，中国当时的经济总量占世界的一半，财政收入超过一亿两白银，首都开封和杭州人口达到400到500万人口，相对当时佛罗伦萨和巴黎十几万人口来讲确实是十分繁华，各国商人云集，文化也极盛，出现了程颐、朱熹等理学家，提倡三从四德。与唐诗并驾齐驱的宋词，有苏轼等词文优秀的词人，出现了中国历史上最著名的女词人李清照，社会文化发达，出现了白蛇传，梁祝等浪漫爱情传说，以至于宋朝被西方学者称为中国的“文艺复兴”。\n" +
"\n" +
"元朝建立后，一方面吸收了许多中原、汉族文化，以中原的统治机构和方式来统治人民，并大力宣扬朱熹一派的理论（即程朱理学），使得程朱理学成为元朝（以及其后朝代）的官方思想，另一方面却实行了民族等级制度，第一等是蒙古人；第二等是“色目人”，包括原西夏统治区以及来自西域、中亚等地的人口；第三等是“汉人”，包括原金统治区的汉族和契丹、女真等族人；第四等是“南人”，包括原南宋统治区的汉族和其他族人。这种民族制度导致汉族的不满，许多汉族人将元朝视为外来政权，并发动多次反抗。元朝政府除了传统的农业外，也比较重视商业。元朝首都大都十分繁华，来自世界各国的商人云集。在文化上，则出现了与唐诗、宋词并称的元曲，涌现出诸如关汉卿、马致远、王实甫等著名作曲家。\n" +
"\n" +
"[编辑] 明清时期\n" +
"紫禁城太和殿\n" +
"紫禁城太和殿\n" +
"\n" +
"    主条目：明朝、南明、清朝和中国近代史\n" +
"\n" +
"1368年，农民起义军领袖朱元璋推翻元朝并建立了明朝。明朝前期建都南京，1405年曾帮助明成祖篡位的太监郑和奉命七次下西洋，曾经到达印度洋、东南亚及非洲等地，但后来明朝逐渐走向闭关锁国。1421年，明朝迁都北京。明朝文化上则出现了王阳明、李贽等思想家，以及《三国演义》、《水浒传》、《西游记》和《金瓶梅》等长篇小说。由于明朝末年行政混乱及严重自然灾害，1627年，明末农民大起义爆发，1644年，起义首领李自成攻克北京，明思宗自缢。南方大臣先后拥护福王朱由崧（弘光）、唐王朱聿键（隆武）、桂王朱由榔（永历）为帝，史称南明，最终因实力不足及政治内斗，仍为当时强盛的清朝所灭。\n" +
"\n" +
"明朝晚期，居住在东北地区的满族开始兴盛起来，终于在1644年李自成攻克北京后不久，驱逐李自成，进入北京，建立了清朝，当时明朝旧臣郑成功南撤到台湾岛，并驱逐了那里的荷兰殖民者，后来被清朝军队攻下。清朝在之后的半个世纪还成功地征服了许多地区，例如新疆、西藏、蒙古以及台湾。康熙年间，清廷还与沙俄在黑龙江地区发生战争，最终于1689年签订停战条约——《中俄尼布楚条约》。清朝由于取消了丁税（人头税），导致人口增加，到19世纪已达当时世界总人口的三分之一，人口的增多促进当时农业的兴盛，为当时世界上第一强国，到1820年时中国的经济总量占世界的三分之一。\n" +
"\n" +
"然而到了19世纪初，清朝已经走向衰落，在嘉庆年间先后爆发白莲教、天理教的大规模起义。与此同时海上强国英国、荷兰与葡萄牙等纷纷开始强制与中国进行贸易。1787年，英国商人开始向华输入鸦片，导致中国的国际贸易由顺差变为巨额逆差。清廷于1815年颁布搜查洋船鸦片章程，然而英商无视禁令依然走私大量鸦片，道光皇帝不得不于1838年派林则徐赴广州禁烟。1839年6月，将237万多斤鸦片在虎门销毁，史称虎门销烟。英国政府因此于1840年6月发动鸦片战争。一般中国大陆史学界认为这是中国近代史的开始。\n" +
"\n" +
"[编辑] 清末的内忧外患\n" +
"一幅描繪列強瓜分中國情形的漫畫\n" +
"一幅描绘列强瓜分中国情形的漫画\n" +
"\n" +
"鸦片战争持续了一年多，1841年8月英军到达南京，清廷恐惧英军会进逼北京，于是求和，1842年8月29日，《南京条约》签署。香港岛被割让；上海、广州、厦门、福州和宁波开放作为通商口岸，还赔偿款银（西班牙银圆）2100万元。1844年，美国与法国也与清廷分别签订了《望厦条约》和《黄埔条约》，中国的主权受到破坏。\n" +
"\n" +
"与此同时中国国内反抗清朝的斗争再度兴起。1851年至1864年间，受到基督教影响的秀才洪秀全建立拜上帝会，发动金田起义并创建了太平天国。太平天国曾经一度占领南方部分省份，并定都南京（改名“天京”），建立政教合一的中央政权。同一时期其它的运动还有天地会、捻军、上海小刀会起义、甘肃回民起义等。这些反抗清朝的斗争直到1860年代才基本平息下来。\n" +
"\n" +
"19世纪后期，英、美、法、俄、日等国多次侵入中国，强迫中国与之签定不平等条约。1858年中俄签定《瑷珲条约》，俄国割去黑龙江以北、外兴安岭以南60多万平方公里的中国领土。1860年，英法联军发动第二次鸦片战争，侵入北京，掠夺并烧毁皇家园林圆明园，并于1860年与清廷签定《北京条约》，各赔英法800万两白银，开放更多通商口岸。同年中俄《北京条约》将乌苏里江以东，包括库页岛（萨哈林岛）、海参崴（符拉迪沃斯托克）约40万平方公里的中国领土，划归俄国。1864年，《中俄勘分西北界约记》将巴尔喀什湖以东、以南和斋桑卓尔南北44万平方公里的中国领土，割给俄国。\n" +
"\n" +
"为了增强国力并巩固国防，清朝自1860年代开始推行洋务运动，国力有所恢复，并一度出现了同治中兴的局面。1877年清军收复新疆，1881年通过《伊犁条约》清军收复被沙俄占据多年的伊犁。中法战争后清朝还建立了当时号称亚洲第一、世界第六的近代海军舰队—北洋水师。然而在1894年爆发的中日甲午战争中，中国战败，次年被迫与日本签定《马关条约》，赔偿日本2亿两白银，并割让台湾、澎湖列岛给日本。甲午战争的失败，对当时的中国产生了很大的影响。1898年，光绪帝在亲政后同意康有为、梁启超等人提出的变法主张，从6月11日到9月21日的被称为百日维新的103天中进行了多项改革，但最终在慈禧太后发动政变后失败落幕，康有为、梁启超逃亡国外，谭嗣同、刘光第等六人被杀，史称“戊戌六君子”。\n" +
"\n" +
"1899年，义和团运动爆发，以“扶清灭洋”为宗旨并在慈禧太后默许下开始围攻外国驻北京使馆。于是，各国以解救驻京使馆人员的名义侵入中国，史称八国联军。1901年，清政府被迫与各国签定辛丑条约，赔款4.5亿两白银，分39年还清（本息合计9.8亿两），同时从北京到山海关铁路沿线由各国派兵驻扎，开北京东交民巷为使馆区，国人不得入内等。\n" +
"\n" +
"[编辑] 20世纪至今\n" +
"\n" +
"    主条目：中华民国历史和中华人民共和国史\n" +
"\n" +
"1901年，革命党开始兴起，孙中山等人在海外积极筹款，指挥国内的多次起义运动。经过十次失败的起义后，与革命党互不沟通的湖北新军在武昌起义获得成功。1912年元月，中华民国宣告成立。孙中山就任临时大总统。以清帝退位为条件，孙中山辞去总统位置，由袁世凯接任。但袁世凯妄图恢复帝制。此后，孙中山发起护法运动与护国运动讨伐袁世凯。1916年，袁世凯在称帝83天之后死去，中华民国进入北洋军阀控制中央政府统治时期，地方政府分别由各个军阀派系占据。\n" +
"\n" +
"孙中山之后多次试图联合南方地方军阀北伐北京中央政府未果。1921年，在共产国际的指导下中国共产党成立，并成为共产国际中国支部。1924年，孙中山提出新三民主义并确定联俄联共扶助农工的政策，国民党在共产国际帮助下改组，共产党员以个人身份加入国民党，国共两党进行第一次合作。孙中山自建立广州军政府（1923年改称大元帅府）以后，曾经三次进行北伐，均因条件不具备而未果。1925年春，孙中山病逝于北京。同年，广州国民政府为统一与巩固广东革命根据地，先后举行第一次东征第二次东征与南征，肃清广东境内的军阀势力和反革命武装，并将广东境内倾向革命的军队统一改编为国民革命军，下辖第1至第6军。不久又将广西部队改编为第7军。为北伐战争作了重要准备。1926年6月5日，国民党中央执行委员会正式通过国民革命军出师北伐案，并任命蒋介石为国民革命军总司令正式开始北伐。然而随着北伐和国民革命的深入，国民党不能容忍共产党激进的工人运动，国共两党分裂，大量共产党员及其支持者被清出国民党，有的被拘捕和杀害。1927年8月1日，以周恩来、贺龙、叶挺为首的共产党员在江西南昌发动南昌叛乱，共产党从此有自己独立的军队（中华人民共和国成立后，8月1日被定为建军节）。并于江西瑞金建立了第一个红色苏维埃地方割据政权。此后南京国民政府先后对中央苏区进行五次围剿，红军逃过了前四次围剿，在第五次战争失败，不得不离开红区。1934年开始，红军进行战略转移，在贵州遵义确立了毛泽东对红军的领导和指挥权，四渡赤水河，终于摆脱了追击，途经江西，贵州，四川，甘肃，陕西，经过二万五千里长征，最后在陕西北部与陕北红军刘志丹部会师，建立陕甘宁共产党临时政府。\n" +
"毛泽東在天安门城楼上宣布中华人民共和國的成立\n" +
"毛泽东在天安门城楼上宣布中华人民共和国的成立\n" +
"\n" +
"1931年9月18日，日本开始侵华，占领了东北全境。1936年12月12日，西安事变后国共第二次合作抗日。1937年7月7日，抗日战争全面爆发，蒋中正在庐山发表著名的“最后关头”的演说，号召全国人民一致抗日。在日军进行南京大屠杀前夕，中华民国首都从南京迁至武汉，后来迁至重庆，在八年间蒋中正为统帅的抗日力量共进行了22次大会战，和成千上万次大小战斗。1945年，二战结束后，当时的中国国民政府从日本手里获得了台湾及澎湖列岛以及其他一些领土，但也在1946年与苏联签订的条约中承认了外蒙古的独立（1951年，迁往台湾的国民党国民政府以苏联未履约为由，不承认该条约及依据该条约而独立的外蒙古的独立地位；但是，蒙古独立已为既成事实）。1946年6月，国共两党又进行了内战。中国共产党最终于1949年获得决定性胜利，中华民国中央政府迁往战后的台湾。中华人民共和国在北平成立，并将北平改名为北京，毛泽东宣布中华人民共和国政府为包括台湾在内的全中国的唯一合法政府。与此同时，蒋介石宣布台北为中华民国临时首都，宣誓三年内反攻大陆。（请参看台湾问题）\n" +
"\n" +
"中共执政之初，采取“土地革命”“公私合营”等手段，国内纷乱的局势暂时得到了稳定。按照中共的史观，自1956年“三大改造”完成后，中国正式进入社会主义阶段。并制订第一个五年计划，大力发展重工业，国家经济一度好转。但是1958年，毛泽东发动“大跃进”运动与人民公社话运动，各地浮夸风“放卫星”等谎报数据的情况盛行。自1959年到1961年，国家经济又陷入濒临崩溃的境地，中共称其为“三年自然灾害”。毛泽东因此退居幕后，以刘少奇为首的一批官僚着手恢复经济，国家形式得到了回稳。1966年，文化大革命爆发，刘少奇、贺龙等人被打倒，毛泽东再度成为政治领导，林彪一度成为内定接班人。在林彪阴谋败露后，四人帮成为新的重要政治势力。1976年，周恩来朱德先后去世；9月9日，毛泽东去世。华国锋接替了毛的领导地位，四人帮被打倒。但是华提出了“两个凡是”的路线，国家实质上仍然没有完全脱离文化大革命阶段。 1978年，邓小平复出，中共十一届三中全会召开，改革开放时代正式到来。中国的经济开始步入正轨。但是，由于通货膨胀与政治腐败，民间不满情绪开始酝酿。胡耀邦的去世成为愤怒爆发的导火索，终致爆发了六四事件。从此以后，改革的步伐一度停滞，直到1992年邓小平南巡后才得以改变。1997年，中国收复香港的主权，江泽民也接替邓成为了新的中国领导人。2002 年后，胡锦涛成为新的国家领导人，上海帮淡出政治中心。中共政府近几年渐渐放弃“韬光养晦”的外交方针，在外交舞台上动作频繁，并加强对台湾的攻势。经济改革依然得到了持续，但政治改革的话题仍然是禁忌。而由于贫富差距的拉大与政治腐败不见好转，民间对中共的评价与看法也日益两极。\n" +
"\n" +
"至于中华民国，在国府迁台后，国民党始终保持对政治与言论自由的强力控制。1986年，中华民国第一个反对党民主进步党成立，威权时代的戒严体制开始松动。1987年，中华民国政府正式宣告台湾省解严，进入了一个新的时代。之后，1996年实现了第一次民选总统；2000年更实现第一次政党和平轮替。2005年，末代国民大会召开，中华民国宪法出现了重大修改。今后，民主化的中华民国仍然充满变量。\n" +
"\n" +
"[编辑] 参见\n" +
"\n" +
"    * 中国\n" +
"    * 中国历史年表\n" +
"    * 中国历史事件列表\n" +
"    * 诸侯会盟\n" +
"    * 中国历史地图\n" +
"\n" +
"	\n" +
"\n" +
"    * 中华人民共和国历史年表\n" +
"    * 中华人民共和国史\n" +
"    * 汉学\n" +
"    * 中华文明\n" +
"    * 中国历史大事年表\n" +
"\n" +
"	\n" +
"\n" +
"    * 中国文化\n" +
"    * 中国行政区划\n" +
"    * 中国朝代\n" +
"    * 夏商周断代工程\n" +
"    * 中国古都\n" +
"\n" +
"	\n" +
"\n" +
"    * 中国战争列表\n" +
"    * 中国国旗\n" +
"    * 中国皇帝\n" +
"    * 中国历代王朝君主世系表\n" +
"    * 中国君王诸子女列表\n" +
"    * 中华民国历史\n" +
"\n" +
"[编辑] 其他特定主题中国史\n" +
"\n" +
"    * 中国军事史\n" +
"    * 中国科学技术史\n" +
"    * 中国文化史\n" +
"    * 中国文学史\n" +
"    * 中国艺术史\n" +
"    * 中国经济史\n" +
"    * 中国体育史\n" +
"    * 中国人口史\n" +
"    * 中国疆域史\n" +
"    * 中国盗墓史\n" +
"    * 中国酷刑史\n" +
"    * 中国食人史\n" +
"    * 中国盐业史\n" +
"\n" +
"[编辑] 注解\n" +
"\n" +
"   1. ↑ 柳翼谋：《中国文化史》\n" +
"\n" +
"[编辑] 参考文献\n" +
"\n" +
"   1. 白寿彝主编：中国通史纲要，1993年上海：人民出版社，ISBN 7208001367\n" +
"   2. 周谷城著：中国通史，1995年上海：人民出版社，ISBN 7208003300\n" +
"   3. 李敖著：独白下的传统，2000年香港：三联书店（香港）有限公司，ISBN 9620418913\n" +
"   4. 范文澜著：中国近代史，1962年北京：人民出版社，统一书号 11001241\n" +
"   5. 徐中约著：中国近代史(上册)，香港2001 中文大学出版社，ISBN 9622019870\n" +
"   6. Korotayev A., Malkov A., Khaltourina D. Introduction to Social Macrodynamics: Secular Cycles and Millennial Trends. Moscow: URSS, 2006. ISBN 5-484-00559-0 [1] (Chapter 2: Historical Population Dynamics in China).\n" +
"\n" +
"[编辑] 相关著作\n" +
"\n" +
"    * 《二十四史》 （正史）\n" +
"    * 《国史要义》 柳诒徵\n" +
"    * 《国史大纲》 钱穆\n" +
"    * 《中华五千年史》 张其昀\n" +
"\n" +
"[编辑] 外部链接\n" +
"维基共享资源中相关的多媒体资源：\n" +
"中国历史\n" +
"\n" +
"    * 中华万年网\n" +
"    * 一个全面专门研究中华历史的论坛：中华历史网论坛\n" +
"    * （正体中文 - 台湾）《中国大百科全书》：中国历史概述\n";

var cyrillic =
"История Китая\n" +
"[править]\n" +
"Материал из Википедии — свободной энциклопедии\n" +
"Перейти к: навигация, поиск\n" +
"История Китая\n" +
"История Китая\n" +
"Три властителя и пять императоров\n" +
"Династия Ся\n" +
"Династия Шан\n" +
"Династия Чжоу 	\n" +
"Западное Чжоу\n" +
"Восточное Чжоу 	Чуньцю\n" +
"Чжаньго\n" +
"Династия Цинь\n" +
"(Династия Чу) - смутное время\n" +
"Династия Хань 	Западная Хань\n" +
"Синь, Ван Ман\n" +
"Восточная Хань\n" +
"Эпоха Троецарствия 	Вэй 	Шу 	У\n" +
"Цзинь\n" +
"	Западная Цзинь\n" +
"Шестнадцать варварских государств 	Восточная Цзинь\n" +
"Северные и Южные Династии\n" +
"Династия Суй\n" +
"Династия Тан\n" +
"Ляо\n" +
"	\n" +
"5 династий и 10 царств\n" +
"Северная Сун\n" +
"	\n" +
"Сун\n" +
"Цзинь\n" +
"	\n" +
"Западная Ся\n" +
"	\n" +
"Южная Сун\n" +
"Династия Юань\n" +
"Династия Мин\n" +
"Династия Цин\n" +
"Китайская республика\n" +
"Китайская Народная Республика\n" +
"	Китайская республика (Тайвань)\n" +
"\n" +
"Китайская цивилизация — одна из старейших в мире. По утверждениям китайских учёных, её возраст может составлять пять тысяч лет, при этом имеющиеся письменные источники покрывают период не менее 3500 лет. Наличие систем административного управления, которые совершенствовались сменявшими друг друга династиями, ранняя освоенность крупнейших аграрных очагов в бассейнах рек Хуанхэ и Янцзы создавало преимущества для китайского государства, экономика которого основывалась на развитом земледелии, по сравнению с соседями-кочевниками и горцами. Ещё более укрепило китайскую цивилизацию введение конфуцианства в качестве государственной идеологии (I век до н. э.) и единой системы письма (II век до н. э.).\n" +
"Содержание\n" +
"[убрать]\n" +
"\n" +
"    * 1 Древний Китай\n" +
"    * 2 Государство Шан-Инь\n" +
"    * 3 Государство Чжоу (XI—III вв. до н. э.)\n" +
"    * 4 Империя Цинь\n" +
"    * 5 Империя Хань\n" +
"    * 6 Государство Цзинь и период Нань-бэй чао (IV—VI вв.)\n" +
"    * 7 Государство Суй (581—618)\n" +
"    * 8 Государство Тан\n" +
"    * 9 Государство Сун\n" +
"    * 10 Монголы и государство Юань (1280—1368)\n" +
"    * 11 Государство Мин (1368—1644)\n" +
"    * 12 Государство Цин\n" +
"          o 12.1 Внешняя экспансия Цин\n" +
"          o 12.2 Цинский Китай и Россия\n" +
"          o 12.3 Опиумные войны\n" +
"          o 12.4 Японо-китайская война 1894—1895 годов\n" +
"          o 12.5 Тройственная интервенция\n" +
"          o 12.6 Успехи русской политики в Китае\n" +
"          o 12.7 Захват Цзяочжоу Германией\n" +
"          o 12.8 Сто дней реформ\n" +
"    * 13 XX век\n" +
"          o 13.1 Боксерское восстание\n" +
"          o 13.2 Русско-японская война\n" +
"          o 13.3 Смерть Цыси\n" +
"          o 13.4 Аннексия Кореи\n" +
"          o 13.5 Революция 1911 года и создание Китайской Республики\n" +
"          o 13.6 Первая мировая война\n" +
"          o 13.7 Эра милитаристов\n" +
"          o 13.8 Победа Гоминьдана\n" +
"          o 13.9 Японская оккупация и Вторая мировая война\n" +
"          o 13.10 Создание Китайской Народной Республики\n" +
"          o 13.11 Культурная революция\n" +
"          o 13.12 Экономическая либерализация\n" +
"    * 14 См. также\n" +
"    * 15 Литература\n" +
"\n" +
"[править] Древний Китай\n" +
"\n" +
"Китайская цивилизация (предков государствообразующего этноса хань) — группа культур (Баньпо 1, Шицзя, Баньпо 2, Мяодигоу, Чжуншаньчжай 2, Хоуган 1 и др.) среднего неолита (ок. 4500-2500 до н.э.) в бассейне реки Хуанхэ, которые традиционно объединяются общим названием Яншао. Представители этих культур выращивали зерновые (чумиза и др.) и занимались разведением скота (свиньи). Позднее в этом районе появились ближневосточные виды злаков (пшеница и ячмень) и породы домашнего скота (коровы, овцы, козы).\n" +
"\n" +
"[править] Государство Шан-Инь\n" +
"\n" +
"Первым известным государством бронзового века на территории Китая было государство Шан-Инь, сформировавшееся в XIV веке до н. э. в среднем течении реки Хуанхэ, в районе Аньяна.\n" +
"\n" +
"В результате войн с соседними племенами его территория расширилась и к XI веку до н. э. охватывала территории современных провинций Хэнань и Шаньси, а также часть территории провинций Шэньси и Хэбэй. Уже тогда появились зачатки лунного календаря и возникла письменность — прообраз современного иероглифического китайского письма. Иньцы значительно превосходили окружающие их племена и с военной точки зрения — у них было профессиональное войско, использовавшее бронзовое оружие, луки, копья и боевые колесницы. Иньцы практиковали человеческие жертвоприношения — чаще всего в жертву приносились пленные.\n" +
"\n" +
"В XI веке до н. э. государство Инь было завоёвано немногочисленным западным племенем Чжоу, которое до этого находилось в вассальных отношениях с иньцами, но постепенно укрепилось и создало коалицию племён.\n" +
"\n" +
"[править] Государство Чжоу (XI—III вв. до н. э.)\n" +
"Китайская медная монета в виде мотыги. Провинция Лоян, V-III в. до н.э.\n" +
"Китайская медная монета в виде мотыги. Провинция Лоян, V-III в. до н.э.\n" +
"\n" +
"Обширная территория государства Чжоу, охватывавшая практически весь бассейн Хуанхэ, со временем распалась на множество соперничающих между собой самостоятельных государственных образований — изначально, наследственных уделов на территориях, заселённых различными племенами и расположенных на удалении от столиц — Цзунчжоу (западной - около г. Сиань) и Чэнчжоу (восточной - Лои, Лоян). Эти уделы предоставлялись во владение родственникам и приближённым верховного правителя — обычно чжоусцам. В междоусобной борьбе число первоначальных уделов постепенно сокращалось, а сами уделы укреплялись и становились более самостоятельными.\n" +
"\n" +
"Население Чжоу было разнородным, причём наиболее крупную и развитую его часть составляли иньцы. В государстве Чжоу значительная часть иньцев была расселена на новых землях на востоке, где была построена новая столица — Чэнчжоу (современная провинция Хэнань).\n" +
"\n" +
"Для периода Чжоу в целом характерно активное освоение новых земель, расселение и этническое смешивание выходцев из различных районов, уделов (впоследствии — царств), что способствовало созданию фундамента будущей китайской общности.\n" +
"\n" +
"Период Чжоу (XI—III вв. до н. э.) делится на так называемые Западное и Восточное Чжоу, что связано с переездом правителя Чжоу в 770 до н. э. под угрозой нашествия варварских племён из Цзунчжоу — первоначальной столицы государства — в Чэнчжоу. Земли в районе старой столицы были отданы одному из союзников правителя государства, который создал здесь новый удел Цинь. Впоследствии именно этот удел станет центром единой китайской империи.\n" +
"\n" +
"Период Восточное Чжоу, в свою очередь, разделяется на два периода:\n" +
"\n" +
"    * Чуньцю ( «Период Весны и Осени» VIII—V вв. до н. э.);\n" +
"    * Чжаньго («Период Сражающихся царств», V—III вв. до н. э.).\n" +
"\n" +
"В период Восточного Чжоу власть центрального правителя — вана, сына Неба (тянь-цзы), правящего Поднебесной по Мандату Неба (тянь-мин), — постепенно ослабла, а ведущую политическую роль стали играть сильные уделы, превращавшиеся в крупные царства. Большинство из них (за исключением окраинных) именовали себя «срединными государствами» (чжун-го), ведущими своё происхождение от раннечжоуских уделов.\n" +
"\n" +
"В период Восточного Чжоу формируются основные философские школы древнего Китая — конфуцианство (VI—V вв. до н. э.), моизм (V в. до н. э.), даосизм (IV в. до н. э.), легизм.\n" +
"\n" +
"В V—III вв. до н.э. (период Чжаньго) Китай вступает в железный век. Расширяются сельскохозяйственные площади, увеличиваются ирригационные системы, развиваются ремёсла, революционные изменения происходят в военном деле.\n" +
"\n" +
"В период Чжаньго на территории Китая сосуществовало семь крупнейших царств — Вэй, Чжао и Хань (ранее все три входили в царство Цзинь), Цинь, Ци, Янь и Чу. Постепенно в результате ожесточённого соперничества верх стало одерживать самое западное — Цинь. Присоединив одно за другим соседние царства, в 221 до н. э. правитель Цинь — будущий император Цинь Ши Хуан — объединил весь Китай под своей властью.\n" +
"\n" +
"Так в середине III века до н. э. завершился период Восточного Чжоу.\n" +
"\n" +
"[править] Империя Цинь\n" +
"\n" +
"Объединив древнекитайские царства, император Цинь Ши Хуан конфисковал всё оружие у населения, переселил десятки тысяч семей наследственной знати из различных царств в новую столицу — Сяньян и разделил огромную страну на 36 новых областей, которые возглавили назначаемые губернаторы.\n" +
"\n" +
"При Цинь Шихуанди были соединены оборонительные стены (валы) северных чжоуских царств и создана Великая китайская стена. Было сооружено несколько стратегических дорог из столицы на окраины империи. В результате успешных войн на севере гунны (сюнну) были оттеснены за Великую стену. На юге к империи были присоединены значительные территории племён юэ, в том числе северная часть современного Вьетнама.\n" +
"Строительство Великой китайской стены, протянувшейся на более чем 6700 км, было начато в III веке до н. э. для защиты северных районов Китая от набегов кочевников.\n" +
"Строительство Великой китайской стены, протянувшейся на более чем 6700 км, было начато в III веке до н. э. для защиты северных районов Китая от набегов кочевников.\n" +
"\n" +
"Цинь Шихуанди, строивший все свои реформы на основах легизма с казарменной дисциплиной и жестокими наказаниями провинившихся, преследовал конфуцианцев, предавая их казни (погребение заживо) и сжигая их сочинения — за то, что они смели выступать против установившегося в стране жесточайшего гнёта.\n" +
"\n" +
"Империя Цинь прекратила существование вскоре после смерти Цинь Шихуанди.\n" +
"\n" +
"[править] Империя Хань\n" +
"\n" +
"Вторую в истории Китая империю, получившую название Хань (206 до н. э.—220 н. э.) основал выходец из среднего чиновничества Лю Бан (Гао-цзу), один из военачальников возрожденного царства Чу, воевавших против Цинь после смерти императора Цинь Шихуана в 210 г. до н.э.\n" +
"\n" +
"Китай в это время переживал экономический и социальный кризис, вызванный потерей управляемости и войнами военачальников циньских армий с элитами уничтоженных раннее царств, пытавшихся восстановить свою государственность. Из-за переселений и войн значительно сократилась численность сельского населения в основных аграрных районах.\n" +
"\n" +
"Важная особенность смены династий в Китае состояла в том, что каждая новая династия приходила на смену предыдущей в обстановке социально-экономического кризиса, ослабления центральной власти и войн между военачальниками. Основателем нового государства становился тот из них, кто мог захватить столицу и насильственно отстранить правившего императора от власти.\n" +
"\n" +
"С правления Гао-цзу (206–195 до н.э.) начинается новый период китайской истории, который получил название Западная Хань.\n" +
"\n" +
"При императоре У-ди (140—87 до н. э.) была взята на вооружение иная философия — восстановленное и реформированное конфуцианство, которое стало господствующей официальной идеологией вместо дискредитировавшего себя легизма с его жёсткими нормами и бесчеловечной практикой. Именно с этого времени берёт своё начало китайская конфуцианская империя.\n" +
"\n" +
"При нем территория ханьской империи значительно расширяется. Были уничтожены вьетское государство Намвьет (территория современной провинции Гуандун, Гуанси-Чжуанского автономного района и север Индокитайского полуострова), вьетские государства в южных частях современных провинций Чжэцзян и Фуцзянь, корейское государство Чосон, присоеденены земли на юго-западе, сюнну оттеснены далее на севере.\n" +
"\n" +
"Китайский путешественник Чжан Цянь проникает далеко на запад и описывает многие страны Средней Азии (Фергана, Бактрия, Парфия и др.). Вдоль пройденного им маршрута прокладывается торговый путь через Джунгарию и Восточный Туркестан в страны Средней Азии и Ближнего Востока — так называемый «Великий шёлковый путь». Империя на некоторое время подчиняет себе оазисы-протогосударства вдоль Шёлкового пути и распространяет своё влияние до Памира.\n" +
"\n" +
"В I в. н. э. в Китай из Индии начинает проникать буддизм.\n" +
"\n" +
"В период с 8 по 23 гг. н. э. власть захватывает Ван Ман, провозглашающий себя императором и основателем государства Синь. Начинается ряд преобразований, который прерывается экологической катастрофой - река Хуанхэ изменила русло. Из-за трехлетнего голода центральная власть ослабла. В этих условиях началось движение представителей рода Лю за возвращение престола. Ван Ман был убит, столица взята, власть возвратилась династии Лю.\n" +
"\n" +
"Новый период получил название Восточная Хань, он продлился до 220 г. н. э.\n" +
"\n" +
"[править] Государство Цзинь и период Нань-бэй чао (IV—VI вв.)\n" +
"\n" +
"Восточную Хань сменил период Троецарствия (Вэй, Шу и У). В ходе борьбы за власть между военачальниками было основано новое государство Цзинь (265—420).\n" +
"\n" +
"В начале IV века Китай подвергается нашествию кочевников — сюнну (гуннов), сяньбийцев, цянов, цзе и др. Весь Северный Китай был захвачен кочевниками, которые создали здесь свои царства, так называемые 16 варварских государств Китая. Значительная часть китайской знати бежала на юг и юго-восток, основанное там государство получило название Восточная Цзинь.\n" +
"\n" +
"Кочевники приходят волнами, одна за другой, и после каждой из этих волн в Северном Китае возникают новые царства и правящие династии, которые, однако, принимают классические китайские названия (Чжао, Янь, Лян, Цинь, Вэй и др.).\n" +
"\n" +
"В это время, с одной стороны, происходит варваризация образа жизни оседлых китайцев — разгул жестокости, произвола, массовых убийств, нестабильности, казней и бесконечных переворотов. А с другой стороны, пришельцы-кочевники активно стремятся использовыть китайский опыт управления и китайскую культуру для стабилизации и упрочения своей власти — мощь китайской конфуцианской цивилизации в конечном счёте гасит волны нашествий варварских племён, которые подвергаются китаизации. К концу VI века потомки кочевников практически полностью ассимилируются с китайцами.\n" +
"\n" +
"На севере Китая верх в столетней борьбе между некитайскими царствами берёт сяньбийское государство Тоба Вэй (Северная Вэй), объединившее под своей властью весь Северный Китай (бассейн Хуанхэ) и к концу V века в борьбе против южнокитайского государства Сун распространившее своё влияние до берегов Янцзы. При этом уже в VI веке, как было сказано, захватчики-сяньбийцы ассимилировались с подавляющим большинством местного населения.\n" +
"\n" +
"С началом варварских вторжений на север Китая, сопровождавшихся массовым уничтожением и порабощением местного населения, до миллиона местных жителей — в первую очередь знатных, богатых и образованных, включая императорский двор, — перебрались на юг, в районы, сравнительно недавно присоединённые к империи. Пришельцы с севера, заселив речные долины, активно занялись выращиванием риса и постепенно превратили Южный Китай в основной земледельческий район империи. Уже в V веке здесь стали собирать по два урожая риса в год. Резко ускорилась китаизация и ассимиляция местного населения, колонизация новых земель, строительство новых городов и развитие старых. На юге сосредоточился центр китайской культуры.\n" +
"\n" +
"Одновременно здесь укрепляет свои позиции буддизм — на севере и юге построено уже несколько десятков тысяч монастырей с более чем 2 млн. монахов. В немалой степени распространению буддизма способствует ослабление официальной религии — конфуцианства — в связи с варварскими вторжениями и междоусобицами. Первыми китайскими буддистами, способствовавшими популяризации новой религии, были приверженцы даосизма — именно с их помощью переводились с санскрита на китайский древние буддийские тексты. Буддизм постепенно стал процветающей религией.\n" +
"\n" +
"[править] Государство Суй (581—618)\n" +
"\n" +
"Процесс китаизации варваризованного севера и колонизованного юга создаёт предпосылки для нового объединения страны. В 581 севернокитайский полководец Чжоу Ян Цзянь объединяет под своей властью весь Северный Китай и провозглашает новую династию Суй (581—618), а после уничтожения южнокитайского государства Чэнь возглавляет объединённый Китай. В начале VII века его сын Ян Ди ведёт войны против корейского государства Когурё (611 - 614) и вьетнамского государства Вансуан, строит Великий канал между Хуанхэ и Янцзы для транспортировки риса с юга в столицу, создаёт роскошные дворцы в столице Лоян, восстанавливает и строит новые участки Великой китайской стены, пришедшей в упадок за тысячу лет.\n" +
"\n" +
"Подданные не выдерживают тягот и лишений и восстают. Ян Ди убивают, а династию Суй сменяет династия Тан (618—907), основатель — шансийский феодал Ли Юань.\n" +
"\n" +
"[править] Государство Тан\n" +
"\n" +
"Правители из династии Лю покончили с выступлениями знати и провели ряд успешных преобразований. Происходит разделение страны на 10 провинций, была восстановлена \"надельная система\", усовершенствовано административное законодательство, укреплена вертикаль власти, оживились торговля и городская жизнь. Значительно увеличились размеры многих городов и численность городского населения.\n" +
"\n" +
"К концу VII века усилившееся военное могущество Танской империи приводит к расширению территории Китая за счёт Восточно-Тюркского и Западно-Тюркского каганатов. Государства, расположенные в Джунгарии и Восточном Туркестане, на некоторое время становятся данниками Китая. Корейское государство Когурё покорено и становится Аньдунским наместничеством Китая. Вновь открыт Великий шёлковый путь.\n" +
"\n" +
"В VIII—X вв. в Китае получают распространение новые сельскохозяйственные культуры — в частности, чай, хлопок.\n" +
"\n" +
"Развивается морская торговля, главным образом через Гуанчжоу (Кантон), с Индией и Ираном, Арабским Халифатом, корейским государством Силла и Японией.\n" +
"\n" +
"В VIII веке империю Тан ослабляют конфликты между центральной властью и военными наместниками на периферии. Окончательно господство династии Лю подрывает война Хуан Чао за престол 874—901.\n" +
"\n" +
"В течение долгого времени (907—960) в стране не удаётся восстановить единую государственную власть, что связано с междоусобными войнами, особенно на севере страны.\n" +
"\n" +
"[править] Государство Сун\n" +
"\n" +
"В 960 военачальник Чжао Куан-инь основывает династию Сун (960—1279). Все три столетия Сун прошли под знаком успешного давления на Китай со стороны северных степных народов.\n" +
"\n" +
"Ещё в начале X века усилилось развитие и консолидация протомонгольской этнической общности киданей, соседствовавшей с Китаем на северо-востоке. Государство киданей, основанное в 916 и существовавшее по 1125, получило название Ляо. Активно укрепляясь на северных рубежах, кидани отторгли часть китайских территорий (часть современных провинций Хэбэй и Шаньси). Основы управления в государстве Ляо были созданы китайцами и корейцами, на основе китайских иероглифов и из китайских элементов письма была создана письменность, развивались города, ремёсла, торговля. Не сумев справиться с соседями и вернуть утраченные территории, Сунская империя была вынуждена пойти на подписание в 1004 мирного договора и согласиться на выплату дани. В 1042 дань была увеличена, а в 1075 Китай отдал киданям ещё часть своей территории.\n" +
"\n" +
"В то же время на северо-западных окраинах Сунской империи, к западу от киданей, на рубеже X—XI вв. складывается сильное государство тангутов — Западное Ся. Тангуты отторгли от Китая часть современной провинции Шэньси, целиком территорию современной провинции Ганьсу и Нинся-Хуэйского автономного района. С 1047 Сунской империи пришлось и тангутам платить дань серебром и шёлком.\n" +
"\n" +
"Несмотря на вынужденные территориальные уступки соседям период Сун считается эпохой экономического и культурного расцвета Китая. Растёт число городов, продолжается рост численности городского населения, китайские ремесленники достигают высот в изготовлении изделий из фарфора, шёлка, лака, дерева, слоновой кости и др. Изобретены порох и компас, распространяется книгопечатание, выводятся новые высокоурожайные сорта зерновых, увеличиваются посевы хлопка. Одной из наиболее впечатляющих и эффективных из данных инноваций было вполне сознательное, систематическое и хорошо организованное внедрение и распространение новых сортов скороспелого риса из Южного Вьетнама (Чампы).\n" +
"Чжан Цзэдуань. «По реке в День поминовения усопших» (XII век).\n" +
"Чжан Цзэдуань. «По реке в День поминовения усопших» (XII век).\n" +
"\n" +
"В XII веке Китаю приходится отдать ещё большую территорию новым захватчикам — южноманьчжурским чжурчжэням, создавшим (на базе уничтоженной ими в 1125 империи киданей Ляо) государство (впоследствии — империю) Цзинь (1115—1234), границы которой проходили по р. Хуайхэ. При этом часть разбитых киданей ушла на запад, где в районе рек Талас и Чу сложилось небольшое государство кара-китаев — Западное Ляо (1124—1211).\n" +
"\n" +
"В 1127 чжурчжэни захватывают столицу империи Сун — Кайфын и берут в плен императорскую семью. Один из сыновей императора бежит на юг, в Ханчжоу, который впоследствии становится столицей новой — южносунской империи (1127—1280). Продвижение армии чжурчжэней на юг сдерживает лишь река Янцзы. Граница между Цзинь и южносунской империей устанавливается по междуречью Хуанхэ и Янцзы. Северный Китай вновь на длительное время оказывается под господством иноземных завоевателей.\n" +
"\n" +
"В 1141 подписан мирный договор, согласно которому Сунская империя признаёт себя вассалом империи Цзинь и обязуется платить ей дань.\n" +
"\n" +
"[править] Монголы и государство Юань (1280—1368)\n" +
"\n" +
"В начале XIII века в Китай вторгаются монголы. До XIII века монголы являлись частью большой степной общности, которую китайцы называли \"татарами\". Их предшественники — протомонгольские и раннемонгольские группы и народы, одним из которых были кидани, представляли собой степных кочевников, разводивших лошадей и рогатый скот, кочевавших от пастбища к пастбищу и организованных в небольшие родоплеменные коллективы, связанные общностью происхождения, языка, культуры и т. п.\n" +
"\n" +
"Соседство развитой китайской цивилизации способствовало ускорению процесса создания племён, а затем и мощных племенных союзов во главе с влиятельными вождями. В 1206 на всемонгольском курултае вождём всех монголов был провозглашён победивший в жестокой междоусобной борьбе Темучин, принявший имя и титул Чингисхана.\n" +
"\n" +
"Чингисхан создал организованную и боеспособную армию, которая и стала решающим фактором в последующих успехах сравнительно немногочисленного монгольского этноса.\n" +
"\n" +
"Покорив соседние народы Южной Сибири, Чингисхан в 1210 пошёл войной на чжурчжэней и в 1215 взял Пекин.\n" +
"\n" +
"В 1219—1221 была разорена Средняя Азия и разбито государство Хорезмшахов. В 1223 — разбиты русские князья, в 1226—1227 — уничтожено государство тангутов. В 1231 основные силы монголов вернулись в Северный Китай и к 1234 завершили разгром чжурчжэньского государства Цзинь.\n" +
"\n" +
"Завоевания в Южном Китае были продолжены уже в 1250-х, после походов в Европу и на Ближний и Средний Восток. Вначале монголы захватили страны, окружавшие Южно-Сунскую империю — государство Дали (1252—1253), Тибет (1253). В 1258 монгольские войска под предводительством хана Хубилая с разных сторон вторглись в Южный Китай, но осуществлению их планов помешала неожиданная смерть Великого хана Мункэ (1259). Хан Хубилай, захватив ханский престол, в 1260 перенёс столицу из Каракорума на территорию Китая (сначала в Кайпин, а в 1264 в Чжунду — современный Пекин). Столицу южносунского государства Ханчжоу монголам удалось взять лишь в 1276. К 1280 весь Китай был завоёван, а Сунская империя — уничтожена.\n" +
"\n" +
"После покорения Китая хан Хубилай основывает новую династию Юань (1271—1368), на службу новой власти привлекаются кидани, чжурчжэни, тюрки и даже европейцы — в частности, в это время Китай посещает венецианский купец Марко Поло.\n" +
"\n" +
"Тяжёлый экономический, политический и национальный гнёт, установленный монгольскими феодалами, сдерживает развитие страны. Множество китайцев было обращено в рабство. Земледелие и торговля были подорваны. Не выполнялись необходимые работы по поддержанию ирригационных сооружений (дамб и каналов), что привело в 1334 к чудовищному наводнению и гибели нескольких сот тысяч человек. Великтий Китайский канал был построен во время монгольского господства.\n" +
"\n" +
"Народное недовольство новыми правителями вылилось в мощное патриотическое движение и восстания, которые возглавили руководители тайного общества «Белый лотос» (Байляньцзяо).\n" +
"\n" +
"[править] Государство Мин (1368—1644)\n" +
"\n" +
"В результате длительной борьбы в середине XIV века монголы были изгнаны. К власти пришёл один из руководителей восстания — сын крестьянина Чжу Юаньчжан, основавший государствоМин (1368—1644).\n" +
"\n" +
"Монголы, оттеснённые на север, приступают к активному освоению степей современной Монголии. Империя Мин подчиняет себе часть чжурчжэньских племён, государство Наньчжао (современные провинции Юньнань и Гуйчжоу), часть современных провинций Цинхай и Сычуань.\n" +
"\n" +
"Китайский флот под командой Чжэн Хэ, состоящий из нескольких десятков многопалубных фрегатов, за период с 1405 по 1433 совершает несколько морских экспедиций в Юго-Восточную Азию, Индию и к восточному побережью Африки. Не принеся Китаю никакой экономической выгоды, экспедиции были прекращены, а корабли — разобраны.\n" +
"\n" +
"В XVI веке происходит первая попытка усилившейся Японии вторгнуться в Китай и Корею. В это же время в Китай проникают европейцы — португальцы, испанцы, голландцы. В 1557 Португалия овладела на правах «аренды» китайской территорией Аомынь (Макао). В Китае появляются и христианские миссионеры — иезуиты. Они привезли в Китай новые инструменты и механизмы — часы, астрономические приборы, наладили здесь производство огнестрельного оружия. В то же время они занимаются доскональным изучением Китая.\n" +
"\n" +
"[править] Государство Цин\n" +
"\n" +
"К концу XVI века северные соседи империи Мин — потомки чжурчжэньских племён, разбитых в своё время Чингисханом, — объединяются вокруг владения Маньчжоу под предводительством вождя Нурхаци (1559—1626). В 1609 Нурхаци прекращает платить дань Китаю, а затем провозглашает собственную династию Цзинь. С 1618 маньчжуры усиливают вооружённое давление на Китай. За восемь лет они выходят практически к Великой китайской стене (на крайнем востоке).\n" +
"\n" +
"Преемник Нурхаци Абахай провозглашает себя императором и меняет название династии на Цин. В начале XVII века маньчжуры завоевали Южную (Внутреннюю) Монголию. На всей территории Южной Маньчжурии и захваченных ханств Южной Монголии устанавливается централизованная администрация.\n" +
"\n" +
"Маньчжурская конница, поддержанная внутренними монголами, начинает совершать регулярные набеги на Китай, грабя и обращая в рабство сотни тысяч китайцев. Императору Мин приходится направить на северные рубежи свою лучшую армию под командованием У Саньгуя. Тем временем в Китае разгорается очередное крестьянское восстание. В 1644 крестьянские отряды под предводительством Ли Цзычэна, разгромив все остальные армии, занимают Пекин, а сам Ли Цзычэн провозглашает себя императором. У Саньгуй пропускает маньчжурскую конницу на Пекин. 6 июня 1644 маньчжуры захватывают столицу. Ли Цзычэн вскоре гибнет, а маньчжуры объявляют своего малолетнего императора Шуньчжи правителем всего Китая. У Саньгуй вместе со всей армией переходит на службу к завоевателям.\n" +
"\n" +
"Борьба против маньчжурских захватчиков продолжается ещё долго, но ослабленный Китай не в силах противостоять хорошо вооружённому и организованному войску. Последний оплот сопротивления — Тайвань захвачен маньчжурами в 1683.\n" +
"\n" +
"Маньчжурская династия в государстве Цин правила с 1644 по 1911 год. В руках маньчжурской знати находились высшие органы власти и руководство армией. Смешанные браки были запрещены, и тем не менее маньчжуры быстро китаизировались, тем более что, в отличие от монголов, они не противопоставляли себя китайской культуре.\n" +
"\n" +
"Начиная с Канси (годы правления 1662—1723), маньчжурские императоры были ревностными конфуцианцами, управляя страной по древним законам. Китай под властью династии Цин в XVII—XVIII вв. развивался достаточно интенсивно. К началу XIX века в Китае насчитывалось уже около 300 млн. человек — примерно в пять раз больше, чем в среднем на протяжении предыдущих двух тысяч лет. Демографическое давление привело к необходимости интенсификации сельского хозяйственного производства при активном участии государства. Маньчжуры обеспечили покорность китайского населения, но при этом заботились о процветании экономики страны и благосостоянии народа.\n" +
"\n" +
"[править] Внешняя экспансия Цин\n" +
"\n" +
"Правители государства Цин проводили политику изоляции Китая от внешнего мира. Европейская колонизация почти не затронула Китай. Католические миссионеры играли заметную роль при императорском дворе до конца XVII века, после чего христианские церкви были постепенно закрыты, а миссионеры — высланы из страны. В середине XVIII века была ликвидирована торговля с европейцами, за исключением одного порта в Кантоне (Гуанчжоу). Опорным пунктом иностранной торговли оставался остров Макао, находившийся под контролем португальцев.\n" +
"\n" +
"В первые два столетия цинской династии Китай, закрытый от повседневных контактов с внешним миром, проявлял себя как сильное независимое государство, осуществляющее экспансию во всех направлениях.\n" +
"\n" +
"Вассалом Китая была Корея. В середине XVIII века в империю вошла Северная (Внешняя) Монголия. В 1757 было уничтожено Джунгарское ханство, и территория его вместе с покорённым к 1760 Восточным Туркестаном была включена в состав Цинской империи под названием Синьцзян («Новая граница»). После ряда походов маньчжуро-китайской армии против Тибета этот район был в конце XVIII века присоединён к Цинской империи. Войны Цинской империи против Бирмы (1765—1769) и Вьетнама (1788—1789) оказались неудачными и закончились поражением цинских войск.\n" +
"\n" +
"Одновременно осуществлялась экспансия на север и северо-восток, что неминуемо привело к конфликту с Россией в Приамурье. В течение двух веков территория Китая увеличилась практически вдвое. Цинская империя обзавелась своего рода буферными зонами — Маньчжурией, Монголией, Тибетом, Синьцзяном — которые охраняли китайские земли.\n" +
"\n" +
"В цинском Китае любые официальные представители иностранных государств рассматривались исключительно как представители вассальных государств — реальных или потенциальных.\n" +
"\n" +
"[править] Цинский Китай и Россия\n" +
"\n" +
"    Основная статья: Российско-китайские отношения\n" +
"\n" +
"Первые шаги по установлению русско-китайских отношений были предприняты Россией в конце периода Мин (миссия И. Петлина в 1618—1619), но основные миссии (Фёдора Байкова в 1654—1657, Николая Спафария в 1675—1678 и др.) последовали уже в цинский период. Параллельно с миссиями шло продвижение на восток русских казаков — походы первопроходцев Василия Пояркова (1643—1646) и Ерофея Хабарова (1649—1653) положили начало освоению русскими людьми Приамурья и привели к присоединению его к России, в то время как маньчжуры считали эти районы своей вотчиной.\n" +
"\n" +
"В середине XVII века на обоих берегах Амура уже существовали русские крепости-остроги (Албазинский, Кумарский и др.), крестьянские слободы и пашни. В 1656 было образовано Даурское (позднее — Албазинское) воеводство, в которое входила долина Верхнего и Среднего Амура по обоим берегам.\n" +
"\n" +
"Хотя граница империи Цин тогда проходила чуть севернее Ляодунского полуострова («Ивовый палисад»), в 1650-е годы и позднее Цинская империя попыталась военной силой захватить русские владения в бассейне Амура и предотвратить принятие местными племенами российского подданства. Маньчжурское войско на какое-то время вытеснило казаков из крепости Албазин. Вслед за миссиями Фёдора Байкова и Николая Спафария Россия направила в 1686 к пограничным властям на Амуре полномочное посольство Фёдора Головина для мирного урегулирования конфликта.\n" +
"\n" +
"Переговоры велись в окружении многотысячной маньчжурской армии. С китайской стороны в переговорах участвовали миссионеры-иезуиты, противившиеся соглашению Китая с Россией, что ещё более осложняло обстановку. Китай отказался определить русско-китайскую границу по Амуру, потребовав себе всё Албазинское воеводство, всё Забайкалье, а впоследствии — вообще все земли к востоку от Лены.\n" +
"\n" +
"Угрожая захватить Нерчинск штурмом, цинские представители вынудили Головина согласиться на уход русских с Верхнего и Среднего Амура. По Нерчинскому договору Россия была вынуждена уступить Цинской империи свои владения по правому берегу р. Аргунь и на части левого и правого берегов Амура. Казаки были обязаны разрушить и оставить Албазин. Вследствие разночтений в текстах договора, составленных каждой из сторон, однако, большая территория оказалась неразграниченной и фактически превратилась в буферную зону между двумя государствами. Разграничение между Россией и Китаем в пределах этой зоны завершилось в XIX веке. Окончательно граница России с Китаем на Дальнем Востоке была определена Айгуньским (1858) и Пекинским (1860) договорами; она прошла по рекам Амур и Уссури через озеро Ханка и горные хребты до р. Туманьцзян; русско-китайское территориальное разграничение в Центральной Азии было завершено к середине 1890-х.\n" +
"\n" +
"[править] Опиумные войны\n" +
"Территория собственно Китая в 1875\n" +
"Территория собственно Китая в 1875\n" +
"\n" +
"К концу XVIII века торговля Китая с внешним миром вновь начала расширяться. Китайский шёлк, фарфор, чай и другие товары пользовались большим спросом в Европе, но китайцы отказывались что-либо покупать у европейцев, так что тем приходилось платить серебром за китайские товары. Тогда англичане начали ввозить в Китай опиум — в основном контрабандой из Индии — и вскоре приобщили к курению опиума местное население, особенно в приморских районах. Ввоз опиума постоянно возрастал и стал подлинным бедствием для страны, что привело к серии Опиумных войн в середине XIX века. Поражение в этих войнах привело к постепенному превращению Китая в фактическую полуколонию европейских держав.\n" +
"\n" +
"[править] Японо-китайская война 1894—1895 годов\n" +
"\n" +
"В 1874 году Япония захватила Формозу, однако вынуждена была покинуть её по требованию Англии. Тогда Япония обратила свои усилия на Корею, находившуюся в вассальной зависимости от Китая и Манчжурию. В июне 1894 по просьбе корейского правительства Китай направил войска в Корею для подавления крестьянского восстания. Воспользовавшись этим предлогом, Япония также направила сюда свои войска, после чего потребовала от корейского короля проведения «реформ», означавших фактически установление в Корее японского контроля.\n" +
"\n" +
"В ночь на 23 июля при поддержке японских войск в Сеуле был организован правительственный переворот. Новое правительство 27 июля обратилось к Японии с «просьбой» об изгнании китайских войск из Кореи. Однако ещё 25 июля японский флот уже без объявления войны начал военные действия против Китая; официальное объявление войны последовало только 1 августа 1894. Началась Японо-китайская война\n" +
"\n" +
"В ходе войны превосходство японской армии и флота привело к крупным поражениям Китая на суше и на море (под Асаном, июль 1894; под Пхеньяном, сентябрь 1894; при Цзюляне, октябрь 1894).\n" +
"\n" +
"С 24 октября 1894 военные действия перешли на территорию Северо-Восточного Китая. К марту 1895 японские войска захватили Ляодунский полуостров, Вэйхайвэй, Инкоу, под угрозой находился Мукден.\n" +
"\n" +
"17 апреля 1895 в Симоносеки представители Японии и Китая подписали унизительный для Китая Симоносекский договор.\n" +
"\n" +
"[править] Тройственная интервенция\n" +
"\n" +
"Условия, навязанные Японией Китаю, привели к так называемой \"тройственной интервенции\" России, Германии и Франции - держав, которые к этому времени уже поддерживали обширные контакты с Китаем и поэтому восприняли подписанный договор как наносящий ущерб их интересам. 23 апреля 1895 Россия, Германия и Франция одновременно, но по отдельности обратились к японскому правительству с требованием отказа от аннексии Ляодунского полуострова, которая могла бы привести к установлению японского контроля над Порт-Артуром, в то время как Николай II, поддерживаемый западными союзниками, имел собственные виды на Порт-Артур как незамерзающий порт для России. Германская нота была наиболее жесткой, даже оскорбительной для Японии.\n" +
"\n" +
"Японии пришлось уступить. 10 мая 1895 года японское правительство заявило о возвращении Китаю Ляодунского полуострова, правда, добившись увеличения суммы китайской контрибуции на 30 миллионов таэлей.\n" +
"\n" +
"[править] Успехи русской политики в Китае\n" +
"\n" +
"В 1895 году Россия предоставила Китаю заём в 150 миллионов рублей под 4% годовых. Договор содержал обязательство Китая не соглашаться на иностранный контроль над своими финансами, если в нём не будет участвовать Россия. В конце 1895 года по инициативе Витте был основан Русско-Китайский банк. 3 июня 1896 года в Москве был подписан русско-китайский договор об оборонительном союзе против Японии. 8 сентября 1896 года между китайским правительством и Русско-Китайским банком был подписан концессионный договор о сроительстве Китайской Восточной железной дороги. Общество КВЖД получало полосу земли вдоль дороги, которая переходила под его юрисдикцию. В марте 1898 года был подписан русско-китайский договор об аренде Россией Порт-Артура и Ляодунского полуострова.\n" +
"\n" +
"[править] Захват Цзяочжоу Германией\n" +
"\n" +
"В августе 1897 года Вильгельм II посетил Николая II в Петергофе и добился согласия на устройство немецкой военно-морской базы в Цзяочжоу (в тогдашнем варианте транскрипции - \"Киао-Чао\"), на южном побережье Шаньдуна. В начале ноября в Шаньдуне китайцами были убиты германские миссионеры. 14 ноября 1897 года немцы высадили десант на побережье Цзяочжоу и захватили его. 6 марта 1898 года было подписано германо-китайское соглашение, по которому Китай арендовал Германии Цзяочжоу сроком на 99 лет. Одновременно китайское правительство предоставило Германии концессию на постройку двух железных дорог в Шаньдуне и ряд горных концессий в этой провинции.\n" +
"\n" +
"[править] Сто дней реформ\n" +
"\n" +
"Непродолжительный период реформ начался 11 июня 1898 с издания маньчжурским императором Цзай Тянем (название годов правления — Гуансюй) указа «Об установлении основной линии государственной политики». Цзай Тянь привлек группу молодых реформаторов — учеников и единомышленников Кан Ювэя для разработки серии указов о реформах. В общей сложности было издано свыше 60 указов, которые касались системы образования, строительства железных дорог, заводов и фабрик, модернизации сельского хозяйства, развития внутренней и внешней торговли, реорганизации вооружённых сил, чистки государственного аппарата и т.д. Период радикальных реформ окончился 21 сентября того же года, когда вдовствующая Императрица Цыси произвела дворцовый переворот и отменила реформы.\n" +
"\n" +
"[править] XX век\n" +
"\n" +
"[править] Боксерское восстание\n" +
"\n" +
"В мае 1900 года в Китае началось большое восстание, получившее название боксерского или Ихэтуаньского восстания. 20 июня в Пекине был убит германский посланник Кеттелер. Вслед за этим восставшими были осаждены дипломатические миссии, находившиеся в особом квартале Пекина. Было осаждено также здание католического кафедрального собора Петанг (Бейтанг). Начались массовые убийства \"ихэтуанями\" китайцев-христиан, в том числе было убито 222 православных китайца. 21 июня 1900 года Императрица Цыси объявила войну Великобритании, Германии, Австро-Венгрии, Франции, Италии, Японии, США и России. Великие державы согласились о совместных действиях против восставших. Главнокомандующим экспедиционными силами был назначен германский генерал Вальдерзее. Однако, когда он прибыл в Китай, Пекин был уже освобожден небольшим передовым отрядом под командованием русского генерала Линевича. Русская армия заняла Манчжурию.\n" +
"\n" +
"[править] Русско-японская война\n" +
"\n" +
"8 февраля 1904 года началась Русско-японская война за контроль над Манчжурией и Кореей. Война, шедшая на территории Китая была для России неудачной, по её результатам, Россия была вынуждена уступить Японии Порт-Артур и Ляодунский полуостров с частью построенной к тому времени КВЖД.\n" +
"\n" +
"[править] Смерть Цыси\n" +
"\n" +
"14 декабря 1908 года в один день умерли Императрица Цыси и Император Гуансюй, которого Цыси ранее отстранила от власти. Возможно, Гуансюй был отравлен, так как Цыси не хотела, чтобы он её пережил. На престол взошёл Император Пу И, которому было два года. Регентом назначен его отец князь Чунь, однако вскоре власть перешла к его брату.\n" +
"\n" +
"[править] Аннексия Кореи\n" +
"\n" +
"В 1910 году Япония аннексировала Корею, хотя японские войска там находились с начала Русско-японской войны.\n" +
"\n" +
"[править] Революция 1911 года и создание Китайской Республики\n" +
"\n" +
"В 1911 году в Китае началось Учанское восстание. Оно стало началом Синьхайской революции (1911—1913) в Китае, в результате которой было свергнута маньчжурская династия Цин и провозглашено создание Китайской республики.\n" +
"\n" +
"После падения монархии правитель Монголии отказался повиноваться республике и отделился от Китая. 3 ноября им было заключено соглашение с Россией. Англия воспользовалась внутренней борьбой в Китае для превращения Тибета в свою зону влияния. Тибет поднялся на борьбу и заставил китайский гарнизон покинуть страну. Все последующие попытки китайцев восстановить там свою власть пресекались Британией. Россия согласилась считать Тибет английской сферой влияния, а Англия признала русские интересы в независимой (внешней) Монголии.\n" +
"\n" +
"12 февраля 1912 года Император Пу И отрекся от престола. К власти пришел генерал Юань Шикай премьер-министр и главнокомандующий армией. Вскоре он был провозглашен президентом Китая.\n" +
"\n" +
"В 1913 году произошла \"Вторая революция\". Юань Шикай подавил разрозненные выступления в центральных и южных провинциях. В стране устанавливается военная диктатура Юань Шикая, основателя группировки бэйянских (северных) милитаристов. Сунь Ятсен вынужден эмигрировать за границу.\n" +
"\n" +
"[править] Первая мировая война\n" +
"\n" +
"После начала первой мировой войны китайское правительство объявляет о своем нейтралитете и просит воюющие державы не переносить военные действия на территорию Китая, в том числе и на \"арендованные\" державами китайские земли. Однако 22 августа 1914 года Япония объявила о своем состоянии войны с Германией и высадила 30-тысячную армию севернее Циндао - центра немецкой колонии в провинции Шаньдун. После двухмесячной военной кампании Япония захватила германские владения в Шаньдуне, а также распространила свой контроль на всю территорию провинции.\n" +
"\n" +
"В 1915 году китайские принцы голосуют за установленче в Китае монархии с Юанем Шикаем на императорском троне. Распускается парламент. Объявляется монархия. Это вызывает ряд восстаний в провинциях Китая. Независимость от Пекина объявляют провинции Юньнань, Гуйчжоу и Гуанси. Потом отделяются Гуандун, Чжэцзян, Сычуань и Хунань.\n" +
"\n" +
"22 марта 1916 года умирает Юань Шикай.\n" +
"\n" +
"[править] Эра милитаристов\n" +
"\n" +
"После смерти Юань Шикая в Китае начали оформляться многочисленные военно-феодальные вотчины различных милитаристских группировок. Наиболее крупной была бэйянская (северная), делившаяся на фэнтяньскую (маньчжурскую) во главе с бывшим главарем шайки хунхузов Чжан Цзолинем, чжилийскую во главе с генералом Фэн Гочжаном, и аньхойскую во главе с генералом Дуань Цижуем. В провинции Шаньси господствовал милитарист Янь Сишань, заигрывавший с бэйянской группировкой, а в провинции Шэньси - генерал Чэнь Шуфань. Лагерь юго-западных милитаристов состоял из двух крупных группировок: юньнаньской во главе с генералом Тан Цзияо, и гуансийской во главе с генералом Лу Жунтином.\n" +
"\n" +
"Под контролем фэнтяньской группировки находились провинции Хэйлунцзян, Гирин и Фэнтянь, под контролем чжилийской - Шаньдун, Цзянсу, Чжэцзян, Фуцзянь, Цзянси, Хунань, Хубэй и часть Чжили. Фэнтяньская и аньхойская клики финансировались Японией, чжилийская - Англией и США. Ли Юаньхун был ставленником юго-западных милитаристов. Вице-президент генерал Фэн Гочжан ориентировался на Англию и США, а премьер-министр генерал Дуань Цижуй держался прояпонского направления. В 1917 году Япония начала предоставлять Дуань Цижую крупные займы, получая за них все новые и новые уступки, в том числе концессии в Маньчжурии.\n" +
"\n" +
"[править] Победа Гоминьдана\n" +
"\n" +
"Партия Гоминьдан была создана в 1912 году в провинции Гуанчжоу. Примерно в тоже время, в 1921 г., была создана и Китайская коммунистическая партия, малочисленная и не пользовавшаяся в тот период особой популярностью. 8 сентября 1923 в Китай по просьбе Сунь Ятсена, который просил прислать ему человека с которым он мог бы говорить по-английски без переводчика, прибыл агент коминтерна М.М.Бородин, ставший политическим советником ЦИК Гоминьдана и советником Сунь Ятсена. Он организовал сотрудничество между Гоминьданом и КПК. 20 января 1924 г. проходит I Всекитайский съезд Гоминьдана в Гуанчжоу. На съезде был принят курс на союз с китайскими коммунистами и СССР. 16 июня учреждена Военная академия Вампу под руководством Чан Кайши. В первый набор было зачислено 400, во второй - 500, в третий - 800 и четвертый - около 2600 слушателей; при школе было создано два учебных полка. В академию Вампу прибыла большая группа советских военных советников. В октябре 1924 г. в Гуанчжоу на должность главного военного советника прибыл Василий Константинович Блюхер.\n" +
"В марте 1926 Чан Кайши осуществил в Кантоне военный переворот, изгнал из города коммунистов, а спустя три месяца был избран председателем Гоминьдана и главнокомандующим вооруженными войсками. Добившись высокой власти, Чан Кайши пригласил немецких советников во главе бывшим генералом рейхсвера фон Сектом.\n" +
"В качестве советников у Чан Кайши действовали офицеры Германии:\n" +
"\n" +
"    * полковник В.Бауэр (друг Гитлера и ученик Людендорфа)\n" +
"    * нацист подполковник Крибель\n" +
"    * генерал-лейтенант Ветцель\n" +
"    * генерал Фалькенхаузен\n" +
"\n" +
"Гоминьдановцы старательно перенимали опыт нацистов по наведению порядка в стране. Китайские офицеры в организованном порядке направлялись на обучение в Германию.\n" +
"В 1926 Национально-революционная армия Китая Чан Кайши предприняла так называемый Великий Северный поход. В течение шести месяцев непрерывных боев от власти местных военных правителей были освобождены центральные районы Китая.\n" +
"В начале 1927 Чан Кайши пошел на открытый развал единого фронта ГМД и КПК: его войска начали разоружение шанхайских рабочих отрядов и дружин, начались массовые аресты и казни профсоюзных деятелей и коммунистов. В ответ на это коммунисты организовали 1 августа в городе Наньчан восстание части гоминьдановских войск, вошедшее в историю Китая как \"Наньчанское восстание\".\n" +
"В декабре 1927 было поднято коммунистическое восстание в Кантоне, которое гоминьдановцы жесточайшим образом подавили после четырех дней кровопролитных боев.\n" +
"После нескольких военных операций к 1927 году войска Гоминьдана контролировали большую часть территории Китая.\n" +
"\n" +
"[править] Японская оккупация и Вторая мировая война\n" +
"\n" +
"Осенью 1931 Япония напала на Китай. 18 сентября после серии провокаций японцы перешли в наступление, за короткое оккупировав всю Манчжурию. В марте 1932 здесь было провозглашено прояпонское марионеточное государство Маньчжоу-Го, которое возглавил Пу И – последний отпрыск маньчжурской династии Цин, свергнутой в годы Синьхайской революции.\n" +
"\n" +
"В этих сложных условиях Чан Кайши был вынужден бороться одновременно с тремя врагами: внешней японской агрессией, спорадическими бунтами отдельных милитаристов на местах, и вооружёнными силами КПК, претендовавшими на захват власти в стране. Он выбрал политику компромисса с японцами, с милитаристами вёл дела в зависимости от конкретных обстоятельств, с коммунистами же никакой компромисс был невозможен. В 1934 году основные силы КПК были блокированы в провинции Цзянси. В этих сложных условиях руководство КПК сумело организовать прорыв, и после многомесячного марша привело войска на Северо-Запад страны в т.н. \"особый район\" с центром в городе Яньань; эти события вошли в историю КПК как \"Великий поход\". Чан Кайши планировал продолжать борьбу с коммунистами и там, но тут взбунтовался ряд его генералов, считавших более приоритетной задачей примирение с коммунистами и совместную борьбу с японской агрессией. В результате \"Сианьского инцидента\" было подписано соглашение о создании единого фронта между КПК и Гоминьданом.\n" +
"\n" +
"7 июля 1937 конфликтом у моста Лугоуцяо недалеко от Пекина началась «большая» война. С этого момента, по мнению китайских историков, начинается Вторая мировая война.\n" +
"\n" +
"\n" +
"   Этот раздел не завершён. Вы можете помочь проекту, исправив и дополнив его.\n" +
"Японская оккупация (1940)\n" +
"Японская оккупация (1940)\n" +
"\n" +
"[править] Создание Китайской Народной Республики\n" +
"\n" +
"Разгром милитаристской Японии в августе-сентябре 1945 завершил Вторую мировую войну, освободив от порабощения страны Азиатско-Тихоокеанского региона. В Китае шла ожесточенная гражданская война.\n" +
"Советская Красная Армия полностью оккупировала Манчжурию, приняв капитуляцию фактически у всей японской Квантунской армии. К тому времени на территории Манчжурии действовали лишь разрозненные партизанские отряды и разведгруппы китайских партизан.\n" +
"В сентябре 1945 начала осуществляться массовая переброска вооруженных сил КПК из северного и Восточного Китая на северо-восток страны. К ноябрю туда перешли около 100 тысяч бойцов 8-ой и 4-ой армий. Из этих частей, партизанских формирований и местных жителей была сформирована Объединенная демократическая армия (ОДА) Северо-Востока, которая стала костяком Народно-освободительной армии Китая.\n" +
"Советская армия находилась в Манчжурии вплоть до мая 1946. За это время советская сторона помогла китайским коммунистам организовать, обучить и вооружить новые китайские войска. В результате, когда гоминьдановские войска начали в апреле 1946 входить в Манчжурию, они, к своему удивлению, обнаружили там не разрозненные партизанские отряды, а современную дисциплинированную армию коммунистов, вовсе не намеревавшуюся самораспускаться.\n" +
"Ситуация в Манчжурии стала шоком и для Белого дома. Первый отряд вооруженных сил США в составе двух дивизий морской пехоты высадился в Китае в районе Тяньцзиня еще 30 сентября 1945. К осени в Китае находилось уже свыше 100 тысяч американских военнослужащих.\n" +
"Американские экспедиционные войска, главным образом части морской пехоты, старались не вмешиваться в отношения между КПК и ГМД. Однако они активно взаимодействовали с вооруженными силами легитимного китайского правительства - войсками Гоминьдана, прежде всего в приеме капитуляции японских войск в Северном и Центральном Китае, а также в поддержании порядка и охране различных важных объектов в китайских городах.\n" +
"С самого начала командование войск ГМД допустило стратегическую ошибку: несмотря на успехи первых столкновений с ОДА в Манчжурии, военные действия в Северо-Восточном Китае не были доведены до конца, ГМД направил свои усилия не на борьбу с регулярными войсками КПК, а на уничтожение партизанского движения и партизанских баз в Центральном, Восточном и Северном Китае.\n" +
"Укрепившись с помощью советской стороны, при поддержке местного населения, войска Мао Цзэдуна к осени 1948 достигли численности в 600 тысяч человек. С 1 ноября ОДА стала именоваться 4-й Полевой армией. возглавили ее Линь Бяо.\n" +
"В ноябре 1948 4-я полевая армия перешла к решительным боевым действиям против гоминьдановцев. За короткие сроки было разбито 52 дивизии Чан Кайши, еще 26 дивизий, обученных военными инструкторами США, перешли на сторону КПК. В начале 1949 армия вошла в Северный Китай, где объединилась с войсками 8-й армии КПК. 15 января был взят Тяньцзинь, 22 января - Пекин.\n" +
"К весне 1949 вооруженные силы КПК освободили от гоминьдановцев весь Китай севернее реки Янцзы и восточнее провинции Ганьсу. К концу гражданской войны Народно-освободительная армия представляла собой мощную 4-миллионую армию, крупнейшую в Азии.\n" +
"24 апреля 1949 войска КПК под командованием маршала Лю Бочэна вступили в столицу гоминьдановского Китая - город Нанкин. Само гоминьдановское правительство еще в феврале переехало на юг страны, в Кантон, а затем вместе с остатками верных ему войск - бежало на остров Тайвань.\n" +
"В конце года Народно-освободительная армия Китая уничтожила все основные группировки Гоминьдана на континенте, победоносно завершив тем самым третью гражданскую войну в Китае.\n" +
"1 октября 1949 г. в Пекине была провозглашена Китайская Народная Республика.\n" +
"На следующий же день Советский Союз первым признал КНР и заключил с ней Договор о дружбе, союзе и взаимной помощи. Таким образом, в конце 1949 года родился советско-китайский «монолит» - тот самый, который на многие годы стал кошмаром для Запада.\n" +
"\n" +
"[править] Культурная революция\n" +
"\n" +
"В 1966 году председателем КПК Мао Цзэдуном была начата культурная революция для утверждения маоизма в качестве единственной государственной идеологии и уничтожения политической оппозиции. Было организовано массовое ополчение молодёжи, называвшееся «красногвардейцы». Красногвардейцы занялись преследованием «контререволюционеров» из числа аппарата КПК, интеллигенции и вообще всех, кто мог им не понравиться.\n" +
"\n" +
"[править] Экономическая либерализация\n" +
"\n" +
"После падения \"банды четырех\" власть в стране взяли реформаторы Дэн Сяопин и Ху Яобан, которые в конце 1978 года провозгласили на 3-м пленуме ЦК КПК 11-го созыва политику \"реформ и открытости\". Реальный старт \"Экономической реформе\" был дан на XII съезде КПК (1982 г.). На XIII съезде КПК (1987 г.) было дано подробное толкование теории начального этапа социализма, согласно которой социалистический строй и социалистическая экономическая система - разные вещи, т.е. социалистический политический режим не подразумевает безусловной плановой централизации всей экономики, а позволяет использовать и рыночные механизмы, особенно в паре \"государство-предприятие\". На XIV съезде КПК (1992 г.) был провозглашен курс на построение социалистической рыночной экономической системы с китайской спецификой. Данное изменение идеологии хорошо иллюстрирует высказываение Д.Сяопина: \"Неважно какого цвета кошка - главное, чтобы ловила мышей\".\n" +
"\n" +
"Фактически введение \"Экономической реформы\" означало настоящую \"революцию сверху\", заключавшуюся в постепенном и частичном сворачивании тоталитарной сталинско-маоистской модели жестко централизованной экономики и переводе части отраслей народного хозяйства на рыночные рельсы, но при полностью неизменной политической надстройке в лице монопольно управляющей страной КПК. К концу 70-х исторически слабая экономика Китая \"лежала\" из-за негативных последствий авантюристических кампаний Мао Цзедуна - \"большого скачка\" и \"культурной революции\". От систематического голода в Китае ежегодно страдали практически все 800 млн. крестьян (из миллиардного населения), страна занимала последние места в мире по уровню производства товаров и продовольствия на душу населения. Для решения проблемы голода необходимо было обеспечить стабильный валовый сбор зерна в объеме не менее 400 млн. т в год. Аграрные преобразования были связаны с отменой народной коммуны и заменой ее семейным подрядом и единой коллективной собственностью. Практически все 800 млн. крестьян получили право на свободное сельскохозяйственное производство. В основном была отменена система госзаготовок, освобождены цены на большинство видов сельскохозяйственной продукции. Результатом этих мер стал выход аграрного сектора из застоя, вступление крестьянских хозяйств на путь специализации и повышения товарности. Организованные в деревне по инициативе крестьян волостно-поселковые предприятия позволили обеспечить рост занятости (120 млн. чел.) и повысить жизненный уровень крестьян.Задача обеспечения страны зерном была в основном решена в 80-х. Постепенно в деревне сформировалась двухслойная хозяйственная система на основе сочетания коллективной собственности и семейного подряда.\n" +
"\n" +
"В области промышленной политики правительство Китая, начиная с 1984 года сделало упор концепцию плановой товарной экономики. На практике это означало перевод части отдельных городских предприятий на самоокупаемость. Позже правительство разрешило и подразделениям армии Китая (НОАК) перейти на самообеспечение и заниматься свободным предпринимательством. В соответствии с принципом \"Чжуа Да Фан Сяо\" (\"держать в руках большие предприятия, отпустить маленькие\") многие мелкие госпредприятия получили право изменить не только механизм хозяйствования, но и форму собственности. Это позволило государству сосредоточить силы на улучшении положения крупных предприятий. Четыре города - Шэньчжэнь, Чжухай, Сямынь, Шаньтоу - были объявлены специальными экономическими зонами. Вслед за ними 14 приморских городов, четыре региона в устьях рек Янцзы и Чжуцзян, юго-восточная часть провинции Фуцзянь и регион в районе Бахайского залива стали открытыми экономическими зонами. На острове Хайнань была создана одноименная новая провинция, а сам он стал специальной экономической зоной. Все эти города и районы получили различные инвестиционные и налоговые льготы для привлечения иностранного капитала и технологий, заимствования у иностранных партнеров эффективных методов управления. Быстрое развитие их экономики способствовало эффективному росту в масштабе страны. Характерно, что значительную долю ввозимого капитала на начальном этапе обеспечила китайская диаспора (хуацяо), проживающая преимущественно в странах тихоокеанского бассейна (основные зоны компактного проживания: Гонконг, Макао, Сингапур, Малайзия, США). Успешное проведение политики либерализации в сочетании с жестко проводимой политикой ограничения рождаемости (снижение рождаемости за 20 лет составило не менее 200 млн. человек) позволило создать многоукладную экономику, в которой госпредприятия дают 48% промышленной продукции, коллективные - 38%, частные, в том числе с иностранным участием, - 13,5%. На долю государственной торговли приходится свыше 41% общего розничного оборота, коллективной - почти 28% и частной - 31%. Доля рыночных цен по потребительским товарам достигла 90%, средствам производства - 80%, по сельскохозяйственным продуктам - 85%. Доля видов промышленной продукции, производство которых регулируется государственными директивными планами, снизилась с 95% в 1978 г. до 5% в настоящее время. Удельный вес товаров, ценами которых непосредственно управляет государство, в розничном товарообороте упал с 95 до 6%. Помимо рынка товаров начали создаваться рынки капиталов, машин и оборудования, рабочей силы, других необходимых для производства элементов. ВВП Китая рос в течение 20 лет, начиная с 1985 года в среднем на 9,5% ежегодно. Страна вышла на 1-е место в мире по производству цемента, цветных металлов, хлопчатобумажных тканей, велосипедов (свыше 80 млн.), мотоциклов (21,3 млн.), телевизоров (35 млн.), угля, зерна, хлопка, рапсовых семян, мяса, яиц, на 2-е - химических удобрений, 3-е - сахара, автомобилей (7,3 млн., вкл. 4,6 млн. легковых), 4-е - электроэнергии, 5-е - сырой нефти. По объему ВВП Китай находится на 4-м месте в мире (при расчете по паритетному покупательскому курсу - на 2-м). На его долю приходится 5,4% мирового валового продукта (2006 г.). Золотовалютные резервы страны превысили в 2006 г. триллион долларов США. Положительное сальдо торгового баланса составляет 180 млрд. долларов. Правда, несмотря на такой рекордно длительный и масштабный экономический рост, среднедушевые показатели ВВП Китая остаются еще на относительно низком уровне, ВВП на душу населения в 2005 году составил 7600 долларов (109-110 место в мире рядом с Украиной). В тоже время средний доход горожанина в открытых городах на конец 2006 г. превысил 10000 юаней в месяц. В китайской деревне от 100 до 150 млн. человек не могут найти работу, еще несколько сотен миллионов заняты частично. Официальный уровень безработицы в городах 4,2% (2005 г.).\n" +
"\n" +
"В начале 21-го века Китай превратился в \"мировую фабрику\" куда переводится ряд производств из развитых стран Европы, Северной Америки и Японии. Бурный экономический рост во многом связан с дешевизной рабочей силы, слабым уровнем техники безопасности и низким контролем за экологией. В результате Китай уже стал вторым загрязнителем мировой атмосферы и гидросферы, после гораздо более мощной экономики США, а также вышел в \"лидеры\" по эррозии почвы (особенно в северных областях). Возросший из-за роста авто- и мотопарка уровень импорта Китаем нефти (3,2 млн. баррелей/сут. в 2005-м, 2-е место в мире) приводит в последние годы к росту ее среднемировой цены.\n" +
"\n" +
"В тоже время экономическое и политическое влияние страны в мире в последние годы постоянно возрастает. Так Китаю в 1997-м и 1999-и годах были возращены \"арендованные\" еще у Поднебесной империи территории Гонконг (Сянган) и Макао (Аомынь). Постоянно возрастает уровень обороноспособности страны и техническое оснащение НОАК, чему в немалой степени способствует и РФ, поставляющая в Китай самые современные виды вооружения.\n" +
"\n" +
"Либерализация экономики КНР пока не сопровождается смягчением политического режима. В стране продолжаются политические репрессии против оппозиции, особенно масштабно реализованные во время \"событий на площади Тяньаньмэнь\" в мае 1989-го, жестко контролируются СМИ, включая Интернет. В тоже время в последние годы предпринят ряд важных изменений устава КПК, например, в партию разрешено вступать представителям предпринимательских кругов, введена ротация высших кадров руководства Партии. Во внутренней политике сняты все ограничения на рост личных состояний и разрешено владение личными автомобилями. В тоже время страна лидирует в мире по количеству смертных казней (более 7000 в год). Несмотря на такую суровую практику, уровень преступности и коррупции постоянно возрастает.\n" +
"\n" +
"Политика либерализации дала сенсационно высокие результаты, перевела экономику Китая на иной качественный уровень. При этом развитие экономики идет неравномерно по регионам, накапливаются социальные диспропорции, а экологическим аспектам уделяется недостаточное внимание, что уже затрагивает не только территорию Китая, но и интересы сопредельных с ним стран.\n" +
"\n" +
"[править] См. также\n" +
"\n" +
"    * Китай (цивилизация)\n" +
"    * События на площади Тяньаньмэнь 1989 года\n" +
"\n" +
"[править] Литература\n" +
"\n" +
"    * Васильев Л.С. Древний Китай: в 3 т. Т. 3. Период Чжаньго (V–III вв. до н.э.). М.: Восточная литература, 2006. ISBN 502018103X\n" +
"    * Непомнин О.Е. История Китая: Эпоха Цин. XVII – начало XX века. М.: Восточная литература, 2005. ISBN 5020184004\n";

var devanagari =
"भारत\n" +
"विकिपीडिया, एक मुक्त ज्ञानकोष से\n" +
"Jump to: navigation, search\n" +
"	यह लेख एक निर्वाचित लेख उम्मीदवार है। अधिक जानकारी के लिए और इस लेख को निर्वाचित लेख बनने के लिए क्या आवश्यकताएँ हैं यह जानने के लिए कृपया यहाँ देखें।\n" +
"भारत गणराज्य\n" +
"Flag of भारत 	Coat of arms of भारत\n" +
"ध्वज 	कुलचिह्न\n" +
"राष्ट्रवाक्य: \"सत्यमेव जयते\" (संस्कृत)\n" +
"\n" +
"सत्य ही विजयी होता है\n" +
"राष्ट्रगान: जन गण मन\n" +
"भारत की स्थिति\n" +
"राजधानी 	नई दिल्ली\n" +
"८७, ५९०) 28°34′ N 77°12′ E\n" +
"सबसे बड़ा शहर 	मुम्बई\n" +
"राजभाषा(एँ) 	हिन्दी, अंग्रेज़ी तथा अन्य भारतीय भाषाएं\n" +
"सरकार\n" +
"राष्ट्रपति\n" +
"प्रधानमंत्री\n" +
"	गणराज्य\n" +
"प्रतिभा पाटिल\n" +
"डॉ मनमोहन सिंह\n" +
"ब्रिटिश राज से स्वतंत्रता\n" +
"	१५ अगस्त, १९४७\n" +
"क्षेत्रफल\n" +
" - कुल\n" +
" \n" +
" - जलीय (%) 	 \n" +
"३२, ८७, ५९० km² (सातवां)\n" +
"१२,२२,५५९ sq mi \n" +
"९.५६\n" +
"जनसंख्या\n" +
" - २००५ अनुमान\n" +
" - २००१ जनगणना\n" +
" - जनसंख्या का घनत्व 	 \n" +
"१,१०,३३,७१,००० (द्वितीय)\n" +
"१,०२,७०,१५,२४८\n" +
"३२९/km² (३१ वीं)\n" +
"८५२/sq mi \n" +
"सकल घरेलू उत्पाद (जीडीपी) (पीपीपी)\n" +
" - कुल\n" +
" - प्रतिव्यत्ति 	२००५ estimate\n" +
"$३.६३३ महासंख (चौथी GDP_PPP_per_capita = $३,३२०)\n" +
"{{{GDP_PPP_per_capita}}} (१२२ वीं)\n" +
"मानव विकास संकेतांक (एइचडीआइ) 	०.६११ (१२६ वीं) – medium\n" +
"मुद्रा 	भारतीय रुपया (आइएनआर)\n" +
"समय मण्डल\n" +
" - ग्रीष्म ऋतु (डेलाइट सेविंग टाइम) 	आइएसटी (UTC+५:३०)\n" +
"अब्सर्व्ड नहीं है (UTC+५:३०)\n" +
"इंटरनेट टॉप लेवेल डोमेन 	.आइएन\n" +
"दूरभाष कोड 	+९१\n" +
"\n" +
"भारत गणराज्य, पौराणिक जम्बुद्वीप, दक्षिण एशिया में स्थित एक देश है। यह भारतीय उपमहाद्वीप का सबसे बड़ा देश है। भारत का भौगोलिक फैलाव 8० 4' से 37० 6' उत्तरी अक्षांश तक तथा 68० 7' से 97० 25'पूर्वी देशान्तर तक है । भारत का क्षेत्रफल ३२,८७,२६३ वर्ग कि. मी. हैं | भारत का विस्तार उत्तर से दक्षिण तक ३,२१४ कि. मी. और पूर्व से पश्चिम तक २,९३३ कि. मी. हैं । भारत की समुद्र तट रेखा ७५१६.६ किलोमीटर लम्बी है। भारत, भौगोलिक दृष्टि से विश्व का सातवाँ सबसे बड़ा और जनसँख्या के दृष्टिकोण से दूसरा बड़ा देश है | भारत के पश्चिम में पाकिस्तान , उत्तर-पूर्व मे चीन, नेपाल, और भूटान और पूर्व में बांग्लादेश और म्यांमार देश स्थित हैं। हिन्द महासागर में इसके दक्षिण पश्चिम में मालदीव, दक्षिण में श्रीलंका और दक्षिण-पूर्व में इंडोनेशिया है। भारत उत्तर-पश्चिम में अफ़्ग़ानिस्तान के साथ सीमा का दावा करता है। इसके उत्तर में हिमालय पर्वत है। दक्षिण में हिन्द महासागर है। पूर्व में बंगाल की खाड़ी है। पश्चिम में अरब सागर है। भारत में कई बड़ी नदियाँ है। गंगा नदी भारतीय सभ्यता मै बहुत पवित्र मानी जाती है। अन्य बड़ी नदियाँ ब्रह्मपुत्र, यमुना, गोदावरी, कावेरी, कृष्णा, चम्बल, सतलज, बियास हैं ।\n" +
"\n" +
"भारत की १०० करोड़ (१ अरब) से अधिक जनसंख्या, चीन के बाद विश्व में सबसे अधिक है। यह विश्व का सबसे बड़ा लोकतंत्र है। यहाँ ३०० से अधिक भाषाएँ बोली जाती है (साइटेसन चाहिए)। यह एक बहुत प्राचीन सभ्यता की भूमि है।\n" +
"\n" +
"भारत विश्व की दसवीं सबसे बड़ी अर्थव्यवस्था है, किन्तु हाल में भारत ने काफी प्रगति की है, और ताज़ा स्थिति में भारत विश्व में तीसरे, चौथे स्थान पर होने का दावा करता है (साइटेसन चाहिए)। भारत भौगोलिक क्षेत्रफल के आधार पर विश्व का सातवाँ सबसे बड़ा राष्ट्र है। यह विश्व की कुछ प्राचीनतम सभ्यताओं का पालना रहा है जैसे - सिन्धु घाटी सभ्यता , और महत्वपूर्ण ऐतिहासिक व्यापार पथों का अभिन्न अंग है। विश्व के चार प्रमुख धर्म : हिन्दू , बौध , जैन तथा सिख भारत में प्रतिपादित हुए | १९४७ में स्वतंत्रता प्राप्ति से पूर्व ब्रिटिश भारत के रूप में ब्रिटिश साम्राज्य के प्रमुख अंग भारत ने विगत २० वर्ष में सार्थक प्रगति की है, विशेष रूप से आर्थिक और सैन्य | भारतीय सेना एक क्षेत्रिय शक्ति और विश्वव्यापक शक्ति है।\n" +
"\n" +
"भारत की राजधानी नई दिल्ली है। भारत के अन्य बड़े महानगर मुम्बई (बम्बई), कोलकाता (कलकत्ता) और चेन्नई (मद्रास) हैं।\n" +
"\n" +
"\n" +
"अनुक्रम\n" +
"[छुपाएं]\n" +
"\n" +
"    * १ नाम\n" +
"    * २ इतिहास\n" +
"    * ३ सरकार\n" +
"    * ४ राजनीति\n" +
"    * ५ राज्य और केन्द्रशासित प्रदेश\n" +
"    * ६ भूगोल और मौसम\n" +
"    * ७ अर्थव्यवस्था\n" +
"    * ८ जनवृत्त\n" +
"    * ९ संस्कृति\n" +
"    * १० यह भी देखें\n" +
"    * ११ बाहरी कड़ियाँ\n" +
"\n" +
"[संपादित करें] नाम\n" +
"मुख्य लेख: भारत नाम की उत्पत्ति\n" +
"\n" +
"भारत के दो आधिकारिक नाम है हिन्दी में भारत और अंग्रेज़ी में इन्डिया (India)। इन्डिया नाम की उत्पत्ति सिन्धु नदी के फारसी नाम से हुई। भारत नाम एक प्राचीन हिन्दू राजा भरत, जिनकी कथा महाभारत में है, के नाम से लिया गया है। एक तीसरा नाम हिन्दुस्तान (उत्पत्ति फारसी) या हिन्दुओं की भूमि मुगल काल से प्रयोग होता है यद्यपि इसका समकालीन उपयोग कम है।\n" +
"\n" +
"[संपादित करें] इतिहास\n" +
"मुख्य लेख: भारतीय इतिहास\n" +
"\n" +
"पाषाण युग भीमबेटका मध्य प्रदेश की गुफाएं भारत में मानव जीवन का प्राचीनतम प्रमाण है। प्रथम स्थाई बस्तियों ने ९००० वर्ष पूर्व स्वरुप लिया। यही आगे चल कर सिन्धु घाटी सभ्यता में विकसित हुई , जो २६०० ईसवी और १९०० ईसवी के मध्य अपने चरम पर थी। लगभग १६०० ईसापूर्व आर्य भारत आए और उत्तर भारतीय क्षेत्रों में वैदिक सभ्यता का सूत्रपात किया । इस सभ्यता के स्रोत वेद और पुराण हैं। यह परम्परा कई सहस्र वर्ष पुरानी है। इसी समय दक्षिण बारत में द्रविड़ सभ्यता का विकास होता रहा। दोनो जातियों ने एक दूसरे की खूबियों को अपनाते हुए भारत में एक मिश्रित संस्कृति का निर्माण किया।\n" +
"\n" +
"५०० ईसवी पूर्व कॆ बाद, कई स्वतंत्र राज्य बन गए। उत्तर में मौर्य राजवंश, जिसमें बौद्ध महाराजा अशोक सम्मिलित थे, ने भारत के सांस्कृतिक पटल पर उल्लेखनीय छाप छोड़ी। १८० ईसवी के आरम्भ से, मध्य एशिया से कई आक्रमण हुए, जिनके परिणामस्वरूप उत्तरी भारतीय उपमहाद्वीप में यूनानी, शक, पार्थी और अंततः कुषाण राजवंश स्थापित हुए | तीसरी शताब्दी के आगे का समय जब भारत पर गुप्त वंश का शासन था, भारत का \"स्वर्णिम काल\" कहलाया।\n" +
"तीसरी शताब्दी में सम्राट अशोक द्वारा बनाया गया मध्य प्रदेश में साँची का स्तूप\n" +
"तीसरी शताब्दी में सम्राट अशोक द्वारा बनाया गया मध्य प्रदेश में साँची का स्तूप\n" +
"\n" +
"दक्षिण भारत में भिन्न-भिन्न समयकाल में कई राजवंश चालुक्य, चेर, चोल, पल्लव तथा पांड्य चले | विज्ञान, कला, साहित्य, गणित, खगोल शास्त्र, प्राचीन प्रौद्योगिकी, धर्म, तथा दर्शन इन्हीं राजाओं के शासनकाल में फ़ले-फ़ूले |\n" +
"\n" +
"१२वीं शताब्दी के प्रारंभ में, भारत पर इस्लामी आक्रमणों के पश्चात, उत्तरी व केन्द्रीय भारत का अधिकांश भाग दिल्ली सल्तनत के शासनाधीन हो गया; और बाद में, अधिकांश उपमहाद्वीप मुगल वंश के अधीन । दक्षिण भारत में विजयनगर साम्राज्य शक्तिशाली निकला। हालांकि, विशेषतः तुलनात्मक रूप से, संरक्षित दक्षिण में अनेक राज्य शेष रहे अथवा अस्तित्व में आये।\n" +
"\n" +
"१७वीं शताब्दी के मध्यकाल में पुर्तगाल, डच, फ्रांस, ब्रिटेन सहित अनेकों यूरोपीय देशों, जो भारत से व्यापार करने के इच्छुक थे, उन्होनें देश की शासकीय अराजकता का लाभ प्राप्त किया। अंग्रेज दूसरे देशों से व्यापार के इच्छुक लोगों को रोकने में सफल रहे और १८४० तक लगभग संपूर्ण देश पर शासन करने में सफल हुए। १८५७ में ब्रिटिश इस्ट इंडिया कम्पनी के विरुद्ध असफल विद्रोह, जो कि भारतीय स्वतन्त्रता के प्रथम संग्राम से जाना जाता है, के बाद भारत का अधिकांश भाग सीधे अंग्रेजी शासन के प्रशासनिक नियंत्रण में आ गया।\n" +
"कोणार्क चक्र - १३वीं शताब्दी में बने उड़ीसा के सूर्य मन्दिर में स्थित, यह दुनिया के सब से प्रसिद्घ ऐतिहासिक स्थानों में से एक है।\n" +
"कोणार्क चक्र - १३वीं शताब्दी में बने उड़ीसा के सूर्य मन्दिर में स्थित, यह दुनिया के सब से प्रसिद्घ ऐतिहासिक स्थानों में से एक है।\n" +
"\n" +
"बीसवीं शताब्दी के प्रारंभ में एक लम्बे समय तक स्वतंत्रता प्राप्ति के लिये विशाल अहिंसावादी संघर्ष चला, जिसका नेतृत्‍व महात्मा गांधी, जो कि आधिकारिक रुप से आधुनिक भारत के राष्ट्रपिता से संबोधित किये जाते हैं, ने किया। ईसके साथ - साथ चंद्रशेखर आजाद, सरदार भगत सिंह, सुख देव, राजगुरू, नेताजी सुभाष चन्द्र बोस आदि के नेतृत्‍व मे चले क्रांतिकारी संघर्ष के फलस्वरुप 15 अगस्त, 1947 भारत ने अंग्रेजी शासन से पूर्णतः स्वतंत्रता प्राप्त की। तदुपरान्त 26 जनवरी, 1950 को भारत एक गणराज्य बना।\n" +
"\n" +
"एक बहुजातीय तथा बहुधर्मिक राष्ट्र होने के कारण भारत को समय-समय पर साम्प्रदायिक तथा जातीय विद्वेष का शिकार होना पङा है। क्षेत्रीय असंतोष तथा विद्रोह भी हालाँकि देश के अलग-अलग हिस्सों में होते रहे हैं, पर इसकी धर्मनिरपेक्षता तथा जनतांत्रिकता, केवल १९७५-७७ को छोड़, जब तत्कालीन प्रधानमंत्री इंदिरा गांधी ने आपातकाल की घोषणा कर दी थी, अक्षुण्य रही है।\n" +
"\n" +
"भारत के पड़ोसी राष्ट्रों के साथ अनसुलझे सीमा विवाद हैं। इसके कारण इसे छोटे पैमानों पर युद्ध का भी सामना करना पड़ा है। १९६२ में चीन के साथ, तथा १९४७, १९६५, १९७१ एवम् १९९९ में पाकिस्तान के साथ लड़ाइयाँ हो चुकी हैं।\n" +
"\n" +
"भारत गुटनिरपेक्ष आन्दोलन तथा संयुक्त राष्ट्र संघ के संस्थापक सदस्य देशों में से एक है।\n" +
"\n" +
"१९७४ में भारत ने अपना पहला परमाणु परीक्षण किया था जिसके बाद १९९८ में 5 और परीक्षण किये गये। १९९० के दशक में किये गये आर्थिक सुधारीकरण की बदौलत आज देश सबसे तेजी से विकासशील राष्ट्रों की सूची में आ गया है।\n" +
"\n" +
"[संपादित करें] सरकार\n" +
"मुख्य लेख: भारत सरकार\n" +
"\n" +
"भारत का संविधान भारत को एक सार्वभौमिक, समाजवादी, धर्मनिरपेक्ष, लोकतान्त्रिक गणराज्य की उपाधि देता है। भारत एक लोकतांत्रिक गणराज्य है, जिसका द्विसदनात्मक संसद वेस्टमिन्स्टर शैली के संसदीय प्रणाली द्वारा संचालित है। इसके शासन में तीन मुख्य अंग हैं: न्यायपालिका, कार्यपालिका और व्यवस्थापिका।\n" +
"\n" +
"राष्ट्रपति,जो कि राष्ट्र का प्रमुख है, has a largely ceremonial role. उसके कार्यों में संविधान का अभिव्यक्तिकरण, प्रस्तावित कानूनों (विधेयक) पर अपनी सहमति देना, और अध्यादेश जारी करना। वह भारतीय सेनाओं का मुख्य सेनापति भी है। राष्ट्रपति और उपराष्ट्रपति को एक अप्रत्यक्ष मतदान विधि द्वारा ५ वर्षों के लिये चुना जाता है। प्रधानमन्त्री सरकार का प्रमुख है और कार्यपालिका की सारी शक्तियाँ उसी के पास होती हैं। इसका चुनाव राजनैतिक पार्टियों या गठबन्धन के द्वारा प्रत्यक्ष विधि से संसद में बहुमत प्राप्त करने पर होता है। बहुमत बने रहने की स्थिति में इसका कार्यकाल ५ वर्षों का होता है। संविधान में किसी उप-प्रधानमंत्री का प्रावधान नहीं है पर समय-समय पर इसमें फेरबदल होता रहा है।\n" +
"\n" +
"व्यवस्थापिका संसद को कहते हैं जिसके दो सदन हैं - उच्चसदन राज्यसभा, or Council of States,और निम्नसदन लोकसभा. राज्यसभा में २४५ सदस्य होते हैं जबकि लोकसभा में ५५२। राज्यसभा के सदस्यों का चुनाव, अप्रत्यक्ष विधि से ६ वर्षों के लिये होता है, जबकि लोकसभा के सदस्यों का चुनाव प्रत्यक्ष विधि से, ५ वर्षों की अवधि के लिये। १८ वर्ष से अधिक उम्र के सभी भारतीय नागरिक मतदान कर सकते हैं।\n" +
"\n" +
"कार्यपालिका के तीन अंग हैं - राष्ट्रपति, उपराष्ट्रपति और मंत्रीमंडल। मंत्रीमंडल का प्रमुख प्रधानमंत्री होता है। मंत्रीमंडल के प्रत्येक मंत्री को संसद का सदस्य होना अनिवार्य है। कार्यपालिका, व्यवस्थापिका से नीचे होता है।\n" +
"\n" +
"भारत की स्वतंत्र न्यायपालिका का शीर्ष सर्वोच्च न्यायालय है, जिसका प्रधान प्रधान न्यायाधीश होता है। सर्वोच्च न्यायालय को अपने नये मामलों तथा उच्च न्यायालयों के विवादों, दोनो को देखने का अधिकार है। भारत में 21 उच्च न्यायालय हैं, जिनके अधिकार और उत्तरदायित्व सर्वोच्च न्यायालय की अपेक्षा सीमित हैं। न्यायपालिका और व्यवस्थापिका के परस्पर मतभेद या विवाद का सुलह राष्ट्रपति करता है।\n" +
"\n" +
"[संपादित करें] राजनीति\n" +
"मुख्य लेख: भारत की राजनीति\n" +
"भारत का मानचित्र\n" +
"भारत का मानचित्र\n" +
"\n" +
"स्वतंत्र भारत के इतिहास में उसकी सरकार मुख्य रूप से भारतीय राष्ट्रीय कान्ग्रेस पार्टी के हाथ में रही है। स्वतन्त्रतापूर्व भारत में सबसे बडे़ राजनीतिक संगठन होने के कारण काँग्रेस की, जिसका नेता मूल रूप से नेहरू - गाँधी परिवार का कोई न कोई सदस्य होता है, चालीस वर्षों तक राष्ट्रीय राजनीति में प्रमुख भूमिका रही। १९७७ में, पूर्व काँग्रेस शासन की इंदिरा गाँधी के आपातकाल लगाने के बाद एक संगठित विपक्ष जनता पार्टी ने चुनाव जीता और उसने अत्यधिक छोटी अवधि के लिये एक गैर-काँग्रेसी सरकार बनाई।\n" +
"\n" +
"१९९६ में, भारतीय जनता पार्टी (भाजपा), सबसे बड़े राजनीतिक संगठन के रूप में उभरी और उसने काँग्रेस के आगे इतिहास में पहली बार एक ठोस विपक्ष प्रस्तुत किया। परन्तु आगे चलकर सत्ता वास्तविक रूप से दो गठबन्धन सरकारों के हाथ में रही जिन्हें काँग्रेस का सम्पूर्ण समर्थन था। १९९९ में, भाजपा ने छोटे दलों को साथ लेकर राष्ट्रीय जनतान्त्रिक गठबन्धन (राजग) बनाया और ५ वर्षों तक कार्यकाल पूरा करने वाली वह पहली गैर-काँग्रेसी सरकार बनी। १९९९ से पूर्व का दशक अल्पावधि सरकारों का था, इन वर्षों में सात भिन्न सरकारें बनी। परन्तु १९९१ मे बनी काँग्रेस सरकार ने अपना ५ वर्ष का कार्यकाल पूरा किया और कई आर्थिक सुधार लाई।\n" +
"\n" +
"भारतीय आम चुनाव २००४ के फ़लस्वरूप काँग्रेस दल ने सर्वाधिक सीटें जीतीं और वह बड़े ही कम बहुमत से सत्ता में वापिस आई। काँग्रेस ने गठजोड़ द्वारा भारतीय कम्युनिस्ट पार्टी (मार्क्सवादी) और बहुत सी राज्य स्तरीय पार्टियों को साथ लेकर यूनाईटेड प्रोग्रेसिव अलायन्स (यूपीए) नामक सरकार बनाई। आज बीजेपी और उसके सहयोगी विपक्ष में मुख्य भूमिका निभाते हैं। राष्ट्रीय स्तर पर किसी विशेष पार्टी का दबदबा न होने और राज्य स्तर की कई पार्टियों के राष्ट्रीय स्तर पर उभरने के कारण १९९६ से बनी सभी सरकारों को राजनीतिक गठबन्धनों की आवश्यक्ता पड़ी है।\n" +
"\n" +
"[संपादित करें] राज्य और केन्द्रशासित प्रदेश\n" +
"मुख्य लेख: भारत के राज्य\n" +
"\n" +
"वर्तमान में भारत २८ राज्यों, ६ केन्द्रशासित प्रदेशों और राजधानी दिल्ली मे बँटा हुआ है। राज्यों की चुनी हुई स्वतंत्र सरकारें हैं जबकि केन्द्रशासित प्रदेशों पर केन्द्र द्वारा नियुक्त प्रबंधन शासन करता है, हालाँकि कुछ की लोकतांत्रिक सरकार भी है।\n" +
"\n" +
"अन्टार्कटिका और दक्षिण गंगोत्री और मैत्री पर भी भारत के वैज्ञानिक स्थल हैं यद्यपि अभी तक कोई वास्तविक आधिपत्य स्थापित नहीं किया गया है।\n" +
"\n" +
"[संपादित करें] भूगोल और मौसम\n" +
"मुख्य लेख: भारत का भूगोल\n" +
"हिमालय उत्तर में जम्मू और काश्मीर से लेकर पूर्व में अरुणाचल प्रदेश तक भारत की अधिकतर पूर्वी सीमा बनाता है\n" +
"हिमालय उत्तर में जम्मू और काश्मीर से लेकर पूर्व में अरुणाचल प्रदेश तक भारत की अधिकतर पूर्वी सीमा बनाता है\n" +
"\n" +
"भारत के अधिकतर उत्तरी और उत्तरपश्चिमीय प्रांत हिमालय की पहाङियों में स्थित हैं। शेष का उत्तरी, मध्य और पूर्वी भारत गंगा के उपजाऊ मैदानों से बना है। उत्तरी-पूर्वी पाकिस्तान से सटा हुआ, भारत के पश्चिम में थार का मरुस्थल है। दक्षिण भारत लगभग संपूर्ण ही दक्खन के पठार से निर्मित है। यह पठार पूर्वी और पश्चिमी घाटों के बीच स्थित है।\n" +
"\n" +
"कई महत्वपूर्ण और बड़ी नदियाँ जैसे गंगा, ब्रह्मपुत्र, यमुना, गोदावरी और कृष्णा भारत से होकर बहती हैं। इन नदियों के कारण उत्तर भारत की भूमि कृषि के लिए उपजाऊ है।\n" +
"\n" +
"भारत के विस्तार के साथ ही इसके मौसम में भी बहुत भिन्नता है। दक्षिण में जहाँ तटीय और गर्म वातावरण रहता है वहीं उत्तर में कड़ी सर्दी, पूर्व में जहाँ अधिक बरसात है वहीं पश्चिम में रेगिस्तान की शुष्कता। भारत में वर्षा मुख्यतया मानसून हवाओं से होती है।\n" +
"\n" +
"भारत के मुख्य शहर है - दिल्ली, मुम्बई, कोलकाता, चेन्नई, बंगलोर ( बेंगलुरु ) | ये भी देंखे - भारत के शहर\n" +
"\n" +
"[संपादित करें] अर्थव्यवस्था\n" +
"मुख्य लेख: भारत की अर्थव्यवस्था\n" +
"सूचना प्रोद्योगिकी (आईटी) भारत के सबसे अधिक विकासशील उद्योगों में से एक है, वार्षिक आय $२८५० करोड़ डालर, इन्फ़ोसिस, भारत की सबसे बडी आईटी कम्पनियों में से एक\n" +
"सूचना प्रोद्योगिकी (आईटी) भारत के सबसे अधिक विकासशील उद्योगों में से एक है, वार्षिक आय $२८५० करोड़ डालर, इन्फ़ोसिस, भारत की सबसे बडी आईटी कम्पनियों में से एक\n" +
"\n" +
"मुद्रा स्थानांतरण की दर से भारत की अर्थव्यवस्था विश्व में दसवें और क्रयशक्ति के अनुसार चौथे स्थान पर है। वर्ष २००३ में भारत में लगभग ८% की दर से आर्थिक वृद्धि हुई है जो कि विश्व की सबसे तीव्र बढती हुई अर्थव्यवस्थओं में से एक है। परंतु भारत की अत्यधिक जनसंख्या के कारण प्रतिव्यक्ति आय क्रयशक्ति की दर से मात्र ३२६२ अमेरिकन डॉलर है जो कि विश्व बैंक के अनुसार १२५वें स्थान पर है। भारत का विदेशी मुद्रा भंडार १४३ अरब अमेरिकन डॉलर है। मुम्बई भारत की आर्थिक राजधानी है और भारतीय रिजर्व बैंक और बॉम्बे स्टॉक एक्सचेंज का मुख्यालय भी। यद्यपि एक चौथाई भारतीय अभी भी निर्धनता रेखा से नीचे हैं, तीव्रता से बढ़ती हुई सूचना प्रोद्योगिकी कंपनियों के कारण मध्यमवर्गीय लोगों में वृद्धि हुई है। १९९१ के बाद भारत मे आर्थिक सुधार की नीति ने भारत के सर्वंगीण विकास मे बडी भूमिका निभाआयी।\n" +
"\n" +
"१९९१ के बाद भारत मे हुए [आर्थिक सुधार। आर्थिक सुधारोँ]] ने भारत के सर्वांगीण विकास मे बड़ी भूमिका निभाई। भारतीय अर्थव्यवस्था ने कृषि पर अपनी ऐतिहासिक निर्भरता कम की है और कृषि अब भारतीय सकल घरेलू उत्पाद (जीडीपी) का केवल २५% है। दूसरे प्रमुख उद्योग हैं उत्खनन, पेट्रोलियम, बहुमूल्य रत्न, चलचित्र, टेक्स्टाईल, सूचना प्रोद्योगिकी सेवाएं, तथा सजावटी वस्तुऐं। भारत के अधिकतर औद्योगिक क्षेत्र उसके प्रमुख महानगरों के आसपास स्थित हैं। हाल ही के वर्षों में $१७२० करोड़ अमरीकी डालर वार्षिक आय २००४-२००५ के साथ भारत सॉफ़्टवेयर और बीपीओ सेवाओं का सबसे बडा केन्द्र बनकर उभरा है। इसके साथ ही कई लघु स्तर के उद्योग भी हैं जोकि छोटे भारतीय गाँव और भारतीय नगरों के कई नागरिकों को जीविका प्रदान करते हैं। पिछले वषों मंे भारत में वित्तीय संस्थानो ने विकास में बड़ी भूमिका निभाई है।\n" +
"\n" +
"केवल तीस लाख विदेशी पर्यटकों के प्रतिवर्ष आने के बाद भी भार्तीय पर्यटन राष्ट्रीय आय का एक अति आवश्यक परन्तु कम विकसित स्त्रोत है। पर्यटन उद्योग भारत के जीडीपी का कुल ५.३% है। पर्यटन १०% भारतीय कामगारों को आजीविका देता है। वास्तविक संख्या ४.२ करोड है। आर्थिक रूप से देखा जाए तो पर्यटन भारतीय अर्थव्यवस्था को लगभग $४०० करोड डालर प्रदान करता है। भारत के प्रमुख व्यापार सहयोगी हैं अमरीका, जापान, चीन और संयुक्त अरब अमीरात।\n" +
"\n" +
"भारत के निर्यातों में कृषि उत्पाद, चाय, कपड़ा, बहुमूल्य रत्न व ज्वैलरी, साफ़्टवेयर सेवायें, इंजीनियरिंग सामान, रसायन तथा चमड़ा उत्पाद प्रमुख हैं जबकि उसके आयातों में कच्चा तेल, मशीनरी, बहुमूल्य रत्न, फ़र्टिलाइज़र तथा रसायन प्रमुख हैं। वर्ष २००४ के लिये भारत के कुल निर्यात $६९१८ करोड़ डालर के थे जबकि उसके आयात $८९३३ करोड डालर के थे।\n" +
"\n" +
"[संपादित करें] जनवृत्त\n" +
"मुख्य लेख: भारत के लोग\n" +
"\n" +
"भारत चीन के बाद विश्व का दूसरा सबसे बड़ी जनसंख्या वाला देश है। भारत की विभिन्नताओं से भरी जनता में भाषा, जाति और धर्म, सामाजिक और राजनीतिक संगठन के मुख्य शत्रु हैं।\n" +
"हिन्दुत्व भारत का सबसे बङा धर्म है - इस चित्र मे गोआ का एक मंदिर दर्शाया गया है\n" +
"हिन्दुत्व भारत का सबसे बङा धर्म है - इस चित्र मे गोआ का एक मंदिर दर्शाया गया है\n" +
"\n" +
"भारत में ६४.८ प्रतिशत साक्षरता है जिसमे से ७५.३ % पुरुष और ५३.७% स्त्रियाँ साक्षर है। लिंग अनुपात की दृष्टि से भारत में प्रत्येक १००० पुरुषों के पीछे मात्र ९३३ महिलायें हैं। कार्य भागीदारी दर (कुल जनसंख्या मे कार्य करने वालों का भाग) ३९.१% है। पुरुषों के लिये यह दर ५१.७% और स्त्रियों के लिये २५.६% है। भारत की १००० जनसंख्या में २२.३२ जन्मों के साथ बढती जनसंख्या के आधे लोग २२.६६ वर्ष से कम आयु के हैं।\n" +
"\n" +
"यद्यपि भारत की ८०.५ प्रतिशत जनसंख्या हिन्दू है, १३.४ प्रतिशत जनसंख्या के साथ भारत विश्व में मुसलमानों की संख्या में भी इंडोनेशिया के बाद दूसरे स्थान पर है। अन्य धर्मावलम्बियों में ईसाई (२.३३ %), सिख (१.८४ %), बौद्ध (०.७६ %), जैन (०.४० %), अय्यावलि (०.१२ %), यहूदी, पारसी, अहमदी और बहाई आदि सम्मिलित हैं।\n" +
"\n" +
"भारत दो मुख्य भाषा सूत्रों, आर्यन् और द्रविङियन्, का भी स्त्रोत है (साइटेसन चाहिए)। भारत का संविधान कुल २३ भाषाओं को मान्यता देता है। हिन्दी और अंग्रेजी केन्द्रीय सरकार द्वारा सरकारी कामकाज के लिये उपयोग की जाती है। संस्कृत और तमिल जैसी अति प्राचीन भाषाएं भारत में ही जन्मी हैं। कुल मिलाकर भारत में १६५२ से भी अधिक भाषाएं एवं बोलियाँ बोली जातीं हैं।\n" +
"\n" +
"[संपादित करें] संस्कृति\n" +
"मुख्य लेख: भारतीय संस्कृति\n" +
"ताजमहल विश्व के सबसे प्रसिद्ध पर्यटक स्थलों में गिना जाता है।\n" +
"ताजमहल विश्व के सबसे प्रसिद्ध पर्यटक स्थलों में गिना जाता है।\n" +
"\n" +
"भारत की सांस्कृतिक धरोहर बहुत संपन्न है। यहां की संस्कृति अनोखी है, और वर्षों से इसके कई अवयव अबतक अक्षुण्य हैं। आक्रमणकारियों तथा प्रवासियों से विभिन्न चीजों को समेटकर यह एक मिश्रित संस्कृति बन गई है। आधुनिक भारत का समाज, भाषाएं, रीति-रिवाज इत्यादि इसका प्रमाण हैं। ताजमहल और अन्य उदाहरण, इस्लाम प्रभावित स्थापत्य कला के अतिसुन्दर नमूने हैं।\n" +
"गुम्पा नृत्य एक तिब्बती बौद्ध समाज का सिक्किम में छिपा नृत्य है। यह बौद्ध नव बर्ष में है।\n" +
"गुम्पा नृत्य एक तिब्बती बौद्ध समाज का सिक्किम में छिपा नृत्य है। यह बौद्ध नव बर्ष में है।\n" +
"\n" +
"भारतीय समाज बहुधर्मिक, बहुभाषी तथा मिश्र-सांस्कृतिक है। पारंपरिक भारतीय पारिवारिक मूल्यों को काफी आदर की दृष्टि से देखा जाता है।\n" +
"\n" +
"विभिन्न धर्मों के इस भूभाग पर कई मनभावन पर्व त्यौहार मनाए जाते हैं - दिवाली, होली, दशहरा. पोंगल तथा ओणम . ईद-उल-फितर, मुहर्रम, क्रिसमस, ईस्टर आदि भी काफ़ी लोकप्रिय हैं।\n" +
"\n" +
"हालाँकि हॉकी देश का राष्ट्रीय खेल है, क्रिकेट सबसे अधिक लोकप्रिय है। वर्तमान में फुटबॉल, हॉकी तथा टेनिस में भी बहुत भारतीयों की अभिरुचि है। देश की राष्ट्रीय क्रिकेट टीम में 1983 में एक बार विश्व कप भी जीता है। इसके अतिरिक्त वर्ष 2003 में वह विश्व कप के फाइनल तक पहुँचा था। 1930 तथा 40 के दशक में हाकी में भारत अपने चरम पर था। मेजर ध्यानचंद ने हॉकी में भारत को बहुत प्रसिद्धि दिलाई और एक समय भारत ने अमरीका को 24-0 से हराया था जो अब तर विश्व कीर्तिमान है। शतरंज के जनक देश भारत के खिलाड़ी शतरंज में भी अच्छा प्रदर्शन करते आए हैं।\n" +
"\n" +
"भारतीय खानपान बहुत ही समृद्ध है। शाकाहारी तथा मांसाहारी दोनो तरह का खाना पसन्द किया जाता है। भारतीय व्यंजन विदेशों में भी बहुत पसन्द किए जाते है।\n" +
"\n" +
"भारत में संगीत तथा नृत्य की अपनी शैलियां भी विकसित हुईं जो बहुत ही लोकप्रिय हैं। भरतनाट्यम, ओडिसी, कत्थक प्रसिद्ध भारतीय नृत्य शैली है। हिन्दुस्तानी संगीत तथा कर्नाटक संगीत भारतीय परंपरागत संगीत की दो मुख्य धाराएं हैं।\n" +
"\n" +
"वैश्वीकरण के इस युग में शेष विश्व की तरह भारतीय समाज पर भी अंग्रेजी तथा यूरोपीय प्रभाव पड़ रहा है। बाहरी लोगों की खूबियों को अपनाने की भारतीय परंपरा का नया दौर कई भारतीयों की दृष्टि में अनुचित है। एक खुले समाज के जीवन का यत्न कर रहे लोगों को मध्यमवर्गीय तथा वरिष्ठ नागरिकों की उपेक्षा का शिकार होना पड़ता है। कुछ लोग इसे भारतीय पारंपरिक मूल्यों का हनन मानते हैं। विज्ञान तथा साहित्य में अधिक प्रगति ना कर पाने की वजह से भारतीय समाज यूरोपीय लोगों पर निर्भर होता जा रहा है। ऐसे समय में लोग विदेशी अविष्कारों का भारत में प्रयोग अनुचित भी समझते हैं। हालाँकि ऐसे कई लोग है जो ऐसा विचार नहीं रखते।\n" +
"\n" +
"[संपादित करें] यह भी देखें\n" +
"\n" +
"    * दक्षिण भारत\n" +
"    * उत्तर पूर्वी भारत\n" +
"    * भारत की भाषाएँ\n" +
"\n" +
"\n" +
"[संपादित करें] बाहरी कड़ियाँ\n" +
"\n" +
"सरकार (हिन्दी)\n" +
"\n" +
"    * भारत का राष्ट्रीय पोर्टल\n" +
"\n" +
"सरकार (अंग्रेज़ी)\n" +
"\n" +
"    * भारतीय सरकार का सरकारी वैबसाइट\n" +
"    * भारतीय सरकार का वेबसाइट का सरकारी निर्देशिका\n" +
"\n" +
"सेनापति निर्देश (अंग्रेज़ी)\n" +
"\n" +
"    * सीआईए में भारत निबन्ध\n" +
"    * एन्साक्लोपीडिया ब्रिटैनिका का भारत निबन्ध\n" +
"    * बीबीसी का भारत निबन्ध\n" +
"\n" +
"भारत का देश नक्शा\n" +
"\n" +
"सैटेलाइट चित्र (अंग्रेज़ी)\n" +
"\n" +
"    * गूगल मानचित्र से भारत का सैटेलाइट चित्र\n" +
"\n" +
"अन्य (अंग्रेज़ी)\n" +
"\n" +
"    * विकिभ्रमण का भारत निबन्ध\n" +
"    * भारत ओपेन डायरैक्टरी प्रॉजेक्ट में\n" +
"    * भारत यात्रा - सामूहिक यात्रा ब्लॉग\n";

var english =
"English language\n" +
"From Wikipedia, the free encyclopedia\n" +
"• Learn more about citing Wikipedia •\n" +
"Jump to: navigation, search\n" +
"	Editing of this article by unregistered or newly registered users is currently disabled.\n" +
"If you cannot edit this article and you wish to make a change, you can discuss changes on the talk page, request unprotection, log in, or create an account.\n" +
"English  \n" +
"Pronunciation: 	/ˈɪŋɡlɪʃ/[37]\n" +
"Spoken in: 	Listed in the article\n" +
"Total speakers: 	First language: 309[38] – 380 million[3]\n" +
"Second language: 199[39] – 600 million[40]\n" +
"Overall: 1.8 billion[41] \n" +
"Ranking: 	3 (native speakers)[9][10]\n" +
"Total: 1 or 2 [11]\n" +
"Language family: 	Indo-European\n" +
" Germanic\n" +
"  West Germanic\n" +
"   Anglo–Frisian\n" +
"    Anglic\n" +
"     English \n" +
"Writing system: 	Latin (English variant) \n" +
"Official status\n" +
"Official language of: 	53 countries\n" +
"Flag of the United Nations United Nations\n" +
"Regulated by: 	no official regulation\n" +
"Language codes\n" +
"ISO 639-1: 	en\n" +
"ISO 639-2: 	eng\n" +
"ISO 639-3: 	eng \n" +
"World countries, states, and provinces where English is a primary language are dark blue; countries, states and provinces where it is an official but not a primary language are light blue. English is also one of the official languages of the European Union.\n" +
"Note: This page may contain IPA phonetic symbols in Unicode. See IPA chart for English for an English-​based pronunciation key.\n" +
"\n" +
"English is a West Germanic language originating in England, and the first language for most people in Australia, Canada, the Commonwealth Caribbean, Ireland, New Zealand, the United Kingdom and the United States of America (also commonly known as the Anglosphere). It is used extensively as a second language and as an official language throughout the world, especially in Commonwealth countries such as India, Sri Lanka, Pakistan and South Africa, and in many international organisations.\n" +
"\n" +
"Modern English is sometimes described as the global lingua franca.[1][2] English is the dominant international language in communications, science, business, aviation, entertainment, radio and diplomacy.[3] The influence of the British Empire is the primary reason for the initial spread of the language far beyond the British Isles.[4] Following World War II, the growing economic and cultural influence of the United States has significantly accelerated the spread of the language.\n" +
"\n" +
"A working knowledge of English is required in certain fields, professions, and occupations. As a result over a billion people speak English at least at a basic level (see English language learning and teaching). English is one of six official languages of the United Nations.\n" +
"Contents\n" +
"[hide]\n" +
"\n" +
"    * 1 History\n" +
"    * 2 Classification and related languages\n" +
"    * 3 Geographical distribution\n" +
"          o 3.1 English as a global language\n" +
"          o 3.2 Dialects and regional varieties\n" +
"          o 3.3 Constructed varieties of English\n" +
"    * 4 Phonology\n" +
"          o 4.1 Vowels\n" +
"                + 4.1.1 See also\n" +
"          o 4.2 Consonants\n" +
"                + 4.2.1 Voicing and aspiration\n" +
"          o 4.3 Supra-segmental features\n" +
"                + 4.3.1 Tone groups\n" +
"                + 4.3.2 Characteristics of intonation\n" +
"    * 5 Grammar\n" +
"    * 6 Vocabulary\n" +
"          o 6.1 Number of words in English\n" +
"          o 6.2 Word origins\n" +
"                + 6.2.1 Dutch origins\n" +
"                + 6.2.2 French origins\n" +
"    * 7 Writing system\n" +
"          o 7.1 Basic sound-letter correspondence\n" +
"          o 7.2 Written accents\n" +
"    * 8 Formal written English\n" +
"    * 9 Basic and simplified versions\n" +
"    * 10 Notes\n" +
"    * 11 References\n" +
"    * 12 See also\n" +
"    * 13 External links\n" +
"          o 13.1 Dictionaries\n" +
"\n" +
"History\n" +
"\n" +
"    Main article: History of the English language\n" +
"\n" +
"English is an Anglo-Frisian language. Germanic-speaking peoples from northwest Germany (Saxons and Angles) and Jutland (Jutes) invaded what is now known as Eastern England around the fifth century AD. It is a matter of debate whether the Old English language spread by displacement of the original population, or the native Celts gradually adopted the language and culture of a new ruling class, or a combination of both of these processes (see Sub-Roman Britain).\n" +
"\n" +
"Whatever their origin, these Germanic dialects eventually coalesced to a degree (there remained geographical variation) and formed what is today called Old English. Old English loosely resembles some coastal dialects in what are now northwest Germany and the Netherlands (i.e., Frisia). Throughout the history of written Old English, it retained a synthetic structure closer to that of Proto-Indo-European, largely adopting West Saxon scribal conventions, while spoken Old English became increasingly analytic in nature, losing the more complex noun case system, relying more heavily on prepositions and fixed word order to convey meaning. This is evident in the Middle English period, when literature was to an increasing extent recorded with spoken dialectal variation intact, after written Old English lost its status as the literary language of the nobility. It is postulated that the early development of the language was influenced by a Celtic substratum.[5][6] Later, it was influenced by the related North Germanic language Old Norse, spoken by the Vikings who settled mainly in the north and the east coast down to London, the area known as the Danelaw.\n" +
"\n" +
"The Norman Conquest of England in 1066 profoundly influenced the evolution of the language. For about 300 years after this, the Normans used Anglo-Norman, which was close to Old French, as the language of the court, law and administration. By the fourteenth century, Anglo-Norman borrowings had contributed roughly 10,000 words to English, of which 75% remain in use. These include many words pertaining to the legal and administrative fields, but also include common words for food, such as mutton[7] and beef[8]. The Norman influence gave rise to what is now referred to as Middle English. Later, during the English Renaissance, many words were borrowed directly from Latin (giving rise to a number of doublets) and Greek, leaving a parallel vocabulary that persists into modern times. By the seventeenth century there was a reaction in some circles against so-called inkhorn terms.\n" +
"\n" +
"During the fifteenth century, Middle English was transformed by the Great Vowel Shift, the spread of a prestigious South Eastern-based dialect in the court, administration and academic life, and the standardising effect of printing. Early Modern English can be traced back to around the Elizabethan period.\n" +
"\n" +
"Classification and related languages\n" +
"\n" +
"The English language belongs to the western sub-branch of the Germanic branch of the Indo-European family of languages.\n" +
"\n" +
"The question as to which is the nearest living relative of English is a matter of discussion. Apart from such English-lexified creole languages such as Tok Pisin, Scots (spoken primarily in Scotland and parts of Northern Ireland) is not a Gaelic language, but is part of the English family of languages: both Scots and modern English are descended from Old English, also known as Anglo-Saxon. The closest relative to English after Scots is Frisian, which is spoken in the Northern Netherlands and Northwest Germany. Other less closely related living West Germanic languages include German, Low Saxon, Dutch, and Afrikaans. The North Germanic languages of Scandinavia are less closely related to English than the West Germanic languages.\n" +
"\n" +
"Many French words are also intelligible to an English speaker (though pronunciations are often quite different) because English absorbed a large vocabulary from Norman and French, via Anglo-Norman after the Norman Conquest and directly from French in subsequent centuries. As a result, a large portion of English vocabulary is derived from French, with some minor spelling differences (word endings, use of old French spellings, etc.), as well as occasional divergences in meaning, in so-called \"faux amis\", or false friends.\n" +
"\n" +
"Geographical distribution\n" +
"\n" +
"    See also: List of countries by English-speaking population\n" +
"\n" +
"Over 380 million people speak English as their first language. English today is probably the third largest language by number of native speakers, after Mandarin Chinese and Spanish.[9][10] However, when combining native and non-native speakers it is probably the most commonly spoken language in the world, though possibly second to a combination of the Chinese Languages, depending on whether or not distinctions in the latter are classified as \"languages\" or \"dialects.\"[11][12] Estimates that include second language speakers vary greatly from 470 million to over a billion depending on how literacy or mastery is defined.[13][14] There are some who claim that non-native speakers now outnumber native speakers by a ratio of 3 to 1.[15]\n" +
"\n" +
"The countries with the highest populations of native English speakers are, in descending order: United States (215 million),[16] United Kingdom (58 million),[17] Canada (17.7 million),[18] Australia (15 million),[19] Ireland (3.8 million),[17] South Africa (3.7 million),[20] and New Zealand (3.0-3.7 million).[21] Countries such as Jamaica and Nigeria also have millions of native speakers of dialect continuums ranging from an English-based creole to a more standard version of English. Of those nations where English is spoken as a second language, India has the most such speakers ('Indian English') and linguistics professor David Crystal claims that, combining native and non-native speakers, India now has more people who speak or understand English than any other country in the world.[22] Following India is the People's Republic of China.[23]\n" +
"Distribution of native English speakers by country (Crystal 1997)\n" +
"Distribution of native English speakers by country (Crystal 1997)\n" +
"	Country 	Native speakers\n" +
"1 	USA 	214,809,000[16]\n" +
"2 	UK 	58,200,000[17]\n" +
"3 	Canada 	17,694,830[18]\n" +
"4 	Australia 	15,013,965[19]\n" +
"5 	Ireland 	4,200,000+ (Approx)[17]\n" +
"6 	South Africa 	3,673,203[20]\n" +
"7 	New Zealand 	3,500,000+ (Approx)[21]\n" +
"8 	Singapore 	665,087[24]\n" +
"\n" +
"English is the primary language in Anguilla, Antigua and Barbuda, Australia (Australian English), the Bahamas, Barbados, Bermuda, Belize, the British Indian Ocean Territory, the British Virgin Islands, Canada (Canadian English), the Cayman Islands, Dominica, the Falkland Islands, Gibraltar, Grenada, Guernsey (Guernsey English), Guyana, Ireland (Hiberno-English), Isle of Man (Manx English), Jamaica (Jamaican English), Jersey, Montserrat, Nauru, New Zealand (New Zealand English), Pitcairn Islands, Saint Helena, Saint Lucia, Saint Kitts and Nevis, Saint Vincent and the Grenadines, Singapore, South Georgia and the South Sandwich Islands, Trinidad and Tobago, the Turks and Caicos Islands, the United Kingdom, the U.S. Virgin Islands, and the United States (various forms of American English).\n" +
"\n" +
"In many other countries, where English is not the most spoken language, it is an official language; these countries include Botswana, Cameroon, Fiji, the Federated States of Micronesia, Ghana, Gambia, Hong Kong, India, Kiribati, Lesotho, Liberia, Kenya, Madagascar, Malta, the Marshall Islands, Namibia, Nigeria, Pakistan, Papua New Guinea, the Philippines, Puerto Rico, Rwanda, the Solomon Islands, Samoa, Sierra Leone, Singapore, Sri Lanka, Swaziland, Tanzania, Uganda, Zambia, and Zimbabwe. It is also one of the 11 official languages that are given equal status in South Africa (\"South African English\"). English is also an important language in several former colonies or current dependent territories of the United Kingdom and the United States, such as in Hong Kong and Mauritius.\n" +
"\n" +
"English is not an official language in either the United States or the United Kingdom.[25][26] Although the United States federal government has no official languages, English has been given official status by 30 of the 50 state governments.[27]\n" +
"\n" +
"English as a global language\n" +
"\n" +
"    See also: English on the Internet and global language\n" +
"\n" +
"Because English is so widely spoken, it has often been referred to as a \"global language\", the lingua franca of the modern era.[2] While English is not an official language in many countries, it is currently the language most often taught as a second language around the world. Some linguists believe that it is no longer the exclusive cultural sign of \"native English speakers\", but is rather a language that is absorbing aspects of cultures worldwide as it continues to grow. It is, by international treaty, the official language for aerial and maritime communications, as well as one of the official languages of the European Union, the United Nations, and most international athletic organisations, including the International Olympic Committee.\n" +
"\n" +
"English is the language most often studied as a foreign language in the European Union (by 89% of schoolchildren), followed by French (32%), German (18%), and Spanish (8%).[28] In the EU, a large fraction of the population reports being able to converse to some extent in English. Among non-English speaking countries, a large percentage of the population claimed to be able to converse in English in the Netherlands (87%), Sweden (85%), Denmark (83%), Luxembourg (66%), Finland (60%), Slovenia (56%), Austria (53%), Belgium (52%), and Germany (51%). [29] Norway and Iceland also have a large majority of competent English-speakers.\n" +
"\n" +
"Books, magazines, and newspapers written in English are available in many countries around the world. English is also the most commonly used language in the sciences.[2] In 1997, the Science Citation Index reported that 95% of its articles were written in English, even though only half of them came from authors in English-speaking countries.\n" +
"\n" +
"Dialects and regional varieties\n" +
"\n" +
"    Main article: List of dialects of the English language\n" +
"\n" +
"The expansion of the British Empire and—since WWII—the primacy of the United States have spread English throughout the globe.[2] Because of that global spread, English has developed a host of English dialects and English-based creole languages and pidgins.\n" +
"\n" +
"The major varieties of English include, in most cases, several subvarieties, such as Cockney slang within British English; Newfoundland English within Canadian English; and African American Vernacular English (\"Ebonics\") and Southern American English within American English. English is a pluricentric language, without a central language authority like France's Académie française; and, although no variety is clearly considered the only standard, there are a number of accents considered to be more prestigious, such as Received Pronunciation in Britain.\n" +
"\n" +
"Scots developed — largely independently — from the same origins, but following the Acts of Union 1707 a process of language attrition began, whereby successive generations adopted more and more features from English causing dialectalisation. Whether it is now a separate language or a dialect of English better described as Scottish English is in dispute. The pronunciation, grammar and lexis of the traditional forms differ, sometimes substantially, from other varieties of English.\n" +
"\n" +
"Because of the wide use of English as a second language, English speakers have many different accents, which often signal the speaker's native dialect or language. For the more distinctive characteristics of regional accents, see Regional accents of English speakers, and for the more distinctive characteristics of regional dialects, see List of dialects of the English language.\n" +
"\n" +
"Just as English itself has borrowed words from many different languages over its history, English loanwords now appear in a great many languages around the world, indicative of the technological and cultural influence of its speakers. Several pidgins and creole languages have formed using an English base, such as Jamaican Creole, Nigerian Pidgin, and Tok Pisin. There are many words in English coined to describe forms of particular non-English languages that contain a very high proportion of English words. Franglais, for example, is used to describe French with a very high English word content; it is found on the Channel Islands. Another variant, spoken in the border bilingual regions of Québec in Canada, is called FrEnglish.\n" +
"\n" +
"Constructed varieties of English\n" +
"\n" +
"    * Basic English is simplified for easy international use. It is used by manufacturers and other international businesses to write manuals and communicate. Some English schools in Asia teach it as a practical subset of English for use by beginners.\n" +
"    * Special English is a simplified version of English used by the Voice of America. It uses a vocabulary of only 1500 words.\n" +
"    * English reform is an attempt to improve collectively upon the English language.\n" +
"    * Seaspeak and the related Airspeak and Policespeak, all based on restricted vocabularies, were designed by Edward Johnson in the 1980s to aid international cooperation and communication in specific areas. There is also a tunnelspeak for use in the Channel Tunnel.\n" +
"    * English as a lingua franca for Europe and Euro-English are concepts of standardising English for use as a second language in continental Europe.\n" +
"    * Manually Coded English — a variety of systems have been developed to represent the English language with hand signals, designed primarily for use in deaf education. These should not be confused with true sign languages such as British Sign Language and American Sign Language used in Anglophone countries, which are independent and not based on English.\n" +
"    * E-Prime excludes forms of the verb to be.\n" +
"\n" +
"Euro-English (also EuroEnglish or Euro-English) terms are English translations of European concepts that are not native to English-speaking countries. Due to the United Kingdom's (and even the Republic of Ireland's) involvement in the European Union, the usage focuses on non-British concepts. This kind of Euro-English was parodied when English was \"made\" one of the constituent languages of Europanto.\n" +
"\n" +
"Phonology\n" +
"\n" +
"    Main article: English phonology\n" +
"\n" +
"Vowels\n" +
"IPA 	Description 	word\n" +
"monophthongs\n" +
"i/iː 	Close front unrounded vowel 	bead\n" +
"ɪ 	Near-close near-front unrounded vowel 	bid\n" +
"ɛ 	Open-mid front unrounded vowel 	bed\n" +
"æ 	Near-open front unrounded vowel 	bad\n" +
"ɒ 	Open back rounded vowel 	bod 1\n" +
"ɔ 	Open-mid back rounded vowel 	pawed 2\n" +
"ɑ/ɑː 	Open back unrounded vowel 	bra\n" +
"ʊ 	Near-close near-back rounded vowel 	good\n" +
"u/uː 	Close back rounded vowel 	booed\n" +
"ʌ/ɐ 	Open-mid back unrounded vowel, Near-open central vowel 	bud\n" +
"ɝ/ɜː 	Open-mid central unrounded vowel 	bird 3\n" +
"ə 	Schwa 	Rosa's 4\n" +
"ɨ 	Close central unrounded vowel 	roses 5\n" +
"diphthongs\n" +
"e(ɪ)/eɪ 	Close-mid front unrounded vowel\n" +
"Close front unrounded vowel 	bayed 6\n" +
"o(ʊ)/əʊ 	Close-mid back rounded vowel\n" +
"Near-close near-back rounded vowel 	bode 6\n" +
"aɪ 	Open front unrounded vowel\n" +
"Near-close near-front unrounded vowel 	cry\n" +
"aʊ 	Open front unrounded vowel\n" +
"Near-close near-back rounded vowel 	bough\n" +
"ɔɪ 	Open-mid back rounded vowel\n" +
"Close front unrounded vowel 	boy\n" +
"ʊɝ/ʊə 	Near-close near-back rounded vowel\n" +
"Schwa 	boor 9\n" +
"ɛɝ/ɛə 	Open-mid front unrounded vowel\n" +
"Schwa 	fair 10\n" +
"\n" +
"Notes:\n" +
"\n" +
"It is the vowels that differ most from region to region.\n" +
"\n" +
"Where symbols appear in pairs, the first corresponds to American English, General American accent; the second corresponds to British English, Received Pronunciation.\n" +
"\n" +
"   1. American English lacks this sound; words with this sound are pronounced with /ɑ/ or /ɔ/.\n" +
"   2. Many dialects of North American English do not have this vowel. See Cot-caught merger.\n" +
"   3. The North American variation of this sound is a rhotic vowel.\n" +
"   4. Many speakers of North American English do not distinguish between these two unstressed vowels. For them, roses and Rosa's are pronounced the same, and the symbol usually used is schwa /ə/.\n" +
"   5. This sound is often transcribed with /i/ or with /ɪ/.\n" +
"   6. The diphthongs /eɪ/ and /oʊ/ are monophthongal for many General American speakers, as /eː/ and /oː/.\n" +
"   7. The letter <U> can represent either /u/ or the iotated vowel /ju/. In BRP, if this iotated vowel /ju/ occurs after /t/, /d/, /s/ or /z/, it often triggers palatalization of the preceding consonant, turning it to /ʨ/, /ʥ/, /ɕ/ and /ʑ/ respectively, as in tune, during, sugar, and azure. In American English, palatalization does not generally happen unless the /ju/ is followed by r, with the result that /(t, d,s, z)jur/ turn to /tʃɚ/, /dʒɚ/, /ʃɚ/ and /ʒɚ/ respectively, as in nature, verdure, sure, and treasure.\n" +
"   8. Vowel length plays a phonetic role in the majority of English dialects, and is said to be phonemic in a few dialects, such as Australian English and New Zealand English. In certain dialects of the modern English language, for instance General American, there is allophonic vowel length: vowel phonemes are realized as long vowel allophones before voiced consonant phonemes in the coda of a syllable. Before the Great Vowel Shift, vowel length was phonemically contrastive.\n" +
"   9. This sound only occurs in non-rhotic accents. In some accents, this sound may be, instead of /ʊə/, /ɔ:/. See pour-poor merger.\n" +
"  10. This sound only occurs in non-rhotic accents. In some accents, the schwa offglide of /ɛə/ may be dropped, monophthising and lengthening the sound to /ɛ:/.\n" +
"\n" +
"See also\n" +
"\n" +
"    * International Phonetic Alphabet for English for more vowel charts.\n" +
"\n" +
"Consonants\n" +
"\n" +
"This is the English Consonantal System using symbols from the International Phonetic Alphabet (IPA).\n" +
"  	bilabial 	labio-\n" +
"dental 	dental 	alveolar 	post-\n" +
"alveolar 	palatal 	velar 	glottal\n" +
"plosive 	p  b 	  	  	t  d 	  	  	k  ɡ 	 \n" +
"nasal 	m 	  	  	n 	  	  	ŋ 1 	 \n" +
"flap 	  	  	  	ɾ 2 	  	  	  	 \n" +
"fricative 	  	f  v 	θ  ð 3 	s  z 	ʃ  ʒ 4 	ç 5 	x 6 	h\n" +
"affricate 	  	  	  	  	tʃ  dʒ 4 	  	  	 \n" +
"approximant 	  	  	  	ɹ 4 	  	j 	  	 \n" +
"lateral approximant 	  	  	  	l 	  	  	  	 \n" +
"  	labial-velar\n" +
"approximant 	ʍ  w 7\n" +
"\n" +
"   1. The velar nasal [ŋ] is a non-phonemic allophone of /n/ in some northerly British accents, appearing only before /k/ and /g/. In all other dialects it is a separate phoneme, although it only occurs in syllable codas.\n" +
"   2. The alveolar flap [ɾ] is an allophone of /t/ and /d/ in unstressed syllables in North American English and Australian English.[30] This is the sound of tt or dd in the words latter and ladder, which are homophones for many speakers of North American English. In some accents such as Scottish English and Indian English it replaces /ɹ/. This is the same sound represented by single r in most varieties of Spanish.\n" +
"   3. In some dialects, such as Cockney, the interdentals /θ/ and /ð/ are usually merged with /f/ and /v/, and in others, like African American Vernacular English, /ð/ is merged with dental /d/. In some Irish varieties, /θ/ and /ð/ become the corresponding dental plosives, which then contrast with the usual alveolar plosives.\n" +
"   4. The sounds /ʃ/, /ʒ/, and /ɹ/ are labialised in some dialects. Labialisation is never contrastive in initial position and therefore is sometimes not transcribed. Most speakers of General American realize <r> (always rhoticized) as the retroflex approximant /ɻ/, whereas the same is realized in Scottish English, etc. as the alveolar trill.\n" +
"   5. The voiceless palatal fricative /ç/ is in most accents just an allophone of /h/ before /j/; for instance human /çjuːmən/. However, in some accents (see this), the /j/ is dropped, but the initial consonant is the same.\n" +
"   6. The voiceless velar fricative /x/ is used only by Scottish or Welsh speakers of English for Scots/Gaelic words such as loch /lɒx/ or by some speakers for loanwords from German and Hebrew like Bach /bax/ or Chanukah /xanuka/. In some dialects such as Scouse (Liverpool) either [x] or the affricate [kx] may be used as an allophone of /k/ in words such as docker [dɒkxə]. Most native speakers have a great deal of trouble pronouncing it correctly when learning a foreign language. Most speakers use the sounds [k] and [h] instead.\n" +
"   7. Voiceless w [ʍ] is found in Scottish and Irish English, as well as in some varieties of American, New Zealand, and English English. In most other dialects it is merged with /w/, in some dialects of Scots it is merged with /f/.\n" +
"\n" +
"Voicing and aspiration\n" +
"\n" +
"Voicing and aspiration of stop consonants in English depend on dialect and context, but a few general rules can be given:\n" +
"\n" +
"    * Voiceless plosives and affricates (/ p/, / t/, / k/, and / tʃ/) are aspirated when they are word-initial or begin a stressed syllable — compare pin [pʰɪn] and spin [spɪn], crap [kʰɹ̥æp] and scrap [skɹæp].\n" +
"          o In some dialects, aspiration extends to unstressed syllables as well.\n" +
"          o In other dialects, such as Indo-Pakistani English, all voiceless stops remain unaspirated.\n" +
"    * Word-initial voiced plosives may be devoiced in some dialects.\n" +
"    * Word-terminal voiceless plosives may be unreleased or accompanied by a glottal stop in some dialects (e.g. many varieties of American English) — examples: tap [tʰæp̚], sack [sæk̚].\n" +
"    * Word-terminal voiced plosives may be devoiced in some dialects (e.g. some varieties of American English) — examples: sad [sæd̥], bag [bæɡ̊]. In other dialects they are fully voiced in final position, but only partially voiced in initial position.\n" +
"\n" +
"Supra-segmental features\n" +
"\n" +
"Tone groups\n" +
"\n" +
"English is an intonation language. This means that the pitch of the voice is used syntactically, for example, to convey surprise and irony, or to change a statement into a question.\n" +
"\n" +
"In English, intonation patterns are on groups of words, which are called tone groups, tone units, intonation groups or sense groups. Tone groups are said on a single breath and, as a consequence, are of limited length, more often being on average five words long or lasting roughly two seconds. For example:\n" +
"\n" +
"    - /duː juː niːd ˈɛnɪˌθɪŋ/ Do you need anything?\n" +
"    - /aɪ dəʊnt | nəʊ/ I don't, no\n" +
"    - /aɪ dəʊnt nəʊ/ I don't know (contracted to, for example, - /aɪ dəʊnəʊ/ or /aɪ dənəʊ/ I dunno in fast or colloquial speech that de-emphasises the pause between don't and know even further)\n" +
"\n" +
"Characteristics of intonation\n" +
"\n" +
"English is a strongly stressed language, in that certain syllables, both within words and within phrases, get a relative prominence/loudness during pronunciation while the others do not. The former kind of syllables are said to be accentuated/stressed and the latter are unaccentuated/unstressed. All good dictionaries of English mark the accentuated syllable(s) by either placing an apostrophe-like ( ˈ ) sign either before (as in IPA, Oxford English Dictionary, or Merriam-Webster dictionaries) or after (as in many other dictionaries) the syllable where the stress accent falls. In general, for a two-syllable word in English, it can be broadly said that if it is a noun or an adjective, the first syllable is accentuated; but if it is a verb, the second syllable is accentuated.\n" +
"\n" +
"Hence in a sentence, each tone group can be subdivided into syllables, which can either be stressed (strong) or unstressed (weak). The stressed syllable is called the nuclear syllable. For example:\n" +
"\n" +
"    That | was | the | best | thing | you | could | have | done!\n" +
"\n" +
"Here, all syllables are unstressed, except the syllables/words best and done, which are stressed. Best is stressed harder and, therefore, is the nuclear syllable.\n" +
"\n" +
"The nuclear syllable carries the main point the speaker wishes to make. For example:\n" +
"\n" +
"    John hadn't stolen that money. (... Someone else had.)\n" +
"    John hadn't stolen that money. (... You said he had. or ... Not at that time, but later he did.)\n" +
"    John hadn't stolen that money. (... He acquired the money by some other means.)\n" +
"    John hadn't stolen that money. (... He had stolen some other money.)\n" +
"    John hadn't stolen that money. (... He stole something else.)\n" +
"\n" +
"Also\n" +
"\n" +
"    I didn't tell her that. (... Someone else told her.)\n" +
"    I didn't tell her that. (... You said I did. or ... But now I will!)\n" +
"    I didn't tell her that. (... I didn't say it; she could have inferred it, etc.)\n" +
"    I didn't tell her that. (... I told someone else.)\n" +
"    I didn't tell her that. (... I told her something else.)\n" +
"\n" +
"This can also be used to express emotion:\n" +
"\n" +
"    Oh really? (...I didn't know that)\n" +
"    Oh really? (...I disbelieve you)\n" +
"\n" +
"The nuclear syllable is spoken more loudly than the others and has a characteristic change of pitch. The changes of pitch most commonly encountered in English are the rising pitch and the falling pitch, although the fall-rising pitch and/or the rise-falling pitch are sometimes used. In this opposition between falling and rising pitch, which plays a larger role in English than in most other languages, falling pitch conveys certainty and rising pitch uncertainty. This can have a crucial impact on meaning, specifically in relation to polarity, the positive–negative opposition; thus, falling pitch means \"polarity known\", while rising pitch means \"polarity unknown\". This underlies the rising pitch of yes/no questions. For example:\n" +
"\n" +
"    When do you want to be paid?\n" +
"    Now? (Rising pitch. In this case, it denotes a question: \"Can I be paid now?\" or \"Do you desire to be paid now?\")\n" +
"    Now. (Falling pitch. In this case, it denotes a statement: \"I choose to be paid now.\")\n" +
"\n" +
"Grammar\n" +
"\n" +
"    Main article: English grammar\n" +
"\n" +
"English grammar has minimal inflection compared with most other Indo-European languages. For example, Modern English, unlike Modern German or Dutch and the Romance languages, lacks grammatical gender and adjectival agreement. Case marking has almost disappeared from the language and mainly survives in pronouns. The patterning of strong (e.g. speak/spoke/spoken) versus weak verbs inherited from its Germanic origins has declined in importance in modern English, and the remnants of inflection (such as plural marking) have become more regular.\n" +
"\n" +
"At the same time, the language has become more analytic, and has developed features such as modal verbs and word order as rich resources for conveying meaning. Auxiliary verbs mark constructions such as questions, negative polarity, the passive voice and progressive tenses.\n" +
"\n" +
"Vocabulary\n" +
"\n" +
"The English vocabulary has changed considerably over the centuries.[31]\n" +
"\n" +
"Germanic words (generally words of Old English or to a lesser extent Norse origin) which include all the basics such as pronouns (I, my, you, it) and conjunctions (and, or, but) tend to be shorter than the Latinate words of English, and more common in ordinary speech. The longer Latinate words are often regarded as more elegant or educated. However, the excessive or superfluous use of Latinate words is considered at times to be either pretentious (as in the stereotypical policeman's talk of \"apprehending the suspect\") or an attempt to obfuscate an issue. George Orwell's essay \"Politics and the English Language\" is critical of this, as well as other perceived abuses of the language.\n" +
"\n" +
"An English speaker is in many cases able to choose between Germanic and Latinate synonyms: come or arrive; sight or vision; freedom or liberty. In some cases there is a choice between a Germanic derived word (oversee), a Latin derived word (supervise), and a French word derived from the same Latin word (survey). The richness of the language arises from the variety of different meanings and nuances such synonyms harbour, enabling the speaker to express fine variations or shades of thought. Familiarity with the etymology of groups of synonyms can give English speakers greater control over their linguistic register. See: List of Germanic and Latinate equivalents.\n" +
"\n" +
"An exception to this and a peculiarity perhaps unique to English is that the nouns for meats are commonly different from, and unrelated to, those for the animals from which they are produced, the animal commonly having a Germanic name and the meat having a French-derived one. Examples include: deer and venison; cow and beef; swine/pig and pork, or sheep and mutton. This is assumed to be a result of the aftermath of the Norman invasion, where a French-speaking elite were the consumers of the meat, produced by English-speaking lower classes.\n" +
"\n" +
"In everyday speech, the majority of words will normally be Germanic. If a speaker wishes to make a forceful point in an argument in a very blunt way, Germanic words will usually be chosen. A majority of Latinate words (or at least a majority of content words) will normally be used in more formal speech and writing, such as a courtroom or an encyclopedia article. However, there are other Latinate words that are used normally in everyday speech and do not sound formal; these are mainly words for concepts that no longer have Germanic words, and are generally assimilated better and in many cases do not appear Latinate. For instance, the words mountain, valley, river, aunt, uncle, move, use, push and stay are all Latinate.\n" +
"\n" +
"English is noted for the vast size of its active vocabulary and its fluidity.[citation needed][weasel words] English easily accepts technical terms into common usage and imports new words and phrases that often come into common usage. Examples of this phenomenon include: cookie, Internet and URL (technical terms), as well as genre, über, lingua franca and amigo (imported words/phrases from French, German, modern Latin, and Spanish, respectively). In addition, slang often provides new meanings for old words and phrases. In fact, this fluidity is so pronounced that a distinction often needs to be made between formal forms of English and contemporary usage. See also: sociolinguistics.\n" +
"\n" +
"Number of words in English\n" +
"\n" +
"English has an extraordinarily rich vocabulary and willingness to absorb new words. As the General Explanations at the beginning of the Oxford English Dictionary states:\n" +
"\n" +
"    The Vocabulary of a widely diffused and highly cultivated living language is not a fixed quantity circumscribed by definite limits... there is absolutely no defining line in any direction: the circle of the English language has a well-defined centre but no discernible circumference.\n" +
"\n" +
"The vocabulary of English is undoubtedly vast, but assigning a specific number to its size is more a matter of definition than of calculation. Unlike other languages, there is no Academy to define officially accepted words. Neologisms are coined regularly in medicine, science and technology and other fields, and new slang is constantly developed. Some of these new words enter wide usage; others remain restricted to small circles. Foreign words used in immigrant communities often make their way into wider English usage. Archaic, dialectal, and regional words might or might not be widely considered as \"English\".\n" +
"\n" +
"The Oxford English Dictionary, 2nd edition (OED2) includes over 600,000 definitions, following a rather inclusive policy:\n" +
"\n" +
"    It embraces not only the standard language of literature and conversation, whether current at the moment, or obsolete, or archaic, but also the main technical vocabulary, and a large measure of dialectal usage and slang (Supplement to the OED, 1933).[32]\n" +
"\n" +
"The editors of Webster's Third New International Dictionary, Unabridged (475,000 main headwords) in their preface, estimate the number to be much higher. It is estimated that about 25,000 words are added to the language each year.[33]\n" +
"\n" +
"Word origins\n" +
"Influences in English vocabulary\n" +
"Influences in English vocabulary\n" +
"\n" +
"    Main article: Lists of English words of international origin\n" +
"\n" +
"One of the consequences of the French influence is that the vocabulary of English is, to a certain extent, divided between those words which are Germanic (mostly Old English) and those which are \"Latinate\" (Latin-derived, either directly from Norman French or other Romance languages).\n" +
"\n" +
"Numerous sets of statistics have been proposed to demonstrate the various origins of English vocabulary. None, as yet, are considered definitive by a majority of linguists.\n" +
"\n" +
"A computerised survey of about 80,000 words in the old Shorter Oxford Dictionary (3rd ed.) was published in Ordered Profusion by Thomas Finkenstaedt and Dieter Wolff (1973)[34] that estimated the origin of English words as follows:\n" +
"\n" +
"    * Langue d'oïl, including French and Old Norman: 28.3%\n" +
"    * Latin, including modern scientific and technical Latin: 28.24%\n" +
"    * Other Germanic languages (including words directly inherited from Old English): 25%\n" +
"    * Greek: 5.32%\n" +
"    * No etymology given: 4.03%\n" +
"    * Derived from proper names: 3.28%\n" +
"    * All other languages contributed less than 1% (e.g. Arabic-English loanwords)\n" +
"\n" +
"A survey by Joseph M. Williams in Origins of the English Language of 10,000 words taken from several thousand business letters[35] gave this set of statistics:\n" +
"\n" +
"    * French (langue d'oïl), 41%\n" +
"    * \"Native\" English, 33%\n" +
"    * Latin, 15%\n" +
"    * Danish, 2%\n" +
"    * Dutch, 1%\n" +
"    * Other, 10%\n" +
"\n" +
"However, 83% of the 1,000 most-common English words are Anglo-Saxon in origin. [36]\n" +
"\n" +
"Dutch origins\n" +
"\n" +
"    Main article: List of English words of Dutch origin\n" +
"\n" +
"Words describing the navy, types of ships, and other objects or activities on the water are often from Dutch origin. Yacht (Jacht) and cruiser (kruiser) are examples.\n" +
"\n" +
"French origins\n" +
"\n" +
"    Main article: List of French phrases used by English speakers\n" +
"\n" +
"There are many words of French origin in English, such as competition, art, table, publicity, police, role, routine, machine, force, and many others that have been and are being anglicised; they are now pronounced according to English rules of phonology, rather than French. A large portion of English vocabulary is of French or Oïl language origin, most derived from, or transmitted via, the Anglo-Norman spoken by the upper classes in England for several hundred years after the Norman Conquest.\n";


var greek =
"Ελλάδα\n" +
"Από τη Βικιπαίδεια, την ελεύθερη εγκυκλοπαίδεια\n" +
"Ελληνική Δημοκρατία\n" +
"	\n" +
"Σημαία	Εθνόσημο\n" +
"Εθνικό σύνθημα: Ελευθερία ή Θάνατος\n" +
"Εθνικός ύμνος: Ὕμνος εἰς τὴν Ἐλευθερίαν\n" +
"\n" +
"Πρωτεύουσα	Αθήνα \n" +
"38.01.36N 23.44.00E\n" +
"\n" +
"Μεγαλύτερη πόλη	Αθήνα\n" +
"Επίσημες γλώσσες	Ελληνική\n" +
"Πολίτευμα\n" +
"\n" +
"Πρόεδρος της Δημοκρατίας\n" +
"Πρωθυπουργός	Προεδρευόμενη\n" +
"Κοινοβουλευτική Δημοκρατία\n" +
"Κάρολος Παπούλιας\n" +
"Κωνσταντίνος Καραμανλής\n" +
"Ανεξαρτησία\n" +
"- Κηρύχθηκε\n" +
"- Αναγνωρίστηκε\n" +
"\n" +
"25 Μαρτίου, 1821\n" +
"1828\n" +
"Έκταση\n" +
" - Σύνολο\n" +
" - Νερό (%)	 \n" +
"131.940 km² (94ηη)\n" +
"%0.86\n" +
"Πληθυσμός\n" +
" - Εκτίμηση 2006\n" +
" - Απογραφή 2001\n" +
" - Πυκνότητα	 \n" +
"11.120.000 [1] (72ηη)\n" +
"10.964.020\n" +
"83.1 κάτ./km² (87ηη)\n" +
"Α.Ε.Π.\n" +
" - Ολικό\n" +
" - Κατά κεφαλή	Εκτίμηση 2007\n" +
"$305,595 δισ. (37η)\n" +
"$27,360 (27η)\n" +
"Νόμισμα	Ευρώ\n" +
"(€)\n" +
"Ζώνη ώρας\n" +
" - Θερινή ώρα	(UTC+2)\n" +
"(UTC+3)\n" +
"Internet TLD	.gr\n" +
"Κωδικός κλήσης	+30\n" +
"Η Ελλάδα (αρχαΐζουσα: Ἑλλάς, επίσημα: Ελληνική Δημοκρατία), είναι χώρα στην νοτιοανατολική Ευρώπη, στο νοτιότερο άκρο της Βαλκανικής χερσονήσου, στην Ανατολική Μεσόγειο. Συνορεύει στην ξηρά, βόρεια με την Πρώην Γιουγκοσλαβική Δημοκρατία της Μακεδονίας και την Βουλγαρία, στα βορειοδυτικά με την Αλβανία και στα βορειοανατολικά με την Τουρκία. Βρέχεται ανατολικά από το Αιγαίο Πέλαγος, στα δυτικά και νότια από το Ιόνιο και από την Μεσόγειο Θάλασσα. Είναι το λίκνο του Δυτικού πολιτισμού. Η Ελλάδα έχει μια μακρά και πλούσια ιστορία κατά την οποία άσκησε μεγάλη πολιτισμική επίδραση σε τρεις ηπείρους.\n" +
"Πίνακας περιεχομένων [Απόκρυψη]\n" +
"1 Ιστορία\n" +
"2 Πολιτικά\n" +
"2.1 Κόμματα\n" +
"2.2 Κυβέρνηση\n" +
"3 Περιφέρειες\n" +
"3.1 Βουνά της Ελλάδας\n" +
"3.2 Λίμνες της Ελλάδας\n" +
"3.3 Ποτάμια της Ελλάδας\n" +
"3.4 Κλίμα\n" +
"4 Οικονομία\n" +
"5 Δημογραφία\n" +
"6 Ένοπλες δυνάμεις και Σώματα ασφαλείας\n" +
"6.1 Υποχρεωτική στράτευση\n" +
"7 Πολιτισμός\n" +
"7.1 Αργίες\n" +
"8 Σημειώσεις\n" +
"9 Δείτε επίσης\n" +
"10 Εξωτερικές συνδέσεις\n" +
"[Επεξεργασία]\n" +
"Ιστορία\n" +
"\n" +
"Κύριο άρθρο: Ελληνική ιστορία\n" +
"Στις ακτές του Αιγαίου Πελάγους εμφανίστηκαν οι πρώτοι πολιτισμοί της Ευρώπης, ο Μινωικός και ο Μυκηναϊκός. Την εποχή των πολιτισμών αυτών, ακολούθησε μία σκοτεινή περίοδος περίπου μέχρι το 800 π.Χ., οπότε εμφανίζεται ένας καινούριος Ελληνικός πολιτισμός, βασισμένος στο μοντέλο της πόλης-κράτους. Είναι ο πολιτισμός που θα διαδοθεί με τον αποικισμό των ακτών της Μεσογείου, θα αντισταθεί στην Περσική εισβολή με τους δύο επιφανέστερους εκπροσώπους του, την κοσμοπολίτικη και δημοκρατική Αθήνα και την μιλιταριστική και ολιγαρχική Σπάρτη, θα αποτελέσει τη βάση του Ελληνιστικού πολιτισμού που δημιούργησαν οι κατακτήσεις του Μεγάλου Αλεξάνδρου, θα επηρεάσει ως ένα βαθμό την πολιτισμική φυσιογνωμία της Βυζαντινής Αυτοκρατορίας και αργότερα θα πυροδοτήσει την Αναγέννηση στην Ευρώπη.\n" +
"Στρατιωτικά έχανε δύναμη σε σύγκριση με τη Ρωμαϊκή αυτοκρατορία μέχρι που κατακτήθηκε τελικά από τους Ρωμαίους το 146 π.Χ., αν και ο Ελληνικός πολιτισμός τελικά κατέκτησε το Ρωμαϊκό τρόπο ζωής. Οι Ρωμαίοι αναγνώρισαν και θαύμασαν τον πλούτο του Ελληνικού πολιτισμού, τον μελέτησαν βαθιά και έγιναv συνειδητά συνεχιστές του. Διέσωσαν επίσης και μεγάλο μέρος της αρχαιοελληνικής γραμματείας. Αν και ήταν μόνο ένα μέρος της Ρωμαϊκής αυτοκρατορίας, ο ελληνικός πολιτισμός θα συνέχιζε να δεσπόζει στην Ανατολική Μεσόγειο, και όταν τελικά η Αυτοκρατορία χωρίστηκε στα δύο, η ανατολική ή Βυζαντινή Αυτοκρατορία με πρωτεύουσα την Κωνσταντινούπολη, θα είχε κυρίως λόγω γλώσσας έντονο τον ελληνικό χαρακτήρα. Από τον 4ο μέχρι τον 15ο αιώνα, η Ανατολική Ρωμαϊκή Αυτοκρατορία επέζησε επιθέσεις 11 αιώνων από δυτικά και ανατολικά, μέχρι που η Κωνσταντινούπολη έπεσε στις 29 Μαΐου του 1453 στα χέρια της Οθωμανικής Αυτοκρατορίας. Σταδιακά το Βυζάντιο κατακτήθηκε ολόκληρο μέσα στον 15ο αιώνα.\n" +
"Η Οθωμανική κυριαρχία συνεχίστηκε μέχρι το 1821 που οι Έλληνες κήρυξαν την ανεξαρτησία τους. Η Ελληνική Επανάσταση του 1821 έληξε το 1828. Το 1830 αναγνωρίζεται η ανεξαρτησία του νέου ελληνικού κράτους. Εγκαθιδρύθηκε μοναρχία το 1833. Μέσα στον 19ο και τον πρώιμο 20ό αιώνα, η Ελλάδα προσπάθησε να προσαρτήσει στα εδάφη της όλες τις περιοχές που ακόμη ανήκαν στην Οθωμανική Αυτοκρατορία και είχαν Ελληνόφωνο πληθυσμό, πράγμα που κατάφερε εν μέρει, επεκτείνοντας σταδιακά την έκτασή της, μέχρι να φτάσει το σημερινό της μέγεθος το 1947.\n" +
"Μετά τον Δεύτερο Παγκόσμιο Πόλεμο στην Ελλάδα ξέσπασε εμφύλιος πόλεμος μέχρι το 1949. Αργότερα, το 1952, η Ελλάδα έγινε μέλος του ΝΑΤΟ. Στις 21 Απριλίου του 1967 ο στρατός, υποβοηθούμενος από την κυβέρνηση των ΗΠΑ, πήρε την εξουσία με πραξικόπημα. Οι δικτατορες στη συνεχεια διαχωριστηκαν και απο τον βασιλια, τον εκδίωξαν απο την χώρα και κατήργησαν τη μοναρχία. Η στρατιωτική Χούντα υπήρξε η αιτία δημιουργίας, μετά από λανθασμένους χειρισμούς που εκμεταλλεύτηκε η Τουρκική πλευρά, του Κυπριακού ζητήματος, το οποίο οδήγησε στην κατάρρευσή της το 1974. Έπειτα από δημοψήφισμα για την κατάργηση της μοναρχίας στις 8 Δεκεμβρίου 1974 το πολίτευμα της Ελλάδας μετατράπηκε ξανά σε αβασίλευτη Δημοκρατία και συντάχθηκε νέο σύνταγμα από την πέμπτη Αναθεωρητική Βουλή που τέθηκε σε ισχύ στις 11 Ιουνίου 1975, το οποίο ισχύει σήμερα όπως αναθεωρήθηκε το 1986 και το 2001. Η Ελλάδα έγινε μέλος της Ευρωπαϊκής Ένωσης το 1981 και μέλος της Ευρωπαϊκής Οικονομικής και Νομισματικής Ένωσης (ΟΝΕ) γνωστής και ως ζώνης ευρώ, το 2001.\n" +
"Ελληνική ιστορία \n" +
"Κυκλαδικός πολιτισμός	(3η χιλιετία π.Χ.)\n" +
"Μινωικός πολιτισμός	(3000-1450 π.Χ.)\n" +
"Μυκηναϊκός πολιτισμός	(1600-1100 π.Χ.)\n" +
"Γεωμετρική εποχή	(1100-800 π.Χ.)\n" +
"Αρχαϊκή εποχή	(800-500 π.Χ.)\n" +
"Κλασική εποχή	(500 π.Χ.- 323 π.Χ.)\n" +
"Ελληνιστική εποχή	(323-146 π.Χ.)\n" +
"Ρωμαϊκή περίοδος	(146 π.Χ.-330 μ.Χ.)\n" +
"Βυζαντινή περίοδος	(330-1453)\n" +
"Οθωμανική περίοδος	(1453-1821)\n" +
"Νεότερη Ελλάδα	(1821 έως σήμερα)\n" +
"Σχετικά\n" +
"Αρχαία ελληνική γραμματεία\n" +
"Ελληνική γλώσσα\n" +
"Ονομασίες Ελλήνων\n" +
"\n" +
"[Επεξεργασία]\n" +
"Πολιτικά\n" +
"\n" +
"Το Σύνταγμα του 1975 περιέχει εκτενείς εγγυήσεις των ελευθεριών και των δικαιωμάτων του πολίτη, ελευθερίες και δικαιώματα που ενισχύθηκαν περαιτέρω με την αναθεώρηση του 2001. Είναι χαρακτηριστικό ότι κατά την αναθεώρηση αυτή κατοχυρώθηκαν, για πρώτη φορά συνταγματικά, πέντε ανεξάρτητες αρχές, οι τρεις εκ των οποίων (Συνήγορος του Πολίτη, Αρχή Διασφάλισης Ατομικών Δικαιωμάτων και Αρχή Προστασίας Προσωπικών Δεδομένων) είναι ταγμένες στην προστασία και διασφάλιση των ατομικών δικαιωμάτων. Η Ελλάδα είναι επίσης μέλος της Ευρωπαϊκής Σύμβασης για τα Δικαιώματα του Ανθρώπου.\n" +
"Σε πολιτειακό και οργανωτικό επίπεδο, το Σύνταγμα διακρίνει τρεις εξουσίες: τη νομοθετική, την εκτελεστική και τη δικαστική. Στη νομοθετική μετέχουν ο Πρόεδρος της Δημοκρατίας και η Βουλή· στην εκτελεστική ο Πρόεδρος της Δημοκρατίας και η Κυβέρνηση, ενώ η δικαστική εξουσία ασκείται από τα δικαστήρια στο όνομα του ελληνικού λαού.\n" +
"Ο Πρόεδρος της Δημοκρατίας, ιεραρχικά, βρίσκεται στην κορυφή της εκτελεστικής εξουσίας, μετέχει στη νομοθετική με τη δημοσίευση των νόμων και τη δυνατότητα αναπομπής ψηφισμένου νομοσχεδίου, ενώ ορίζεται από το Σύνταγμα ως ρυθμιστής του πολιτεύματος [2] . Εκλέγεται έμμεσα από τη Βουλή με διαδοχικές ψηφοφορίες των μελών της, στις οποίες επιδιώκεται η εξασφάλιση πλειοψηφίας 2/3, σε πρώτη φάση, και 3/5, σε δεύτερη, του συνόλου των μελών της. Σε περίπτωση αποτυχίας συγκέντρωσης των ανωτέρω πλειοψηφιών, διαλύεται η Βουλή, προκηρύσσονται εκλογές και η νέα Βουλή εκλέγει τον Πρόεδρο της Δημοκρατίας με την απόλυτη πλειοψηφία των μελών της, ή και με σχετική αν δεν συγκεντρωθεί η απόλυτη πλειοψηφία. Οι εξουσίες του Προέδρου είναι περιορισμένες καθώς ασκεί, κυρίως, τελετουργικά καθήκοντα. Όλες, σχεδόν, οι πράξεις του, χρήζουν προσυπογραφής από τον Πρωθυπουργό ή άλλο μέλος της Κυβέρνησης (υπουργό), όπως, π.χ., τα προεδρικά διατάγματα. Από την υποχρέωση προσυπογραφής εξαιρούνται ρητά ελάχιστες πράξεις του Προέδρου που προβλέπονται από το Σύνταγμα, όπως ο διορισμός των υπαλλήλων της Προεδρίας της Δημοκρατίας. Η θητεία του είναι πενταετής με δικαίωμα επανεκλογής για μία ακόμη φορά.\n" +
"Η νομοθετική εξουσία ασκείται από τη Βουλή, τα μέλη της οποίας εκλέγονται με καθολική μυστική ψηφοφορία για τετραετή θητεία. Εκλογές μπορεί να κηρυχθούν νωρίτερα για έκτακτους λόγους, όπως αυτοί ορίζονται στο Σύνταγμα. Μετά, πάντως, το 1975 η προκήρυξη πρόωρων εκλογών αποτελεί τον κανόνα, με την επίκληση, συνήθως, από τις απερχόμενες κυβερνήσεις ιδιαζούσης σημασίας εθνικού θέματος. Η Ελληνική Δημοκρατία χρησιμοποιεί για την ανάδειξη των βουλευτών ένα σύνθετο ενδυναμωμένο εκλογικό σύστημα αναλογικής εκπροσώπησης (ενισχυμένη αναλογική), που αποθαρρύνει τη δημιουργία πολυκομματικών Κυβερνήσεων συνεργασίας και επιτρέπει ισχυρή κυβέρνηση πλειοψηφίας, ακόμα και αν το πρώτο κόμμα υστερεί της πλειοψηφίας των ψήφων. Για να μπορεί να καταλάβει μία από τις 300 βουλευτικές έδρες ένα κόμμα, πρέπει να έχει λάβει τουλάχιστον το 3% του συνόλου των ψήφων, ενώ με τον εκλογικό νόμο, που θα εφαρμοστεί, για πρώτη φορά, στις μετά το 2004 βουλευτικές εκλογές, το πρώτο κόμμα εξασφαλίζει απόλυτη πλειοψηφία στη Βουλή με ποσοστό 41%.\n" +
"Η εκτελεστική εξουσία ασκείται από την Κυβέρνηση, κεφαλή της οποίας είναι ο Πρωθυπουργός, το ισχυρότερο πρόσωπο του ελληνικού πολιτικού συστήματος. Η Κυβέρνηση καθορίζει και κατευθύνει τη γενική πολιτική της Χώρας [3], εφαρμόζει την πολιτική, που εγκρίνει μέσω των νομοθετικών πράξεων η Βουλή, αλλά ταυτόχρονα μετέχει στη νομοπαρασκευαστική διαδικασία, μέσω της σύνταξης και της προώθησης προς ψήφιση των νομοσχεδίων. Η Κυβέρνηση με βάση την αρχή της δεδηλωμένης οφείλει να απολαύει της εμπιστοσύνης της Βουλής, να έχει λάβει δηλαδή ψήφο εμπιστοσύνης από την πλειοψηφία των Βουλευτών. Στα πλαίσια δε της σύγχρονης κομματικής δημοκρατίας, η Κυβέρνηση κυριαρχεί και στη νομοθετική λειτουργία, καθώς προέρχεται από το Κόμμα που ελέγχει την πλειοψηφία του Κοινοβουλίου, καθιστώντας, έτσι, την ψήφιση των νόμων μια τυπική, κατά κανόνα, διαδικασία. Λόγω δε της συχνής έως καταχρηστικής επίκλησης της κομματικής πειθαρχίας, η δυνατότητα διαφωνίας κυβερνητικού βουλευτή με την Κυβέρνηση που στηρίζει θεωρείται σπάνιο φαινόμενο. Σε έκτακτες περιπτώσεις μπορεί η Κυβέρνηση να εκδίδει Πράξεις Νομοθετικού Περιεχομένου. Οι Π.Ν.Π. έχουν ισχύ νόμου και οφείλουν να εγκριθούν εντός 40 ημερών από τη Βουλή.\n" +
"Ο Πρωθυπουργός αποτελεί την κεφαλή της κυβέρνησης και, με βάση το Σύνταγμα, είναι, συνήθως (αν και όχι απαραίτητα), ο αρχηγός του έχοντος την απόλυτη πλειοψηφία στη Βουλή κυβερνώντος κόμματος. Βάσει του άρθρου 82 του Συντάγματος, \"ο Πρωθυπουργός εξασφαλίζει την ενότητα της Κυβέρνησης και κατευθύνει τις ενέργειές της, καθώς και των δημοσίων γενικά υπηρεσιών για την εφαρμογή της κυβερνητικής πολιτικής μέσα στο πλαίσιο των νόμων\" [3]. Οι βασικότερες εξουσίες του είναι οι εξής:\n" +
"Προεδρεύει του Υπουργικού Συμβουλίου, στο οποίο μετέχει μαζί με τους Υπουργούς.\n" +
"Με δέσμια πρόταση του διορίζονται και παύονται από τον Πρόεδρο της Δημοκρατίας οι υπουργοί και οι υφυπουργοί της Κυβέρνησης.\n" +
"Καθορίζει με τον οικείο Υπουργό τις αρμοδιότητες των υφυπουργών.\n" +
"Προΐσταται τεσσάρων αυτοτελών υπηρεσιών και γραμματειών: του Πολιτικού Γραφείου του Πρωθυπουργού, της Γραμματείας της Κυβερνήσεως, της Κεντρικής Νομοπαρασκευαστικής Επιτροπής και της Γενικής Γραμματείας Τύπου.\n" +
"Δίνει άδεια για τη δημοσίευση στην Εφημερίδα της Κυβερνήσεως οποιουδήποτε κειμένου πρέπει, κατά το νόμο, να καταχωρισθεί σε αυτήν.\n" +
"[Επεξεργασία]\n" +
"Κόμματα\n" +
"Περισσότερα: Κατάλογος ελληνικών πολιτικών κομμάτων\n" +
"Μετά την αποκατάσταση της Δημοκρατίας το 1974 (μεταπολίτευση) το πολιτικό σύστημα κυριαρχείται από το φιλελεύθερο κόμμα της Νέας Δημοκρατίας και το σοσιαλιστικό ΠΑΣΟΚ (Πανελλλήνιο Σοσιαλιστικό Κίνημα). Άλλα κόμματα είναι το Κομμουνιστικό Κόμμα Ελλάδας, ο Συνασπισμός της Αριστεράς και ο ΛΑ.Ο.Σ..\n" +
"[Επεξεργασία]\n" +
"Κυβέρνηση\n" +
"Περισσότερα: Κυβέρνηση της Ελλάδας\n" +
"Στις εκλογές της 7 Μαρτίου 2004, πρωθυπουργός εκλέχθηκε ο Κωνσταντίνος Α. Καραμανλής, πρόεδρος της Νέας Δημοκρατίας. Ήταν η πρώτη εκλογική νίκη του κόμματος μετά από 11 χρόνια. Ο Καραμανλής αντικατέστησε τον Κωνσταντίνο Σημίτη και σχημάτισε δική του κυβέρνηση. Οι επόμενες βουλευτικές εκλογές προβλέπονταν από το Σύνταγμα για το 2008, όμως διεξήχθησαν πρόωρα στις 16 Σεπτεμβρίου 2007. Τις εκλογές της 16ης κέρδισε ξανά η ΝΔ. Η Νέα βουλή είναι η πρώτη πεντακομματική Βουλή τα τελευταία χρόνια και σε αυτή συμμετέχουν η ΝΔ το ΠΑΣΟΚ, το ΚΚΕ, ο ΣΥ.ΡΙ.ΖΑ και το ΛΑ.Ο.Σ. Συγκεκριμένα η ΝΔ εξασφάλισε το 41.83% και 152 από τις 300 Έδρες. Το ΠΑΣΟΚ εξασφάλισε το 38.10 % και 102 Έδρες. Το Κ.Κ.Ε εξασφάλισε το 8.15% και 22 έδρες. Ο ΣΥ.ΡΙ.ΖΑ εξασφάλισε το 5.04% και 14 έδρες και τέλος το ΛΑ.Ο.Σ εξασφάλισε το 3.80% κερδίζοντας 10 έδρες.\n" +
"[Επεξεργασία]\n" +
"Περιφέρειες\n" +
"\n" +
"Κύριο άρθρο: Περιφέρειες της Ελλάδας\n" +
"Η Ελλάδα χωρίζεται σε 13 διοικητικές περιοχές γνωστές σαν Περιφέρειες, που διαχωρίζονται περαιτέρω σε 51 Νομούς:\n" +
"Αττική\n" +
"Αττική\n" +
"Στερεά Ελλάδα\n" +
"Εύβοια\n" +
"Ευρυτανία\n" +
"Φωκίδα\n" +
"Φθιώτιδα\n" +
"Βοιωτία\n" +
"Κεντρική Μακεδονία\n" +
"Χαλκιδική\n" +
"Ημαθία\n" +
"Κιλκίς\n" +
"Πέλλα\n" +
"Πιερία\n" +
"Σέρρες\n" +
"Θεσσαλονίκη\n" +
"Κρήτη\n" +
"Χανιά\n" +
"Ηράκλειο\n" +
"Λασίθι\n" +
"Ρέθυμνο\n" +
"Ανατολική Μακεδονία και Θράκη\n" +
"Καβάλα\n" +
"Δράμα\n" +
"Ξάνθη\n" +
"Ροδόπη\n" +
"Έβρος\n" +
"Ήπειρος\n" +
"Άρτα\n" +
"Ιωάννινα\n" +
"Πρέβεζα\n" +
"Θεσπρωτία\n" +
"Ιόνια νησιά\n" +
"Κέρκυρα\n" +
"Κεφαλονιά\n" +
"Λευκάδα\n" +
"Ζάκυνθος\n" +
"Βόρειο Αιγαίο\n" +
"Χίος\n" +
"Λέσβος\n" +
"Σάμος - Ικαρία\n" +
"Πελοπόννησος\n" +
"Αρκαδία\n" +
"Αργολίδα\n" +
"Κορινθία\n" +
"Λακωνία\n" +
"Μεσσηνία\n" +
"Νότιο Αιγαίο\n" +
"Κυκλάδες\n" +
"Δωδεκάνησα\n" +
"Θεσσαλία\n" +
"Καρδίτσα\n" +
"Λάρισα\n" +
"Μαγνησία\n" +
"Τρίκαλα\n" +
"Δυτική Ελλάδα\n" +
"Αχαΐα\n" +
"Αιτωλοακαρνανία\n" +
"Ηλεία\n" +
"Δυτική Μακεδονία\n" +
"Φλώρινα\n" +
"Γρεβενά\n" +
"Καστοριά\n" +
"Κοζάνη\n" +
"Επιπλέον, στη Μακεδονία υπάρχει μία αυτόνομη περιοχή, το Άγιο Όρος, μία μοναστική πολιτεία υπό Ελληνική κυριαρχία. Οι νομοί χωρίζονται σε 147 επαρχίες, που διαιρούνται σε 900 δήμους και 133 κοινότητες. Πριν το 1999, υπήρχαν 5.775 οργανισμοί τοπικής αυτοδιοίκησης: 361 δήμοι και 5.560 κοινότητες, υποδιαιρούμενες σε 12.817 οικισμούς\n" +
"\n" +
"\n" +
"\n" +
"Αλβανία\n" +
"\n" +
"П.Γ.Δ.Μ.\n" +
"\n" +
"Βουλγαρία\n" +
"'\n" +
"\n" +
"Τουρκία\n" +
"\n" +
"EΛΛAΣ\n" +
"AΘHNA\n" +
"Θεσσαλονίκη\n" +
"Καβάλα\n" +
"Αλεξανδρούπολη\n" +
"Κέρκυρα\n" +
"Ηγουμενίτσα\n" +
"Λάρισα\n" +
"Βόλος\n" +
"Ιωάννινα\n" +
"Χαλκίδα\n" +
"Πάτρα\n" +
"Πειραιάς\n" +
"Ελευσίνα\n" +
"Λαύριο\n" +
"Ηράκλειο\n" +
"Μ α κ ε δ ο ν ί α\n" +
"Θράκη\n" +
"Ήπειρος\n" +
"Θεσσαλία\n" +
"Στερεά Ελλάδα\n" +
"Πελοπόννησος\n" +
"Όλυμπος (2917m)\n" +
"Λευκάδα\n" +
"Κεφαλονιά\n" +
"Λήμνος\n" +
"Λέσβος\n" +
"Χίος\n" +
"Σάμος\n" +
"Τήνος\n" +
"Ικαρία\n" +
"Νάξος\n" +
"Σαντορίνη\n" +
"Κως\n" +
"Ρόδος\n" +
"Κάρπαθος\n" +
"Κύθηρα\n" +
"Γαύδος\n" +
"Αιγαίον\n" +
"Πέλαγος\n" +
"Μυρτώον\n" +
"Πέλαγος\n" +
"Κρητικόν Πέλαγος\n" +
"Ιόνιον\n" +
"Πέλαγος\n" +
"Μεσόγειος\n" +
"Θάλασσα\n" +
"Κρήτη\n" +
"[Επεξεργασία]\n" +
"Βουνά της Ελλάδας\n" +
"Κύριο άρθρο: Κατάλογος βουνών της Ελλάδας\n" +
"Περίπου το 80% του εδάφους της χώρας είναι ορεινό ή λοφώδες. Μεγάλο μέρος του είναι ξηρό και βραχώδες, μόνο 28% του εδάφους είναι καλλιεργήσιμο.\n" +
"Όλυμπος 2917 μ. Θεσσαλία, Κεντρική Μακεδονία (Λάρισα, Πιερία)\n" +
"Σμόλικας 2637 μ. Βόρεια Πίνδος (Ιωάννινα)\n" +
"Βόρας 2524 μ. Κεντρική Μακεδονία (Πέλλα, Φλώρινα, Π.Γ.Δ.Μ.)\n" +
"Γράμος 2520 μ. Δυτική Μακεδονία (Καστοριά, Ιωάννινα, Αλβανία)\n" +
"Γκιώνα 2510 μ. Στερεά (Φωκίδα)\n" +
"Τύμφη 2497 μ. Βόρεια Πίνδος (Ιωάννινα)\n" +
"Βαρδούσια 2495 μ. Στερεά (Φωκίδα)\n" +
"Αθαμανικά όρη 2469 μ. Νότια Πίνδος (Άρτα)\n" +
"Παρνασσός 2457 μ. Στερεά (Φωκίδα, Φθιώτιδα)\n" +
"Ψηλορείτης 2456 μ. Κρήτη (Ηράκλειο)\n" +
"\n" +
"\n" +
"\n" +
"\n" +
"Η χώρα αποτελείται από ένα μεγάλο ηπειρωτικό τμήμα, το νότιο άκρο των Βαλκανίων, ενωμένο με την πρώην ηπειρωτική Πελοπόννησο, από τον Ισθμό της Κορίνθου, και το Ιόνιο και Αιγαίο πέλαγος. Η Πελοπόννησος πλέον μετά την κατασκευή της διώρυγας της Κορίνθου είναι στην πραγματικότητα νησί. Το Αιγαίο περιέχει πολυάριθμα νησιά, ανάμεσά τους τη Ρόδο, την Εύβοια, τη Λέσβο και τα συμπλέγματα των Κυκλάδων και Δωδεκανήσων. 180 χιλιόμετρα νότια των ακτών δεσπόζει η Κρήτη, το πέμπτο μεγαλύτερο νησί της Μεσογείου. Η Ελλάδα έχει μήκος ακτών 15.021 χιλιόμετρα, που θεωρείται εξαιρετικά μεγάλο, και οφείλεται στον πλούσιο οριζόντιο εδαφικό διαμελισμό, καθώς και στο πλήθος των αναρίθμητων νησιών, τα οποία είναι πάνω από 1500. Έχει μήκος συνόρων που πλησιάζει τα 1.181 χιλιόμετρα.\n" +
"\n" +
"\n" +
"Δορυφορική εικόνα της Ελλάδας\n" +
"Κύριο άρθρο: Γεωγραφία της Ελλάδας\n" +
"[Επεξεργασία]\n" +
"Λίμνες της Ελλάδας\n" +
"Κύριο άρθρο: Κατάλογος λιμνών της Ελλάδας\n" +
"Η Ελλάδα έχει αρκετές λίμνες, οι περισσότερες των οποίων βρίσκονται στο ηπειρωτικό της τμήμα. Οι μεγαλύτερες λίμνες στην ελληνική επικράτεια είναι:\n" +
"Τριχωνίδα 96.513 τ.χλμ.\n" +
"Βόλβη 75.600 τ.χλμ\n" +
"Λίμνη Βεγορίτιδα 72.488 τ.χλμ\n" +
"Λίμνη Βιστονίδα 45.625 τ.χλμ\n" +
"Λίμνη Κορώνεια 42.823 τ.χλμ\n" +
"Μικρή Πρέσπα (ελληνικό τμήμα) 43.122 τ.χλμ\n" +
"Μεγάλη Πρέσπα (ελληνικό τμήμα) 38.325 τ.χλμ\n" +
"Κερκίνη 37.688 τ.χλμ\n" +
"Υπάρχουν επίσης και αρκετές τεχνητές λίμνες κυρίως για παραγωγή ηλεκτρικού ρεύματος, όπως η Λίμνη Κρεμαστών (68.531 τ.χλμ) και η Λίμνη Πολυφύτου (56.793 τ.χλμ).\n" +
"\n" +
"[Επεξεργασία]\n" +
"Ποτάμια της Ελλάδας\n" +
"Αρκετά ποτάμια διαρρέουν την Ελλάδα, από τα οποίο κανένα δεν είναι πλεύσιμο. Μερικά από τα μεγαλύτερα, τα Δέλτα που σχηματίζουν στην εκροή τους προς την θάλασσα αποτελούν σημαντικούς υγροβιότοπους, όπως αυτοί του Αλιάκμονα και του Έβρου. Ποταμοί όπως ο Πηνειός στην Θεσσαλία, υδροδοτούν μεγάλες γεωργικές εκτάσεις με την βοήθεια καναλιών, ενώ σε άλλα έχουν δημιουργηθεί τεχνητές λίμνες για την λειτουργία υδροηλεκτρικών εργοστασίων. Ένα αμφιλεγόμενο για οικολογικούς λόγους σχέδιο των τελευταίων δεκαετιών, είναι η εκτροπή του Αχελώου από τη νότια Πίνδο για την αντιμετώπιση του υδατικού προβλήματος της Θεσσαλίας.\n" +
"Ακολουθεί κατάλογος των μεγαλύτερων σε μήκος ποταμών της Ελλάδας. Το μήκος που αναγράφεται είναι αυτό που διατρέχει την ελληνική επικράτεια.\n" +
"Αλιάκμονας 297 χλμ.\n" +
"Αχελώος 220 χλμ.\n" +
"Πηνειός (Θεσσαλίας) 205 χλμ.\n" +
"Έβρος [4] 204 χλμ.\n" +
"Νέστος [4] 130 χλμ.\n" +
"Στρυμόνας [4] 118 χλμ.\n" +
"Θύαμις (Καλαμάς) 115 χλμ.\n" +
"Αλφειός 110 χλμ.\n" +
"Άραχθος 110 χλμ.\n" +
"[Επεξεργασία]\n" +
"Κλίμα\n" +
"Η Ελλάδα χαρακτηρίζεται από τον μεσογειακό τύπο του εύκρατου κλίματος και έχει ήπιους υγρούς χειμώνες και ζεστά ξηρά καλοκαίρια. Το κλίμα της χώρας μπορεί να διαιρεθεί σε τέσσερις βασικές κατηγορίες:\n" +
"- υγρό μεσογειακό (δυτική Ελλάδα, δυτική Πελοπόννησος, πεδινά και ημιορεινά της Ηπείρου) - ξηρό μεσογειακό (Κυκλάδες, παραλιακή Κρήτη, Δωδεκάνησα, ανατολική Πελοπόννησος, Αττική, πεδινές περιοχές Ανατολικής Στερεάς) - ηπειρωτικό (δυτική Μακεδονία, εσωτερικά υψίπεδα ηπειρωτικής Ελλάδας, βόρειος Έβρος) - ορεινό (ορεινές περιοχές με υψόμετρο περίπου >1500μ στη βόρεια Ελλάδα, >1800μ στην κεντρική Ελλάδα και >2000μ στην Κρήτη).\n" +
"Οι θερμοκρασίες είναι σπάνια υπερβολικές στις παραθαλάσσιες περιοχές. Στις κλειστές εσωτερικές πεδιάδες και στα υψίπεδα της χώρας παρατηρούνται τα μεγαλύτερα θερμοκρασιακά εύρη -τόσο ετήσια όσο και ημερήσια. Οι χιονοπτώσεις είναι κοινές στα ορεινά από τα τέλη Σεπτεμβρίου (στη βόρεια Ελλάδα, τέλη Οκτωβρίου κατά μέσο όρο στην υπόλοιπη χώρα), ενώ στις πεδινές περιοχές χιονίζει κυρίως από τον Δεκέμβριο μέχρι τα μέσα Μαρτίου. Έχει χιονίσει, πάντως, ακόμα και κατά μήνα Μάιο στη Φλώρινα. Στις παραθαλάσσιες περιοχές των νησιωτικών περιοχών, οι χιονοπτώσεις συμβαίνουν σπανιότερα και δεν αποτελούν βασικό χαρακτηριστικό του κλίματος. Η πόλη της Ρόδου έχει μέσο όρο 0,0 μέρες χιονόπτωσης το χρόνο. Οι καύσωνες επηρεάζουν κυρίως τις πεδινές περιοχές και είναι κοινότεροι τον Ιούλιο και τον Αύγουστο. Σπάνια, πάντως, διαρκούν περισσότερες από 3 μέρες.\n" +
"Η Ελλάδα βρίσκεται μεταξύ των παραλλήλων 34ου και 42oυ του βορείου ημισφαιρίου και έχει μεγάλη ηλιοφάνεια όλο σχεδόν το χρόνο. Λεπτομερέστερα στις διάφορες περιοχές της Ελλάδας παρουσιάζεται μια μεγάλη ποικιλία κλιματικών τύπων, πάντα βέβαια μέσα στα πλαίσια του μεσογειακού κλίματος. Αυτό οφείλεται στην τοπογραφική διαμόρφωση της χώρας που έχει μεγάλες διαφορές υψομέτρου (υπάρχουν μεγάλες οροσειρές κατά μήκος της κεντρικής χώρας και άλλοι ορεινοί όγκοι) και εναλλαγή ξηράς και θάλασσας. Έτσι από το ξηρό κλίμα της Αττικής και γενικά της ανατολικής Ελλάδας μεταπίπτουμε στο υγρό της βόρειας και δυτικής Ελλάδας. Τέτοιες κλιματικές διαφορές συναντώνται ακόμη και σε τόπους που βρίσκονται σε μικρή απόσταση μεταξύ τους, πράγμα που παρουσιάζεται σε λίγες μόνο χώρες σε όλο τον κόσμο.\n" +
"Από κλιματολογικής πλευράς το έτος μπορεί να χωριστεί κυρίως σε δύο εποχές: Την ψυχρή και βροχερή χειμερινή περίοδο που διαρκεί από τα μέσα του Οκτωβρίου και μέχρι το τέλος Μαρτίου και τη θερμή και άνομβρη εποχή που διαρκεί από τον Απρίλιο έως τον Οκτώβριο.\n" +
"Κατά την πρώτη περίοδο οι ψυχρότεροι μήνες είναι ο Ιανουάριος και ο Φεβρουάριος, όπου κατά μέσον όρο η μέση ελάχιστη θερμοκρασία κυμαίνεται από 5-10 °C στις παραθαλάσσιες περιοχές, από 0-5 °C στις ηπειρωτικές περιοχές και σε χαμηλότερες τιμές κάτω από το μηδέν στις βόρειες περιοχές.\n" +
"Οι βροχές ακόμη και τη χειμερινή περίοδο δεν διαρκούν για πολλές ημέρες και ο ουρανός της Ελλάδας δεν μένει συννεφιασμένος για αρκετές συνεχόμενες ημέρες, όπως συμβαίνει σε άλλες περιοχές της γης. Οι χειμερινές κακοκαιρίες διακόπτονται συχνά κατά τον Ιανουάριο και το πρώτο δεκαπενθήμερο του Φεβρουαρίου από ηλιόλουστες ημέρες, τις γνωστές από την αρχαιότητα Αλκυονίδες ημέρες.\n" +
"Η χειμερινή εποχή είναι γλυκύτερη στα νησιά του Αιγαίου και του Ιονίου από ό,τι στη Βόρεια και Ανατολική ηπειρωτική Ελλάδα. Κατά τη θερμή και άνομβρη εποχή ο καιρός είναι σταθερός, ο ουρανός σχεδόν αίθριος, ο ήλιος λαμπερός και δεν βρέχει εκτός από σπάνια διαστήματα με ραγδαίες βροχές ή καταιγίδες μικρής γενικά διάρκειας.\n" +
"Η θερμότερη περίοδος είναι το τελευταίο δεκαήμερο του Ιουλίου και το πρώτο του Αυγούστου οπότε η μέση μεγίστη θερμοκρασία κυμαίνεται από 29 °C μέχρι 35 °C. Κατά τη θερμή εποχή οι υψηλές θερμοκρασίες μετριάζονται από τη δροσερή θαλάσσια αύρα στις παράκτιες περιοχές της χώρας και από τους βόρειους ανέμους (ετησίες) που φυσούν κυρίως στο Αιγαίο.\n" +
"Η άνοιξη έχει μικρή διάρκεια, διότι ο μεν χειμώνας είναι όψιμος, το δε καλοκαίρι αρχίζει πρώιμα. Το φθινόπωρο είναι μακρύ και θερμό και πολλές φορές παρατείνεται στη νότια Ελλάδα μέχρι τα μισά του Δεκεμβρίου.\n" +
"[Επεξεργασία]\n" +
"Οικονομία\n" +
"\n" +
"Κύριο άρθρο: Οικονομία της Ελλάδας\n" +
"Η Ελλάδα έχει μικτή καπιταλιστική οικονομία, με τον δημόσιο τομέα να συνεισφέρει περίπου στο μισό του Α.Ε.Π.. Ο Τουρισμός αποτελεί μία πολύ σημαντική βιομηχανία, που συνεισφέρει κι αυτή σε μεγάλο ποσοστό του Α.Ε.Π., και επίσης αποτελεί πηγή συναλλάγματος. Το 2004 η μεγαλύτερη βιομηχανία στην Ελλάδα με έσοδα γύρω στα 12 δισ. ευρώ ήταν η συνήθως σχετικά αφανής ναυτιλία.\n" +
"Η οικονομία βελτιώνεται σταθερά τα τελευταία χρόνια, καθώς η κυβέρνηση εφάρμοσε αποτελεσματική οικονομική πολιτική, στην προσπάθεια της ένταξης της Ελλάδας στην ζώνη του ευρώ, την 1 Ιανουαρίου 2001. Παράγων που σίγουρα βοήθησε σε αυτήν την πορεία είναι ότι η Ελλάδα είναι αποδέκτης οικονομικής βοήθειας από την Ευρωπαϊκή Ένωση, ίσης περίπου με το 3,3% του Α.Ε.Π. Η συνέχιση τόσο γενναιόδωρων ενισχύσεων από την Ε.Ε. όμως είναι υπό αμφισβήτηση. Η διεύρυνση της Ευρωπαϊκής Ένωσης με την είσοδο χωρών πολύ φτωχότερων από την Ελλάδα σε συνδυασμό με την ανοδική πορεία της ελληνικής οικονομίας θα βγάλει πιθανότατα πολλές περιοχές από τον λεγόμενο Στόχο 1 του Κοινοτικού Πλαισίου Στήριξης στον οποίο κατευθύνονται και οι περισσότερες επιδοτήσεις και στον οποίο ανήκουν περιοχές με Α.Ε.Π. κατά κεφαλήν μικρότερο του 75% του ευρωπαϊκού μέσου όρου. Με τα στοιχεία του 2003 από τον Στόχο 1 έχουν βγει οι εξής περιοχές: Αττική, Νότιο Αιγαίο, Στερεά Ελλάδα, Κεντρική Μακεδονία, Βόρειο Αιγαίο και οριακά η Πελοπόννησος.\n" +
"Μεγάλες προκλήσεις παραμένουν, η μείωση της ανεργίας και η περαιτέρω ανοικοδόμηση της οικονομίας μέσω και της ιδιωτικοποίησης διαφόρων μεγάλων κρατικών εταιρειών, η αναμόρφωση της κοινωνικής ασφάλισης, διόρθωση του φορολογικού συστήματος, και η ελαχιστοποίηση των γραφειοκρατικών αδυναμιών. Η ανάπτυξη υπολογίζεται σε 3,9% για το 2004.\n" +
"Η εθνική κεντρική τράπεζα του κράτους της Ελλάδας είναι η Τράπεζα της Ελλάδος (ΤτΕ), η οποία όμως έχει παραχωρήσει τις περισσότερες αρμοδιότητές της στην Ευρωπαϊκή Κεντρική Τράπεζα (Ε.Κ.Τ.), μετά την είσοδό της στην ζώνη του ευρώ το 2001.\n" +
"[Επεξεργασία]\n" +
"Δημογραφία\n" +
"\n" +
"Κύριο άρθρο: Δημογραφία της Ελλάδας\n" +
"Άρθρο βασικών αποτελεσμάτων απογραφής: Απογραφή 2001\n" +
"Σύμφωνα με την τελευταία απογραφή (2001)[5] ο μόνιμος πληθυσμός της χώρας είναι 10.934.097 κ. Την ημέρα της απογραφής, στη χώρα βρέθηκαν και απογράφηκαν (πραγματικός πληθυσμός) 10.964.020 κ.\n" +
"Η Διεθνής Έκθεση για τις Θρησκευτικές Ελευθερίες που συντάσσει κάθε έτος το Υπουργείο Εξωτερικών των Ηνωμένων Πολιτειών, αναφέρει το 2005: «Περίπου 97% των πολιτών αυτοπροσδιορίζονται, τουλάχιστον κατ’ όνομα, ως Ελληνoρθόδοξοι. Υπάρχουν περίπου 500.000-800.000 παλαιοημερολογίτες σε ολόκληρη τη χώρα – υπερ-συντηρητικοί Ορθόδοξοι, οι οποίοι χρησιμοποιούν το Ιουλιανό ημερολόγιο και είναι αφοσιωμένοι στις παραδοσιακές Ελληνορθόδοξες πρακτικές. Η κυβέρνηση δεν τηρεί στατιστικά στοιχεία για τις θρησκευτικές ομάδες. Κατά τη διάρκεια των απογραφών πληθυσμού, οι κάτοικοι δεν ερωτώνται για το θρησκευτικό τους πιστεύω. Οι αρχές υπολογίζουν ότι η Τουρκόφωνη Μουσουλμανική κοινότητα αριθμεί 98.000 άτομα, αλλά, άλλοι υπολογίζουν ότι ο αριθμός αυτός ανέρχεται σε 140.000 άτομα. Τα περισσότερα χριστιανικά μη Ορθόδοξα δόγματα συναπαρτίζονται κατά κύριο λόγο από γηγενείς Έλληνες. Οι Μάρτυρες του Ιεχωβά αναφέρουν ότι έχουν 30.000 περίπου ενεργά μέλη και 50.000 άτομα που έχουν προσχωρήσει στην πίστη. Οι Καθολικοί υπολογίζονται σε 50.000. Οι Προτεστάντες, συμπεριλαμβανόμενων των Ευαγγελιστών, είναι 30.000, και οι οπαδοί της Εκκλησίας του Ιησού Χριστού των Αγίων των Τελευταίων Ημερών (Μορμόνοι) 300. Οι Σαϊεντολόγοι ισχυρίζονται ότι έχουν 500 ενεργά εγγεγραμμένα μέλη. Η από αιώνων υπάρχουσα Εβραϊκή κοινότητα αριθμεί περίπου 5.000 πιστούς, από τους οποίους 2.000 υπολογίζεται ότι διαμένουν στη Θεσσαλονίκη. Περίπου 250 μέλη της κοινότητας των Μπαχάι είναι διασκορπισμένα στην χώρα, τα περισσότερα των οποίων δεν είναι πολίτες ελληνικής καταγωγής. Η αρχαία Ελληνική Θρησκεία του Δωδεκαθέου έχει περίπου 2.000 μέλη. Υπάρχουν ακόμα μικρές ομάδες Αγγλικανών, Βαπτιστών, καθώς και άλλοι Χριστιανοί που δεν ανήκουν σε κάποιο συγκεκριμένο δόγμα. Δεν υπάρχει επίσημη ή ανεπίσημη εκτίμηση ως προς τον αριθμό των αθέων. Η πλειοψηφία των κατοίκων μη ελληνικής υπηκοότητας δεν είναι Ορθόδοξοι. Η μεγαλύτερη από αυτές τις ομάδες είναι Αλβανοί[5], συμπεριλαμβανόμενων των νομίμων και παρανόμων μεταναστών. Αν και οι περισσότεροι Αλβανοί δεν ανήκουν σε κάποια θρησκεία, παραδοσιακά συνδέονται με τη Μουσουλμανική, την Ορθόδοξη, ή τη Ρωμαιοκαθολική πίστη. Εκτός της εντόπιας Μουσουλμανικής μειονότητας στη Θράκη, οι Μουσουλμάνοι μετανάστες που βρίσκονται στην υπόλοιπη χώρα υπολογίζεται ότι ανέρχονται σε 200.000-300.000.» [6]\n" +
"Τις τελευταίες δεκαετίες η Ελλάδα έχει δεχτεί ένα μεγάλο κύμα μετανάστευσης. Ο συνολικός αριθμός των μεταναστών υπολογίζεται περίπου στο 10% του συνολικού πληθυσμού ή στις 950.000 ανθρώπους. Νόμιμοι κάτοικοι της χώρας είναι περίπου οι μισοί αν και οι αριθμοί έχουν μεγάλη διακύμανση λόγω της έλλειψης επίσημης μεταναστευτικής πολιτικής και της αστάθειας στις γειτονικές χώρες πηγές μεταναστών. Οι μεγαλύτερες πληθυσμιακές ομάδες σύμφωνα με την απογραφή του 2001 φαίνεται να είναι οι προερχόμενοι από Αλβανία, Ρουμανία, Βουλγαρία, Πακιστάν, Ουκρανία, Πολωνία, Αίγυπτο.\n" +
"Πέρα από τους αλλοδαπούς μετανάστες έχουν έρθει μετά την πτώση του Τείχους και αρκετοί ομογενείς από περιοχές της πρώην Ε.Σ.Σ.Δ. και από τα Βαλκάνια. Οι μεγαλύτερες ομάδες παλιννοστούντων είναι από την Αλβανία, την Ρωσία και την Γεωργία.\n" +
"[Επεξεργασία]\n" +
"Ένοπλες δυνάμεις και Σώματα ασφαλείας\n" +
"\n" +
"Ελληνικές Ένοπλες Δυνάμεις:\n" +
"Ελληνικός Στρατός\n" +
"Ελληνικό Πολεμικό Ναυτικό\n" +
"Ελληνική Πολεμική Αεροπορία\n" +
"Σώματα ασφαλείας:\n" +
"Ελληνική Αστυνομία\n" +
"Πυροσβεστικό Σώμα\n" +
"Λιμενικό Σώμα\n" +
"[Επεξεργασία]\n" +
"Υποχρεωτική στράτευση\n" +
"Κύριο άρθρο: Η θητεία στην Ελλάδα\n" +
"Μέχρι το 2004, η Ελλάδα είχε νομοθετήσει υποχρεωτική θητεία 12 μηνών, για όλους τους άνδρες άνω των 18 ετών. Ωστόσο, κινείται προς την ανάπτυξη ενός πλήρως επαγγελματικού στρατού, με στόχο την πλήρη κατάργηση της θητείας. Το Υπουργείο Εθνικής Άμυνας έχει αναγγείλει τη σταδιακή μείωση στους 6 μήνες το 2008 και πιθανολογείται ότι μπορεί και να καταργηθεί τελείως. Παρότι γίνονται δεκτές αιτήσεις γυναικών που θέλουν να υπηρετήσουν, δεν είναι υποχρεωτικό. Η κίνηση αυτή δημιουργεί αντιρρήσεις από τους κύκλους που αντιτίθενται στην υποχρεωτική στράτευση, γιατί ενώ το Άρθρο 2 του Ελληνικού Συντάγματος θέτει υπόχρεους όλους τους Έλληνες πολίτες να υπερασπιστούν την Ελλάδα, ο φόρτος έγκειται ολοκληρωτικά στον ανδρικό πληθυσμό.\n" +
"Οι κληρωτοί δεν λαμβάνουν ιατρική ασφάλιση κατά τη διάρκεια της θητείας τους, ούτε ο χρόνος της θητείας συνυπολογίζεται στα χρόνια εργασίας τους που θεμελιώνουν το συνταξιοδοτικό δικαίωμα. Λαμβάνουν, όμως, πλήρη ιατρική και νοσοκομειακή περίθαλψη από τα κατά τόπους στρατιωτικά νοσοκομεία, εφ' όσον αυτά υπάρχουν στον τόπο που υπηρετούν, αλλιώς αναγκάζονται να μεταφερθούν στην Αθήνα. Ο μισθός του κληρωτού είναι συμβολικός (9 ευρώ το μήνα για τους οπλίτες, σμηνίτες, κληρωτούς, 11 ευρώ για τους στρατεύσιμους δεκανείς, υποσμηνίες, υποκελευστές και τους στρατεύσιμους λοχίες, σμηνίες, κελευστές και 600 ευρώ για τους δόκιμους και των τριών σωμάτων). Οι δόκιμοι υπηρετούν 5 μήνες παραπάνω από τους υπόλοιπους συναδέλφους τους. Ο μισθός δεν αρκεί για να καλύψει τα έξοδα των κληρωτών, ιδιαίτερα όταν ένας κληρωτός υπηρετεί μακριά από τον τόπο διαμονής του, με αποτέλεσμα πρακτικά οι κληρωτοί να ζούνε από την οικονομική στήριξη των γονέων τους κατά την διάρκεια της θητείας τους.\n" +
"[Επεξεργασία]\n" +
"Πολιτισμός\n" +
"\n" +
"Κατάλογος διάσημων Ελλήνων\n" +
"Ελληνική μυθολογία\n" +
"Αρχαία ελληνική λογοτεχνία\n" +
"Ελληνική Αρχιτεκτονική\n" +
"Ελληνική κουζίνα\n" +
"Ελληνική Γλώσσα\n" +
"Ελληνική Μουσική\n" +
"Ελληνικά Μουσεία\n" +
"Μέσα Ενημέρωσης\n" +
"[Επεξεργασία]\n" +
"Αργίες\n" +
"Ημερομηνία	Ονομασία	Σχόλια\n" +
"1 Ιανουαρίου	Πρωτοχρονιά	 \n" +
"6 Ιανουαρίου	Θεοφάνεια	 \n" +
"κινητή	Καθαρά Δευτέρα	έναρξη της Μεγάλης Τεσσαρακοστής\n" +
"25η Μαρτίου	Ευαγγελισμός της Θεοτόκου και Εθνική Εορτή	Εθνική Εορτή για την Επανάσταση του 1821\n" +
"κινητή	Μεγάλη Παρασκευή	 \n" +
"κινητή	Πάσχα	Ανάσταση του Χριστού\n" +
"κινητή	Δευτέρα Διακαινησίμου (Δευτέρα του Πάσχα)	Δευτέρα μετά την Ανάσταση\n" +
"1 Μαΐου	Πρωτομαγιά	 \n" +
"κινητή	Αγίου Πνεύματος	 \n" +
"15 Αυγούστου	Κοίμηση της Θεοτόκου	 \n" +
"28η Οκτωβρίου	Επέτειος του Όχι	Εθνική Εορτή (1940)\n" +
"25 Δεκεμβρίου	Χριστούγεννα	 \n" +
"26 Δεκεμβρίου	Σύναξις Θεοτόκου	 \n" +
"[Επεξεργασία]\n" +
"Σημειώσεις\n" +
"\n" +
"↑ www.destatis.de εκτίμηση πληθυσμού χώρας, 2006\n" +
"↑ Σύνταγμα της Ελλάδας, άρθρο 30\n" +
"↑ 3,0 3,1 Σύνταγμα της Ελλάδας, άρθρο 82\n" +
"↑ 4,0 4,1 4,2 Πηγάζει στη Βουλγαρία\n" +
"↑ 5,0 5,1 απογραφή 2001\n" +
"↑ Πηγή: Διεθνής Έκθεση Θρησκευτικής Ελευθερίας του 2005 στην ελληνική και στην αγγλική, Υπουργείο Εξωτερικών των Η.Π.Α.\n" +
"[Επεξεργασία]\n" +
"Δείτε επίσης\n" +
"\n" +
"Σημαία της Ελλάδας\n" +
"Κατάλογος γλωσσών της Ελλάδας\n" +
"Τράπεζα της Ελλάδος\n" +
"Ονομασίες της Ελλάδας σε διάφορες γλώσσες\n" +
"Άτλας της Ελλάδας: συλλογή διαφόρων χαρτών της Ελλάδας στα Κοινά (Commons).\n" +
"Κατάλογος νοσοκομείων της Ελλάδας\n" +
"[Επεξεργασία]\n" +
"Εξωτερικές συνδέσεις\n" +
"\n" +
"Πρωθυπουργός της Ελλάδας (Γραφείο Πρωθυπουργού)\n" +
"Βουλή των Ελλήνων\n" +
"Παράθυρο στην Ελλάδα (χρήσιμες πληροφορίες και σύνδεσμοι για την Ελλάδα)\n" +
"Παράθυρο στην Ελλάδα (παλαιότερη «έκδοση»)\n" +
"Ελληνικός Οργανισμός Τουρισμού\n" +
"Υπουργείο Εξωτερικών\n";


var hebrew =
"היסטוריה של סין\n" +
"מתוך ויקיפדיה, האנציקלופדיה החופשית\n" +
"קפיצה אל: ניווט, חפש\n" +
"\n" +
"    ערך זה עוסק בההיסטוריה של הישות התרבותית והגאוגרפית במזרח אסיה. אם התכוונתם לההיסטוריה של מדינה המוכרת היום בשם \"סין\", ראו היסטוריה של הרפובליקה העממית של סין.\n" +
"\n" +
"בערך זה מופיע גופן מזרח אסייתי\n" +
"\n" +
"כדי שתוכלו לראות את הכתוב בערך זה בצורה תקינה, תצטרכו להתקין גופן מזרח אסייתי במחשבכם. אם אינכם יודעים כיצד לעשות זאת, לחצו כאן לקבלת עזרה\n" +
"\n" +
"סין הנה התרבות המפותחת והרציפה העתיקה ביותר בעולם, תיעודים כתובים של התרבות נמצאים כבר מלפני 3,500 שנים והסינים עצמם נוקבים במספר 5,000 כמספר שנות קיומה של תרבותם. שושלות השלטון בסין פיתחו לאורך השנים שיטות בירוקרטיה שלטונית שהעניקו לסינים יתרון משמעותי על העמים השבטיים שחיו מסביבם. פיתוח אידאולוגיה למדינה, המבוססת על משנתו הפילוסופית של קונפוציוס (המאה ה-1 לפנה\"ס), יחד עם פיתוח מערכת כתב זמינה לכל (המאה ה-2 לפנה\"ס) חיזקו עוד יותר את התרבות הסינית. מבחינה פוליטית, סין נעה בתנועה מתמדת בין איחוד ופירוד ולעתים גם נכבשה על ידי כוחות זרים אשר מרביתם התמזגו לתוך תרבותה והפכו לחלק בלתי נפרד ממנה. השפעות תרבותיות ופוליטיות אלו שהגיעו מכל קצוות אסיה כמו גם גלי הגירה אל ומחוץ למדינה יצרו יחד את דמותם של התרבות והעם הסיני כפי שהם מוכרים לנו היום.\n" +
"היסטוריה של סין\n" +
"\n" +
"    * התקופה הקדומה\n" +
"\n" +
"    שלושת המלכים וחמשת הקיסרים\n" +
"    שושלת שיה\n" +
"    שושלת שאנג\n" +
"    שושלת ג'ואו\n" +
"    תקופת האביב והסתיו\n" +
"    תקופת המדינות הלוחמות\n" +
"\n" +
"    * סין הקיסרית\n" +
"\n" +
"    שושלת צ'ין\n" +
"    שושלת האן המערבית\n" +
"    שושלת שין\n" +
"    שושלת האן המזרחית\n" +
"    שלושת הממלכות\n" +
"    שושלת ג'ין\n" +
"    השושלת הצפונית והדרומית\n" +
"    שושלת סוי\n" +
"    שושלת טאנג\n" +
"    שושלת סונג\n" +
"    שושלת יו'אן\n" +
"    שושלת מינג\n" +
"    שושלת צ'ינג\n" +
"\n" +
"    * התפוררות הקיסרות\n" +
"\n" +
"    מלחמת האופיום הראשונה\n" +
"    מרד טאיפינג\n" +
"    מלחמת האופיום השנייה\n" +
"    מלחמת סין-צרפת\n" +
"    מלחמת סין-יפן הראשונה\n" +
"    רפורמת מאה הימים\n" +
"    מרד הבוקסרים\n" +
"\n" +
"    * סין המודרנית\n" +
"\n" +
"    מהפכת שינהאי\n" +
"    הקמתה של המפלגה הקומניסטית של סין\n" +
"    המצעד הארוך\n" +
"    תקרית שיאן\n" +
"    מלחמת סין-יפן השנייה\n" +
"    מלחמת האזרחים הסינית\n" +
"\n" +
"    * העת החדשה\n" +
"\n" +
"    הקמת הרפובליקה העממית של סין\n" +
"    מערכת מאה הפרחים\n" +
"    הזינוק הגדול קדימה\n" +
"    הפיצול הסיני-סובייטי\n" +
"    מלחמת הודו-סין\n" +
"    מהפכת התרבות בסין\n" +
"    תקרית טיאנאנמן\n" +
"\n" +
"ראו גם\n" +
"\n" +
"    * הרפובליקה הסינית\n" +
"    * לוח זמנים של ההיסטוריה של סין\n" +
"\n" +
"פורטל סין\n" +
"קטגוריה ראשית\n" +
"\n" +
"\n" +
"תוכן עניינים\n" +
"[הסתר]\n" +
"\n" +
"    * 1 פרה-היסטוריה\n" +
"          o 1.1 שלושת המלכים וחמשת הקיסרים\n" +
"    * 2 היסטוריה קדומה\n" +
"          o 2.1 שושלת שְׂיָה\n" +
"          o 2.2 שושלת שָׁאנְג\n" +
"          o 2.3 שושלת ג'וֹאוּ\n" +
"          o 2.4 תקופת האביב והסתיו\n" +
"          o 2.5 תקופת המדינות הלוחמות\n" +
"    * 3 שושלת צ'ין: האימפריה הסינית הראשונה\n" +
"    * 4 שושלת האן: תקופה של שגשוג\n" +
"    * 5 ג'ין, שש עשרה הממלכות והשושלות הדרומית והצפונית: התקופה האפלה של סין\n" +
"    * 6 שושלת טאנג: חזרה לשיגשוג\n" +
"    * 7 שושלת סונג ושכנותיה הצפוניות, ליאו וג'ין\n" +
"    * 8 המונגולים\n" +
"    * 9 תחייתה מחדש של התרבות הסינית\n" +
"    * 10 תקופת מינג: מהתפתחות לבידוד\n" +
"    * 11 שושלת צ'ינג\n" +
"    * 12 הרפובליקה הסינית\n" +
"    * 13 הרפובליקה העממית של סין\n" +
"    * 14 ראו גם\n" +
"    * 15 לקריאה נוספת\n" +
"    * 16 קישורים חיצוניים\n" +
"    * 17 הערות שוליים\n" +
"\n" +
"[עריכה] פרה-היסטוריה\n" +
"\n" +
"העדויות הארכאולוגיות הקדומות ביותר לנוכחות אנושית בסין של ימינו הן של הומו ארקטוס. מחקרים חדשים מגלים כי עמודי האבן שנמצאו באתר שיאוצ'אנגליאנג מתאורכים מבחינה סטרטיגרפית מלפני 1.36 מיליוני שנים. באתר הארכאולוגי שִׂיהוֹאוּדוּ שבמחוז שאנסי נמצאות העדויות הראשונות בעולם לשימוש באש על ידי ההומו ארקטוס, ומתאורכות ללפני 1.27 מיליוני שנים. עם זאת תושביו הנוכחיים של האזור אינם צאצאי אותו הומו ארקטוס, אלא צאצאי הומו סאפיינס שהגיע לאזור מאזור אפריקה רק לפני 65,000 שנים.\n" +
"\n" +
"עדויות מוקדמות לחקלאות סינית טיפוסית – גידולי אורז בברכות – מתוארכות לשנת 6,000 לפנה\"ס. בדומה לתרבויות קדומות בכל העולם, הביאה החקלאות לגידול מהיר באוכלוסייה, כיוון שהתבססות על גידולים חקלאיים הבטיחה יכולת שימור המזון ואגירתו לזמן ממושך יותר, וזו הביאה בהדרגה לגידול האוכלוסייה, להתפתחותה התרבותית ולריבוד חברתי.\n" +
"\n" +
"בשלהי התקופה הניאוליטית החל עמק הנהר הצהוב בסין לפתח את מעמדו כמרכז תרבותי, כאשר ראשוני הכפרים באזור הופיעו שם. מרבית העדויות למרכז חשוב זה נמצאות באזור העיר שי-אן בסין.\n" +
"\n" +
"[עריכה] שלושת המלכים וחמשת הקיסרים\n" +
"\n" +
"    ערך מורחב – שלושת המלכים וחמשת הקיסרים\n" +
"\n" +
"ספרי ההיסטוריה הקדומים, רשומות ההיסטוריון, שנכתבו על ידי ההיסטורוגרף הסיני סְה-מָה צְ'ייֵן במאה השנייה לפנה\"ס, וספר תולדות החיזרן, שנכתבו במאה הרביעית לפנה\"ס מתארכים את תחילת ההיסטוריה הסינית לתקופת שלושת המלכים וחמשת הקיסרים - 2800 לפנה\"ס. לתקופה זו מאפיינים מיתולוגיים מובהקים. למלכים ולקיסרים תכונות מיסטיות והם מתוארים כשליטים נבונים ובעלי מוסר למופת. אחד מהם, הקיסר הצהוב נחשב לאבי בני ההאן.\n" +
"\n" +
"סה-מה צ'יאן כותב כי תחילת ביסוס מערכת ממשלתית נעשה בימי שושלת שיה, וסגנון המערכת הונצח על ידי שושלות שאנג וג'ואו. בתקופת שלושת השושלות האלו, החלה סין לפצוע על שחר ההיסטוריה. מכאן ואילך, עד למאה העשרים, מתוארות תולדות סין לפי השושלות שמשלו בה.\n" +
"\n" +
"[עריכה] היסטוריה קדומה\n" +
"\n" +
"[עריכה] שושלת שְׂיָה\n" +
"\n" +
"    ערך מורחב – שושלת שיה\n" +
"\n" +
"שושלת שְׂיָה (סינית: 夏, פיניין: Xià), היא השושלת הראשונה בתולדות סין. שושלת זו התקיימה לפני המצאת הכתב בסין, כך שהעדויות לקיומה מסתמכות על מסמכים מאוחרים יותר ועל ארכאולוגיה. סְה-מָה צְ'ייֵן וספר תולדות החיזרן מתארכים את ימי השושלת לכלפני 4,200 שנה, אולם אין בידינו לאמת את הדברים. 17 מלכים ו-14 דורות מנתה השושלת, שהתחילה בימיו של יוּ'‏ הגדול והסתיימה בימיו של גְ'יֵה איש שְׂיָה, כך על-פי סְה-מָה צְ'ייֵן ומקורות אחרים מתקופת שושלת צ'ין.\n" +
"\n" +
"שושלות שאנג וג'ואו התקיימו במקביל לשושלת שיה כבר מתחילתה, אך היו כפופות לה. אורך ימיה של השושלת לא ברור, אך 431 או 471 שנים הן שתי החלופות הסבירות ביותר.\n" +
"\n" +
"ארכאולוגים רבים מזהים את שושלת שְׂיָה עם אתר אָרלִיטוֹאוּ שבמרכז מחוז הנאן[1]. באתר זה נתגלה כור היתוך מברונזה משנת 2000 לפנה\"ס לערך. נטען גם כי סימונים על-גבי חרס וקונכיות מתקופה זו הן גילגול קדום של הכתב הסיני[2]. בהיעדר עדויות כתובות בכתב המוכר מעצמות הניחוש של שושלת שאנג ומכלי הברונזה של שושלת ג'ואו, נותר טיבה של שושלת שיה לוט בערפל.\n" +
"\n" +
"[עריכה] שושלת שָׁאנְג\n" +
"\n" +
"    ערך מורחב – שושלת שאנג\n" +
"\n" +
"הרישומים הכתובים העתיקים ביותר בסין נחרטו לצורך הגדת עתידות על עצמות או קונכיות. כתבים אלה, המכונים עצמות ניחוש, מתוארכים למאה ה-13 לפנה\"ס לערך, תקופת שושלת שָׁאנְג (סינית: 商, פיניין: Shāng). ממצאים ארכאולוגיים, המעידים על קיומה של השושלת בשנים 1600-1046 לפנה\"ס בקירוב, מחולקים לשתי קבוצות. הקבוצה המוקדמת, עד ל-1300 בקירוב, מגיעה מאתרים שונים במחוז הנאן. הקבוצה המאוחרת, מתקופת יִין (殷), מורכבת מאסופה רחבה של עצמות ניחוש, גם הן ממחוז הנאן. אָנְיָאנְג שבמחוז הנאן הייתה הבירה התשיעית והאחרונה של שושלת שאנג. לשושלת היו 31 מלכים, והיא הייתה הארוכה שבשושלות סין.\n" +
"\n" +
"על פי רשומות ההיסטוריון העבירה שושלת שאנג את בירתה שש פעמים, כשהמעבר השישי והאחרון לעיר יִין ב-1350 לפנה\"ס סימן את תחילת תור הזהב של השושלת. ההיסטוריה התמטית של סין מתארת בדרך-כלל קיום של שושלת אחת אחרי השנייה, אך המצב לאשורו באותה עת היה מורכב יותר. חוקרים טוענים כי ייתכן ושושלות שיה ושאנג התקיימו במקביל, כשם ששושלת ג'ואו (שֶׁירשה את שושלת שאנג), התקיימה אף היא בזמן שושלת שאנג. עדויות כתובות מאתר אניאנג מאששים אמנם את קיומה של שושלת שאנג, אך חוקרים מערביים אינם נוטים לזהות יישובים בני אותה תקופה עם שושלת שאנג דווקא. כך למשל, ממצאים ארכאולוגיים מאותה עת באתר סָאנְשִׂינְגְדְווֵי מצביעים על חברה מתקדמת, השונה בתרבותה מזו שנתגלתה בְּאָנְיָאנְג. אין עדויות מכריעות במוגע לתחום שליטתה של שושלת שאנג. ההנחה המקובלת היא כי שושלת שאנג שבהיסטוריה הרשמית אכן שלטה בעיר אניאנג, תוך שהיא מקיימת קשרי מסחר עם יישובים שונים בסביבתה, שהיו שונים זה מזה מבחינה תרבותית.\n" +
"\n" +
"[עריכה] שושלת ג'וֹאוּ\n" +
"\n" +
"    ערך מורחב – שושלת ג'ואו\n" +
"\n" +
"שושלת ג'וֹאוּ (סינית: 周, פיניין: Zhōu), הייתה השושלת ששלטה את הזמן הארוך ביותר בסין, מ-1122 לפנה\"ס ועד 256 לפנה\"ס - 866 שנה. השושלת התחילה להתגלות בנהר הצהוב והתפשטה אל תוך גבולותיה של השאנג. השושלת התחילה את שליטתה כפיאודליזם. הג'ואו חיו מערבית לשאנג, ושליטם היה מכונה בפיהם של שאנג כ\"מגן המערבי\". שליט ג'ואו המלך ווּ, בעזרת דודו הדוכס של ג'ואו, הצליחו להכניע את אחרון קיסרי שאנג בקרב שקבל את השם הקרב של מויה. היה זה מלכה של ג'ואו באותו הזמן, שטבע את מושג מנדט השמים, רעיון לפיו השמים הם המחליטים מי יהיה הקעסר הבא, ודרכם להביע את זה היא הצלחתו של הקיסר בניהול מלכותו, כך שמרד נתפס כלגיטימי, כל עוד זכה להצלחה. הקיסר העביר את בירתו אל עבר מערב האזור, סמוך למקום המכונה כיום שיאן, לגדות הנהר הצהוב, אולם שליטתם התפרסה אל כל עבר מושבות נהר היאנגטסה. זו הייתה ההגירה הראשונה בגודל כזה מצפון סין לדרומה.\n" +
"\n" +
"[עריכה] תקופת האביב והסתיו\n" +
"\n" +
"    ערך מורחב – תקופת האביב והסתיו\n" +
"\n" +
"תקופת האביב והסתיו (בסינית: 春秋時代) הוא כינויה של תקופה בין השנים 722 לפנה\"ס ל 481 לפנה\"ס. שמה של התקופה לקוח משם הספר רשומות האביב והסתיו, תיעוד היסטורי של אותה תקופה אשר נכתב בידי קונפוציוס.\n" +
"\n" +
"במהלך התקופה נערכו מלחמות רבות בין המדינות שהרכיבו באותה תקופה את סין מה שהביא לביזור של הכח השלטוני בסין העתיקה. בעקבות המלחמות הודחו שליטים רבים מכסאם, ושכבת האצולה בסין התפוררה למעשה. עם התפשטותם של האצילים ברחבי הארץ נפוצה איתם גם ידיעת הקרוא וכתוב אשר הייתה נחלתם הכמעט בלעדית של האצילים עד לאותה תקופה. התפשטות הקריאה והכתיבה עודדה את חופש המחשבה וההתפתחות הטכנולוגית. לאחר תקופת האביב והסתיו החלה בסין תקופת מלחמת המדינות.\n" +
"\n" +
"[עריכה] תקופת המדינות הלוחמות\n" +
"\n" +
"    ערך מורחב – תקופת המדינות הלוחמות\n" +
"\n" +
"תקופת המדינות הלוחמות (סינית: 戰國, פיניין: Zhàn Guó) החלה במאה החמישית לפנה\"ס והסתיימה בשנת 221 לפנה\"ס באיחודה של סין על ידי שושלת צ'ין. רשמית, בתקופת המדינות הלוחמות, כמו גם בתקופה שקדמה לה, תקופת האביב והסתיו, הייתה סין תחת שלטונה של שושלת ג'וֹאוּ המזרחית, אך שליטה זו הייתה רק להלכה, ולשושלת לא הייתה השפעה ממשית, ולמעשה חדלה להתקיים 35 שנה לפני סיומה הרשמי של התקופה. את שמה קיבלה התקופה מ\"רשומות המדינות הלוחמות\", תיעוד היסטורי של התקופה, שנכתב בתקופת שושלת האן.\n" +
"\n" +
"תקופת המדינות הלוחמות, שלא כמו תקופת האביב והסתיו, הייתה תקופה בה שרי צבא ואריסטוקרטים מקומיים סיפחו לאחוזותיהם כפרים, ערים ומדינות זעירות סמוכות והשליטו עליהם את שלטונם. במאה השלישית לפנה\"ס הביא מצב זה ליצירת שבע מדינות עיקריות בסין: מדינות צִ'י (齊), צ'וּ (楚), יֵן (燕), הַאן (韓), גָ'או (趙), ווֶי (魏) וצִ'ין (秦). סימן נוסף לשינוי במעמדם של הגנרלים היה שינוי תארם הרשמי מגונג (公 - המקבילה הסינית לדוכס), הכפופים כביכול למלך של ג'ואו, לוואנג (王) - מלכים, השווים במעמדם למלך של ג'ואו.\n" +
"\n" +
"תקופת המדינות הלוחמות היא גם תחילתו של השימוש בברזל במקום ארד בסין כמתכת עיקרית בכל תחומי החיים האזרחיים והצבאיים. במהלך תקופה זו החלו להבנות החומות, שיגנו על הממלכות מפני פלישה של שבטים ברבריים מהצפון חומות, שהיוו את היסוד לחומה הסינית המאוחרת יותר. מאפיין תרבותי נוסף של התקופה היה הפיכתן של פילוסופיות שונות כגון קונפוציזם, דאואיזם, לגאליזם, ומוהיזם למעמד של דתות במדינות השונות.\n" +
"\n" +
"בתום התקופה, לאחר שממלכת צ'ין הצליחה להביס ולכבוש את שאר הממלכות, הפך המלך צ'ין לקיסר הראשון של סין המאוחדת.\n" +
"\n" +
"[עריכה] שושלת צ'ין: האימפריה הסינית הראשונה\n" +
"\n" +
"    ערך מורחב – שושלת צ'ין\n" +
"\n" +
"סין אוחדה לראשונה בשנת 212 לפנה\"ס בידי צִ'ין שְׁה-חְוָאנג, מייסד שושלת צ'ין. קדמה לאיחוד תקופת מלחמת המדינות ותקופת האביב והסתיו, שהתאפיינו שתיהן במספר ממלכות שהתקיימו במקביל ולחמו זו בזו. בשנת 212 לפנה\"ס עלה בידו של צ'ין להשתלט סופית על כל הממלכות בסין העתיקה ולשים קץ למלחמות הפנימיות.\n" +
"\n" +
"למרות שהאימפריה המאוחדת של הקיסר צ'ין התקיימה רק 12 שנים, הצליח הקיסר בזמן מועט זה למסד את רוב שטחה של המדינה כפי שאנו מכירים אותה כיום ולהשליט בה משטר ריכוזי המבוסס על לגאליזם אשר מושבו היה בשיאניאנג, שיאן של ימינו. שושלת צ'ין מפורסמת גם בשל תחילת בנייתה של החומה הסינית הגדולה (החומה הוגדלה בתקופת שושלת מינג). בניו של הקיסר לא היו מוצלחים כמוהו, ועם מותו של הקיסר תמה תקופת שלטונה של שושלתו.\n" +
"\n" +
"מקור המילה סין בשפה העברית וכן בשפה האנגלית (China), מגיע ככל הנראה מהמילה צ'ין (秦), שמה של השושלת הראשונה.\n" +
"\n" +
"[עריכה] שושלת האן: תקופה של שגשוג\n" +
"\n" +
"    ערך מורחב – שושלת האן\n" +
"\n" +
"שושלת האן הופיעה בסין בשנת 202 לפנה\"ס. בתקופת שלטונה הפכה הקונפוציוניזם לדת המדינה ולפילוסופיה המנחה אותה ואשר המשיכה להנחות את המשטר הסיני עד לסוף התקופה הקיסרית בתחילת המאה ה-20. תחת שלטון ההאן עשתה התרבות הסינית התקדמות אדירה בתחומי ההיסטוריוגפיה, האומנות והמדע. הקיסר וו חיזק והרחיב את הממלכה בהודפו את ה\"שׂיוֹנג-נוּ\" (שבטים שלעתים מזוהים עם ההונים) אל תוך מונגוליה של ימינו, תוך שהוא מספח לממלכתו את השטחים בהם ישבו שבטים אלו. שטחים חדשים אלו אפשרו לסין לראשונה לפתוח קשר מסחר עם המערב: דרך המשי.\n" +
"\n" +
"אולם, השתלטותן של משפחות אצולה על אדמות המדינה, עירערה את בסיס המיסוי של הממלכה, גורמות בכך חוסר יציבות שלטוני. חוסר היציבות הזה נוצל על ידי וואנג מנג, שהקים את שושלת שין שהחזיקה מעמד זמן קצר מאוד. וואנג החל לבצע רפורמות ענפות בהחזקת האדמות ובכלכלה. תומכיה העיקריים של הרפורמה היו האיכרים ובני המעמדות הנמוכים, אך משפחות האצולה שהחזיקו באדמות, התנגדות להן בכל תוקף. עקב כך נוצא מצב של כאוס והתקוממויות רבות במדינה. צאצאה של שושלת האן, הקיסר גואנגוו, ייסד מחדש את שושלת האן בתמיכתם של משפחות האצילים והסוחרים בלוו-יאנג, מזרחית לשיאן, מכאן קיבל העידן החדש שהחל אז את שמו: שושלת האן המזרחית. אולם ייסודה מחדש של השושלת לא הביא את השקט הרצוי לממלכה. עימותים עם בעלי הקרקעות, יחד עם פלישות מבחוץ ומאבקים פנימיים במיעוטים החלישו שוב את השלטון. מרד הטורבן הצהוב שפרץ בשנת 184, סימן את תחילתו של עידן בו שליטים צבאיים מובילים מלחמות בתוך המדינה ומחלקים את המדינה למספר מדינות קטנות. תקופה זו ידועה כתקופת שלוש הממלכות.\n" +
"\n" +
"[עריכה] ג'ין, שש עשרה הממלכות והשושלות הדרומית והצפונית: התקופה האפלה של סין\n" +
"\n" +
"    ערך מורחב – שושלת ג'ין\n" +
"\n" +
"שלוש הממלכות התאחדו בשנת 280 תחת שלטונה של שושלת ג'ין. אולם איחוד זה נמשך זמן קצר מאוד. בתחילת המאה ה-4 החלו המיעוטים בסין (כיום מכונים סינים לא בני האן ) להתמרד ולבתר את המדינה, גורמים בכך להגירה עצומה של סינים בני האן אל מדרום לנהר היאנגטסה. בשנת 303 החלו אנשי מיעוט הדאי במרד שבסופו הם כבשו את צ'נגדו שבסצ'ואן. השׂיוֹנְג-נוּ, שנהדפו מסין בתחילת שלטונה של שושלת האן, חזרו להלחם בסין, כבשו חלקים ממנה והוציאו להורג את שני קיסריה האחרונים של שושלת ג'ין. יותר משש-עשרה מדינות הוקמו על ידי המיעוטים האתניים בצפונה של סין. הצפון הכאוטי אוחד לזמן קצר על ידי פו ג'יאן, אך הוא הובס בנסיון פלישתו לדרום סין וממלכתו התפוררה. נסיון נוסף לאיחוד הצפון בוצע על ידי הקיסר טאיוון, שהקים את השושלות הצפוניות, סדרה של משטרים מקומיים ששלטו בסין שמצפון לנהר היאנג צה.\n" +
"\n" +
"עם הפליטים שנסו לדרומה של המדינה, היה גם הקיסר יואן, נצר לשושלת ג'ין, שחידש את שלטון השושלת בדרום המדינה . שושלת זו הייתה הראשונה מבין השושלות הדרומיות שכללו את שושלות סונג, צי, ליאנג וצ'ן. בירתן של השושלות הדרומיות הייתה ג'יאנקאנג, ליד ננג'ינג של ימינו. התקופה בה התקיימו במקביל שתי מדינות הנשלטות על ידי שושלות שונות בצפונה ובדרומה של הארץ נקראה תקופת השושלות הצפונית והדרומית. שושלת סוי קצרת המועד, הצליחה לאחד את המדינה ב589 לאחר כמעט 300 שנות פירוד.\n" +
"\n" +
"[עריכה] שושלת טאנג: חזרה לשיגשוג\n" +
"\n" +
"    ערך מורחב – שושלת טאנג\n" +
"\n" +
"בשנת 618 נוסדה שושלת טאנג, פותחת עידן חדש של שיגשוג וחידושים בתחומי האמנות והטכנולוגיה. בתקופה זו פעלו משוררים נודעים כלי באי ודו פו. הבודהיזם, שהחל חודר לסין כבר במאה ה-1, הוכרז כדת הרשמית של המדינה ואומץ על ידי המשפחה הקיסרית. צ'אנג-אן (שיאן של ימינו), בירת השושלת הייתה באותה תקופה העיר הגדולה ביותר בעולם. תקופות טאנג והאן נחשבות לרוב כתקופות השגשוג הממושכות ביותר בהיסטוריה של סין. אולם, על אף השגשוג, כוחה של שושלת טאנג החל להחלש והמדינה החלה נקרעת בשנית בידי שליטים מקומיים. תקופה נוספת של כאוס הגיעה למדינה: תקופת חמש השושלות ועשר הממלכות.\n" +
"\n" +
"[עריכה] שושלת סונג ושכנותיה הצפוניות, ליאו וג'ין\n" +
"\n" +
"    ערך מורחב – שושלת סונג\n" +
"\n" +
"בשנת 960 הצליחה שושלת סונג לאסוף מספיק כח כדי לאחד את סין תחת שלטונה. תחת שלטון סונג, שבירתו הייתה קאיפנג, החלה תקופת צמיחה חדשה בסין. אולם שושלת סונג לא הייתה הכח הפוליטי הגדול היחיד באזור. במנצ'וריה ובמזרח מונגוליה התהוותה ממלכתה של שושלת ליאו החיטאנית וב1115 עלתה לשלטון במנצ'וריה שושלת ג'ין הג'ורצ'נית (הג'ורצ'נים היו אבותיהם של המנצ'ורים) שתוך 10 שנים בלעה את שושלת ליאו לתוכה. שושלת ג'ין השתלטה גם על שטחים בצפון סין, בתוכם הבירה הסינית קאיפנג, מה שאילץ את שושלת סונג הסינית להעביר את בירתה לחאנגג'ואו. שושלת סונג גם אולצה על ידי שושלת ג'ין להכריז על הכרתה בשושלת ג'ין כשליטה העליונה שלה. בתקופה שלאחר מכן הוקמו שלוש ממלכות גדולות בשטחה של סין (ממלכת סונג, ממלכת ג'ין וממלכה שלישית של מיעוטים שנקראה ממלכת שיה המערבית). בתקופה זו נעשו פיתוחים משמעותיים בטכנולוגיה, ככל הנראה עקב הלחץ הצבאי שהופעל על ממלכת סונג מצד שכנותיה הצפוניות.\n" +
"\n" +
"[עריכה] המונגולים\n" +
"\n" +
"ממלכת ג'ין הייתה הראשונה מבין הממלכות בסין שהובסה על ידי המונגולים, שהמשיכו וכבשו גם את ממלכת סונג במלחמה ארוכה ועקובה מדם שהייתה המלחמה הראשונה בהיסטוריה בה נעשה שימוש מכריע בנשק חם. לאחר תום המלחמה החל עידן של שלום כמעט בכל אסיה (שהייתה נתונה לשלטון המונגולים), עידן שנקרא \"השלום המונגולי\" (Pax Mongolica). שלום זה איפשר לנוסעים מהמערב, דוגמת מרקו פולו, להגיע לסין ולחשוף לראשונה את אוצרתיה למערב. בסין, נחלקו המונגולים בין אלו שרצו להחיל בסין את מנהגי המונגולים ובין אלו שרצו לאמץ את המנהגים הסינים לעצמם. קובלאי חאן, שנמנה עם הקבוצה השנייה, הקים בסין את שושלת יואן (מילולית: \"השושלת הראשונה\") זו הייתה הממלכה הראשונה שהשתרעה על כל שטחה של סין ושבירתה הייתה בייג'ינג (בייג'ינג הייתה בירתה של שושלת גי'ן אך השושלת לא שלטה על סין כולה).\n" +
"\n" +
"[עריכה] תחייתה מחדש של התרבות הסינית\n" +
"\n" +
"בקרב העם בסין, הייתה התמרמרות רבה ביחס לשלטון ה\"זרים\" החדש, התמרמרות שלבסוף הובילה להתקוממויות איכרים במדינה שהתפתחו למאבק בשלטון שנדחף למעשה אל מחוץ לגבולותיה של סין. את השלטון המונגולי החליף שלטונה של שושלת מינג בשנת 1368. שושלת זו פתחה תקופה של פריחה והתחדשות תרבותית: האומנות, ובעיקר תעשיית הפורצלן, נסקה לגבהים שלא נודעו קודם לכן, סחורות סיניות נעו ברחבי האוקיינוס ההודי, מגיעות עד לחופיה המזרחיים של אפריקה במסעותיו של צ'נג חה. סין בנתה צי ספינות שהגדולות מבניהן שינעו 1,500 טונות של סחורות וחיילים מהצבא בן מיליון החיילים שהיה ברשותה באותה העת. יותר מ100,000 טונות ברזל יוצרו כל שנה וספרים רבים נדפסו. יש הטוענים כי שהאומה הסינית בתקופת מינג הייתה האומה המתקדמת ביותר בעולם.\n" +
"\n" +
"הקיסר חונג-וו, מייסד השושלת, הניח את היסודות לנטייתה של המדינה למעט במסחר ותעשייה ולהתמקד בעיקר בהגדלת הרווחים מהמגזר החקלאי, כנראה בשל מוצאו החקלאי של הקיסר. חברות פאודליות זעירות שהתפתחו במהלך שנות שלטונם של שושלת סונג ושל המונגולים פורקו ואדמותיהם הולאמו, חולקו והושכרו לאיכרים מחדש. כמו כן, הוטל חוק האוסר החזקת עבדים במדינה. החוקים נגד מסחר נשארו בממלכה עוד מתקופת שושלת סונג, אך כעת הם חלו גם על סוחרים זרים מה שהביא במהרה לגוויעת סחר החוץ בין סין לשאר העולם.\n" +
"\n" +
"ככל שחלף הזמן, שלטון הקיסר נעשה חזק יותר ויותר על אף שהחצר הקיסרית עשתה שימוש נרחב בפקידים ממשלתיים שהיו אחראיים לתפקודה השוטף של המדינה.\n" +
"\n" +
"במהלך שלטון המונגולים פחתה האוכלוסייה בכ-40% לכ-60 מיליון נפש. שתי מאות מאוחר יותר המספר הוכפל. הערים החלו להתפתח בקצב מואץ ובעקבות כך החלה להופיע גם תעשייה זעירה. כתוצאה מהתערבות שלטונית, נמנעה בסין התפתחותו של מרכז אורבני מצומצם ובמקום זאת צמחו מספר רב של ערים שהיוו מרכזים מקומיים לאזורים המקיפים אותן.\n" +
"\n" +
"[עריכה] תקופת מינג: מהתפתחות לבידוד\n" +
"\n" +
"    ערך מורחב – שושלת מינג\n" +
"\n" +
"למרות הסלידה ממסחר עם מדינות אחרות, וההתרכזות הפנימית בענייני המדינה, סין תחת שלטונה של שושלת מינג לא הייתה מבודדת. הסחר עם מדינות אחרות, ובעיקר עם יפן, המשיך להתקיים והקיסר יונגלה השתדל ככל יכולתו למסד קשרים דיפלומטיים עם המדינות הסובבות את סין. צבאה של סין כבש את אנאם והצי הימי שלה הפליג במסעותיו עד לחופי אפריקה. הסינים גם הצליחו לייצר השפעה מסוימת בטורקסטן.\n" +
"\n" +
"אחת הדרכים המרשימות ביותר בהן התבטאה מדיניות החוץ הסינית של אותה תקופה הייתה מסעותיו הימיים של צ'אנג חֶה, סריס מוסלמי ונצר למשפחה מונגולית, אשר הוביל שבעה מסעות ימיים מפוארים בין 1405 ל1433 שעברו בכל האוקיינוס ההודי והאיים שבו והגיעו עד לכף התקווה הטובה. מסעו הראשון של הה, כלל 62 ספינות שנשאו 28,000 מלחים – ללא ספק המסע הימי הגדול ביותר בהיסטוריה האנושית.\n" +
"\n" +
"אולם, לקראת סופה של המאה ה-15, הוטל איסור על אזרחי המדינה לבנות ספינות בעלות כושר הפלגה באוקיינוס וכן נאסר על כלל האזרחים לעזוב את המדינה. כיום קיימת הסכמה על כך שצעד זה ננקט כדי להגן על הקיסרות מפני התקפות של שודדי ים. הגבלות אלו בוטלו לבסוף באמצע המאה ה-17.\n" +
"\n" +
"[עריכה] שושלת צ'ינג\n" +
"\n" +
"    ערך מורחב – שושלת צ'ינג\n" +
"\n" +
"השושלת הקיסרית האחרונה בסין, נוסדה ב1644 כאשר המנצ'ורים כבשו את המדינה, הדיחו מהשלטון את שושלת מינג המקומית והקימו את שושלת צ'ינג שבירתה בייג'ינג. במשך חצי מאה נלחמו המנצ'ורים מלחמות עקובות מדם שבמהלכן השתלטו על האזורים שהיו בשליטת שושלת מינג ובכללם מחוז יונאן המרוחקת, טיבט ומונגוליה. את ההצלחה לה זכו המנצ'ורים בתחילת תקופת שלטונם יש לזקוף לזכות כוחם הצבאי האדיר והמיומן ששולב עם מיומנויות בירוקרטיות סיניות.\n" +
"\n" +
"חלק מההיסטוריונים רואים בתקופה של תחילת שלטון צ'ינג המשך רציף להתדרדרות התרבותית שחלה בסוף תקופת מינג. אך יש כאלה הרואים בתחילת שלטון צ'ינג תקופה של שיגשוג יותר מאשר נסיגה. בהוראת הקיסר קנגשי נכתב המילון המקיף והמפורט ביותר לשפה הסינית שנכתב עד אז ותחת שלטונו של הקיסר קיאנלונג חובר הקטלוג המלא של כל העבודות החשובות של התרבות הסינית. שושלת צ'ינג גם המשיכה בהרחבת אוצר הספרות העממית ובפיתוח החקלאות תוך יבוא גידולים חדשים מהעולם החדש דוגמת התירס. גם צמיחת האוכלוסייה המשיכה להאיץ בתקופת צ'ינג ואוכלוסיית המדינה, שבשנת 1700 מנתה 100 מיליון נפש, הגיעה לכדי 220 מליון בשנת 1800.\n" +
"\n" +
"\n" +
"בקריקטורה צרפתית מפורסמת זו, נראית חלוקתה של סין בין בריטניה, גרמניה, רוסיה, צרפת ויפן\n" +
"בקריקטורה צרפתית מפורסמת זו, נראית חלוקתה של סין בין בריטניה, גרמניה, רוסיה, צרפת ויפן\n" +
"\n" +
"במהלך המאה ה-19, נחלשה שליטתה של שושלת צ'ינג במדינה והשגשוג שהיה בה התפוגג. סין סבלה מרעב קשה, התפוצצות אוכלוסין וחדירה בלתי פוסקת של מדינות המערב בנסיון להשיג לעצמן השפעה במדינה. שאיפתה של בריטניה להמשיך בסחר הבלתי חוקי באופיום, נתקל בהתנגדות עזה של המשטר הקיסרי, מה שהביא לפריצתה של מלחמת האופיום הראשונה ב1840. סין, שהפסידה במלחמה, אולצה לבצע ויתורים כואבים ולפתוח את נמליה לסחר חפשי עם מדינות המערב. ויתוריה הטריטוריאלים של סין כללו את העברת הונג קונג לידיה של בריטניה ב1842 כחלק מחוזה נאנג'ינג. בנוסף מרד טאי פינג (1864-1851) ומרד ניאן (1868-1853), יחד עם תנועות לאומיות מוסלמיות ששאפו לעצמאות וחוזקו על ידי רוסיה ייבשו את קופת המדינה וכמעט שהביאו לנפילת השלטון בה.\n" +
"\n" +
"המרידות בשלטון דוכאו בעיקר על ידי כוחות המערב שבאותו הזמן עשו במדינה כבשלהם וניצלו את שווקיה ואת מערכתה הכלכלית.\n" +
"\n" +
"לאחר שוך המהומות בשנות השישים של המאה ה-19, החלה שושלת צ'ינג לטפל בבעיות המודרניזציה במדינה על ידי ביצוע רפורמות בכל תחומי שליטתה. אבל, הקיסרית האלמנה צישי, יחד עם גורמים שמרניים במדינה, ביצעה מעין הפיכה והדיחה את הקיסר הצעיר מהשלטון, מורידה בכך לטמיון את הרפורמות שאך החלו להתבצע. הרפורמות הצבאיות, שהושארו על כנן, היו חסרות ערך עקב השחיתות האיומה שהתפשטה בצמרת השלטון. חלק מספינות הקרב החדישות של הצבא כלל לא יכלו לבצע ירי, וזאת עקב מעילות גדולות בתקציבי בנייתן שלא השאירו די כסף לרכישת אבק שריפה. כתוצאה מכך כוחות \"הצבא הסיני החדש\" נחלו תבוסות משפילות הן במלחמת סין-צרפת (1885-1883) והן במלחמת סין-יפן הראשונה (1895-1894)\n" +
"\n" +
"עם תחילתה של המאה ה-20, הייתה החצר הקיסרית בסין הרוסה, שחיתות הייתה בכל והאוכלוסייה גדלה בקצב בלתי ניתן לעצירה. המדינה נשלטה על ידי הקיסרית צישי, דמות שמרנית ביותר שהתנגדה לכל סוג של רפורמה. מותו של הקיסר גוואנגשו יום אחד לפני מותה של הקיסרית (יש הטוענים שהוא הורעל על ידה) הרס את הסיכוי האחרון לביסוס הנהגה אפקטיבית במדינה.\n" +
"\n" +
"[עריכה] הרפובליקה הסינית\n" +
"\n" +
"    ערך מורחב – היסטוריה של הרפובליקה הסינית\n" +
"\n" +
"ביאושם מאוזלת ידו של השלטון, החלו פקידי ממשל צעירים, קציני צבא וסטודנטים, שהושפעו מרעיונותיו המהפכניים של סון יאט-סן להתארגן לקראת הפיכה במדינה שתסלק את שושלת צ'ינג מהשלטון ותהפוך את המדינה לרפובליקה. התקוממות ווצ'אנג, התקוממות מהפכנית צבאית, החלה ב10 באוקטובר 1911. כחצי שנה מאוחר יותר, ב12 בפברואר 1912 הוקמה הממשלה הזמנית של הרפובליקה הסינית בנאנג'ינג כשבראשה עומד סון יאט-סן כנשיאה הזמני. אך סון נאלץ לוותר על תפקידו לטובת יואן שיקאי אשר פיקד באותו הזמן על \"הצבא החדש\" והיה ראש הממשלה תחת שלטון צ'ינג, כחלק מהסכם שנחתם להדחת הקיסר האחרון – הילד הנרי פו-יי. בשנים שלאחר הכתרתו כנשיא, ניסה יואן שיקאי לעקוף את סמכויותיהן של הוועדות הפרובינציאליות של הרפובליקה ואף הכריז על עצמו קיסר ב1915. שאיפותיו הקיסריות של יואן נתקלו בהתנגדות עזה של המהפכנים שראו כיצד מהפכתם הולכת לכינונה מחדש של קיסרות במדינה ולא של רפובליקה, והם החלו מתמרדים נגד יואן עד למותו ב1916 שהשאיר ריק שלטוני בסין. סין שלאחר מותו של יואן נחלקה בין הממשל הרפובליקני החדש, ובין מצביאים מקומיים ששלטו באזוריהם עוד מתקופת צ'ינג.\n" +
"\n" +
"לאירוע חסר החשיבות (בעיני המעצמות מחוץ לסין) שהתרחש ב1919 הייתה השלכה מכריעה על המשך ההיסטוריה הסינית במאה ה-20, אירוע זה הוא תנועת הארבעה במאי. התנועה, שהוציאה שם רע לפילוסופיות המערביות המקובלות והאימוץ של קוי מחשבה קיצוניים יותר שבאו לאחר מכן זרעו את הזרעים לקונפליקט בלתי ניתן לגישור בין הימין והשמאל בסין, קונפליקט שהמשיך עד לסופה של המאה.\n" +
"\n" +
"ב1920, הקים סון יאט-סן בסיס לתנועתו המהפכנית בדרום סין, אשר ממנו הוא יצא לאיחוד האומה השסועה. בעזרתם של הסובייטים, הוא הקים ברית עם המפלגה הקומוניסטית הסינית, ברית שלחמה בשאריות המשטר הקיסרי שהיו מפוזרות בצפון המדינה. לאחר מותו של סון ב1925 השתלט יורשו צ'יאנג קאי שק על המפלגה הלאומנית (הקוומינטנג) והצליח לאחד תחת שלטונו את מרבית דרום המדינה ומרכזה במערכה צבאית שנקראה המשלחת הצפונית. לאחר שהצליח להביס גם את תומכי הקיסר בצפון, פנה צ'יאנג למלחמה באנשי המפלגה הקומוניסטית, שעד לאותה תקופה נלחמו יחד איתו. הקומוניסטים פרשו מהקוומינטנג ב1927 וברחו להרים שבדרום סין. ב1934 יצאו הקומוניסטים מההרים שבשליטתם (שם הקימו את הרפובליקה הסינית-סובייטית) למצעד הארוך, מסע צבאי מפרך באזורים הטרשיים ביותר במדינה אל עבר צפון מערבה של המדינה לפרובינציית שאאנסי שם הקימו לעצמם בסיסי לוחמת גרילה.\n" +
"\n" +
"במהלך המצעד הארוך, הכירו הקומוניסטים במנהיגם החדש מאו צה דונג. המאבק בין הקוומינטנג והמפלגה הקומוניסטית הסינית נמשך לעתים בגלוי ולעתים בחשאי תוך כדי מלחמת סין-יפן השנייה (1945-1931) על אף שהכוחות יצרו לכאורה חזית מאוחדת כנגד פלישת היפנים ב1937 כחלק ממלחמת העולם השנייה. הלחימה בין שתי המפלגות המשיכה לאחר תבוסתם של היפנים ב-1945, וב-1949 שלטו הקומוניסטים ברוב שטחה של המדינה.\n" +
"\n" +
"[עריכה] הרפובליקה העממית של סין\n" +
"\n" +
"    ערך מורחב – היסטוריה של הרפובליקה העממית של סין\n" +
"\n" +
"פרק זה לוקה בחסר. אתם מוזמנים לתרום לוויקיפדיה ולהשלים אותו. ראו פירוט בדף השיחה.\n" +
"\n" +
"צ'יאנג קאי שק נמלט עם שאריות ממשלתו וצבאו לטיוואן שם הוא הכריז על טייפה כבירה הזמנית של הרפובליקה עד להשלמת הכיבוש מחדש של סין היבשתית על ידי כוחותיו. הרפובליקה הסינית ממשיכה להתקיים עד ימינו (סוף 2004) בטיוואן אך היא טרם הכריזה עצמאות והיא אינה מוכרת רשמית כמדינה על ידי שאר העולם.\n" +
"\n" +
"עם ההכרזה על הקמתה של הרפובליקה העממית של סין ב1 באוקטובר 1949, חולקה סין שוב לרפובליקה העממית של סין בסין היבשתית ולרפובליקה הסינית שישבה בטיוואן ובמספר איים קטנים בסביבה, כאשר לכל רפובליקה יש ממשלה הרואה בעצמה את הממשלה הסינית האמיתית והמתייחסת אל הממשלה האחרת בבוז ובביטול. מצב זה נמשך עד לשנות התשעים של המאה ה-20, כאשר שינויים פוליטים ברפובליקה הסינית הביאו אותה להפסקת הטענה הפומבית להיותה ממשלת סין היחידה.\n" +
"\n" +
"[עריכה] ראו גם\n" +
"\n" +
"    * לוח זמנים של ההיסטוריה של סין – טבלה המתארת את האירועים והאישים החשובים בתולדותיה של סין.\n" +
"\n" +
"[עריכה] לקריאה נוספת\n" +
"\n" +
"    * עמנואל צ' י' שו, צמיחתה של סין המודרנית, הוצאת שוקן, 2005.\n" +
"\n" +
"[עריכה] קישורים חיצוניים\n" +
"\n" +
"    * ירדן ניר-בוכבינדר, סין אימנו, קונפוציוס אבינו, באתר \"האייל הקורא\"\n" +
"\n" +
"\n" +
"[עריכה] הערות שוליים\n" +
"\n" +
"   1. ^ סין של תקופת הברונזה בגלריה הלאומית לאמנות של ארצות-הברית\n" +
"   2. ^ כתב על חרסים מאתר ארליטואו (כתוב בסינית מפושטת)\n";


var japanese =
"中国の歴史\n" +
"出典: フリー百科事典『ウィキペディア（Wikipedia）』\n" +
"移動: ナビゲーション, 検索\n" +
"中国歴史\n" +
"中国の歴史\n" +
"元謀・藍田・北京原人\n" +
"神話伝説（三皇五帝）\n" +
"黄河・長江文明\n" +
"夏\n" +
"殷\n" +
"周 	西周\n" +
"東周 	春秋\n" +
"戦国\n" +
"秦\n" +
"漢 	前漢\n" +
"新\n" +
"後漢\n" +
"三国 	魏 	呉 	蜀\n" +
"晋 	西晋\n" +
"東晋 	十六国\n" +
"南北朝 	宋 	北魏\n" +
"斉\n" +
"梁 	西魏 	東魏\n" +
"陳 	北周 	北斉\n" +
"隋\n" +
"唐\n" +
"五代十国\n" +
"宋 	北宋 	遼 	西夏\n" +
"南宋 	金\n" +
"元\n" +
"明 	北元\n" +
"後金 	南明 	大順\n" +
"清\n" +
"中華民国\n" +
"中華人民共和国 	(参考:\n" +
"台湾問題)\n" +
"\n" +
"中国の歴史（ちゅうごくのれきし）、或いは中国史（ちゅうごくし）\n" +
"\n" +
"中国の黄河文明は古代の四大文明の一つに数えられ、また黄河文明よりも更に遡る長江文明が存在した。\n" +
"目次\n" +
"[非表示]\n" +
"\n" +
"    * 1 王朝、政権の変遷\n" +
"    * 2 概略\n" +
"          o 2.1 先史人類史\n" +
"          o 2.2 文明の萌芽\n" +
"                + 2.2.1 黄河文明\n" +
"                + 2.2.2 長江文明\n" +
"                + 2.2.3 その他\n" +
"          o 2.3 先秦時代\n" +
"                + 2.3.1 三代\n" +
"                + 2.3.2 春秋戦国\n" +
"          o 2.4 秦漢帝国\n" +
"          o 2.5 魏晋南北朝時代\n" +
"          o 2.6 隋唐帝国\n" +
"          o 2.7 五代十国・宋\n" +
"          o 2.8 モンゴル帝国\n" +
"          o 2.9 明清帝国\n" +
"          o 2.10 中国の半植民地化\n" +
"          o 2.11 中華民国\n" +
"                + 2.11.1 革命後の中国の政局\n" +
"                + 2.11.2 袁世凱の台頭と帝制運動（1913年～1916年）\n" +
"                + 2.11.3 袁世凱死後の政局（1916年～1920年）\n" +
"                + 2.11.4 国民革命（1920年～1928年）\n" +
"                + 2.11.5 国民政府（1928年～1931年）\n" +
"                + 2.11.6 抗日戦争（1931年～1937年）\n" +
"                + 2.11.7 日中戦争（1937年～1945年）\n" +
"                + 2.11.8 漢民族以外の民族の動向\n" +
"                      # 2.11.8.1 モンゴルとチベットでの動き\n" +
"                      # 2.11.8.2 東トルキスタン（新疆）での動き\n" +
"          o 2.12 中華人民共和国\n" +
"                + 2.12.1 社会主義国化と粛清（1949年～1957年）\n" +
"                + 2.12.2 中国共産党の対ソ自立化（1958年～1965年）\n" +
"                + 2.12.3 文化大革命前期（1966年～1969年）\n" +
"                + 2.12.4 文化大革命後期（1969～1976年）\n" +
"                + 2.12.5 改革開放以後の現在（1976年～）\n" +
"                      # 2.12.5.1 一党独裁\n" +
"                      # 2.12.5.2 少数民族問題\n" +
"    * 3 人口の変遷\n" +
"    * 4 地方行政制度\n" +
"          o 4.1 封建制度（前1600年頃～前221年）\n" +
"          o 4.2 郡県制度（前221年～249年）\n" +
"          o 4.3 軍府による広域行政（249年～583年）\n" +
"          o 4.4 州県制（583年～1276年）\n" +
"    * 5 祭祀制度\n" +
"    * 6 外交\n" +
"          o 6.1 漢帝国\n" +
"          o 6.2 魏晋南北朝時代\n" +
"          o 6.3 隋唐帝国\n" +
"    * 7 関連項目\n" +
"    * 8 脚注\n" +
"\n" +
"[編集] 王朝、政権の変遷\n" +
"現在の中国、すなわち中華人民共和国の領域\n" +
"現在の中国、すなわち中華人民共和国の領域\n" +
"\n" +
"    * 長江文明\n" +
"    * 黄河文明\n" +
"    * 夏（紀元前2070年頃 - 紀元前1600年頃\n" +
"    * 殷（紀元前1600年頃 - 紀元前12世紀・紀元前11世紀ごろ）\n" +
"\n" +
"    * 周（紀元前12世紀・紀元前11世紀ごろ - 紀元前256年）…殷を倒し、西周建国。克殷の年代については諸説あり、はっきりしない。\n" +
"          o 春秋時代（紀元前770年 - 紀元前403年）…紀元前453年晋が韓魏趙に分割された時点、または紀元前403年韓魏趙が諸侯に列した時点をもって春秋時代の終わり、戦国時代の始まりとする。\n" +
"          o 戦国時代（紀元前403年 - 紀元前221年）…晋が韓・趙・魏に分裂し、戦国時代突入。\n" +
"    * 秦（紀元前221年 - 紀元前207年）…秦王・政が6国を滅ぼし中華統一。\n" +
"    * 漢\n" +
"          o 前漢（紀元前206年 - 8年）…秦滅亡後、楚の項羽との楚漢戦争に勝ち、劉邦が建国。\n" +
"          o 新（8年 - 23年）…外戚の王莽が前漢皇帝から帝位を簒奪し建国。\n" +
"          o 後漢（25年 - 220年）…前漢の景帝の子孫の劉秀（光武帝）が王莽軍を破り、漢を再興。\n" +
"    * 三国時代（220年 - 280年）\n" +
"          o 魏、蜀（蜀漢・漢）、呉…曹操の子曹丕が献帝から禅譲を受け即位すると、蜀の劉備も漢皇帝を名乗り即位、さらに呉の孫権も大帝として即位し、三国時代に入る。\n" +
"    * 晋（265年 - 420年）\n" +
"          o 西晋（265年 - 316年）…晋王司馬炎が魏の元帝より禅譲を受け即位し建国。だが、異民族五胡の侵入により衰退。異民族の漢に滅ぼされた。\n" +
"          o 東晋（317年 - 420年）…皇族でただ一人生き残った琅邪王・司馬睿は江南に逃れ、建康で即位(元帝)。これを中原の晋と区別して東晋という。\n" +
"          o 五胡十六国時代（304年 - 439年）\n" +
"    * 南北朝時代（439年 - 589年）\n" +
"          o 北魏、東魏、西魏、北斉、北周\n" +
"          o 宋、斉、梁、陳\n" +
"    * 隋（581年 - 619年）\n" +
"    * 唐（618年 - 907年）\n" +
"          o 武周\n" +
"    * 五代十国時代\n" +
"          o 後梁、後唐、後晋、後漢、後周……五代（中原を中心とする国）\n" +
"          o 呉、南唐・閩・呉越・荊南・楚・南漢・前蜀・後蜀・北漢……十国（中華東西南北に拠る勢力）\n" +
"    * 宋\n" +
"          o 北宋（960年 - 1127年）\n" +
"          o 南宋（1127年 - 1279年）\n" +
"          o 遼、西夏、金\n" +
"    * 元（1271年 - 1368年）\n" +
"    * 明（1368年 - 1644年）\n" +
"          o 南明\n" +
"    * 清（1616年 - 1912年）（1616年 - 1636年は後金、それ以前はマンジュ国）\n" +
"          o 太平天国、満州国\n" +
"    * 中華民国（台湾）（1912年 - 現在）\n" +
"    * 中華人民共和国（1949年 - 現在）\n" +
"\n" +
"[編集] 概略\n" +
"\n" +
"[編集] 先史人類史\n" +
"\n" +
"中国に現れた最初期の人類としては、元謀原人や藍田原人、そして北京原人が知られている。\n" +
"\n" +
"[編集] 文明の萌芽\n" +
"\n" +
"中国大陸では、古くから文明が発達した。中国文明と呼ばれるものは、大きく分けて黄河文明と長江文明の2つがある。黄河文明は、畑作が中心、長江文明は稲作が中心であった。黄河文明が、歴史時代の殷（商）や周などにつながっていき、中国大陸の歴史の中軸となった。長江文明は次第に、中央集権国家を創出した黄河文明に同化吸収されていった。\n" +
"\n" +
"[編集] 黄河文明\n" +
"龍山文化時代の高杯。1976年山東省出土\n" +
"龍山文化時代の高杯。1976年山東省出土\n" +
"\n" +
"黄河文明は、その後の中国の歴史の主軸となる。\n" +
"\n" +
"    * 裴李崗文化…紀元前7000?~紀元前5000?。一般的な「新石器時代」のはじまり。定住し、農業も行われていた。河南省(黄河中流)。土器は赤褐色\n" +
"    * 老官台文化…紀元前6000?~紀元前5000?。土器作りや粟作りが行われていた。陝西省(黄河上流)。土器は赤色。\n" +
"    * 北辛文化…紀元前6000?~紀元前5000?。土器は黄褐色。山東省(黄河下流)\n" +
"    * 磁山文化…紀元前6000?~紀元前5000?。土器は赤褐色。河北省(黄河下流)\n" +
"    * 仰韶文化…紀元前4800?~紀元前2500?。前期黄河文明における最大の文化。陝西省から河南省にかけて存在。このころは母系社会で、農村の階層化も始まった。文化後期になると、社会の階層化、分業化が進み、マルクス経済学でいうところの原始共産制は仰韶文化のころに終焉したと見られる。土器は赤色。\n" +
"    * 後岡文化…紀元前5000?~紀元前4000?。北辛文化が発展。河南省。\n" +
"    * 大汶口文化…紀元前4300?~紀元前2400?。土器は前期は赤色(彩陶)、後期は黒色(黒陶)。なお、この区分は黄河文明全体に見られる。山東省。\n" +
"    * 龍山文化…紀元前2500?~紀元前2000?。大汶口文化から発展。後期黄河文明最大の文化。土器は黒色。山東省。\n" +
"    * 二里頭文化…紀元前2000?~紀元前1600?。遺跡の中心部には二つの宮殿がある。河南省。\n" +
"\n" +
"[編集] 長江文明\n" +
"母なる長江\n" +
"母なる長江\n" +
"\n" +
"長江文明は黄河文明が萌芽する遥か前より栄えていた。夏王朝の始祖とされる禹が南方出身であるとされるため、この長江流域に夏王朝が存在したのではないかという説[1]がある。\n" +
"\n" +
"    * 玉蟾岩遺跡…湖南省(長江中流)。紀元前14000年？～紀元前12000年？の稲モミが見つかっているが、栽培したものかは確定できない。\n" +
"    * 仙人洞・呂桶環遺跡…江西省(長江中流)。紀元前12000年ごろ？の栽培した稲が見つかっており、それまで他から伝播してきたと考えられていた中国の農耕が中国独自でかつ最も古いものの一つだと確かめられた。\n" +
"    * 彭頭山文化…湖南省(長江中流)。紀元前7000年？～紀元前5000年？。散播農法が行われており、中国における最古の水稲とされる。\n" +
"    * 大渓文化…四川省(長江上流)。紀元前4500年？～紀元前3300年？。彩文紅陶（紋様を付けた紅い土器）が特徴で、後期には黒陶・灰陶が登場。灌漑農法が確立され、住居地が水の補給のための水辺から大規模に農耕を行う事の出来る平野部へ移動した。\n" +
"    * 屈家嶺文化…湖北省。紀元前3000年？～紀元前2500年？大渓文化を引き継いで、ろくろを使用した黒陶が特徴。河南地方の黄河文明にも影響を与えたと考えられる。\n" +
"    * 石家河文化…屈家嶺文化から発展し、湖北省天門県石家河に大規模な都城を作った紀元前2500年頃を境として屈家嶺と区別する。この都城は南北1.3Km、東西1.1Kmという大きさで、上述の黄河流域の部族と抗争したのはこの頃と考えられる。\n" +
"    * 河姆渡文化 …紀元前5000年？～紀元前4000年？下流域では最古の稲作。狩猟や漁労も合わせて行われ、ブタの家畜化なども行われた。\n" +
"    * 良渚文化… 浙江省(銭塘江流域)。紀元前5260年？～紀元前4200年？（以前は文化形態から大汶口文化中期ごろにはじまったとされていたが、1977年出土木材の年輪分析で改められた）青銅器以前の文明。多数の玉器の他に、絹が出土している。分業や階層化も行われたと見られ、殉死者を伴う墓が発見されている。黄河文明の山東竜山文化とは相互に関係があったと見られ、同時期に衰退したことは何らかの共通の原因があると見られている。\n" +
"    * 三星堆遺跡… 紀元前2600年？～紀元前850年？。大量の青銅器が出土し、前述の他に目が飛び出た仮面・縦目の仮面・黄金の杖などがあり、また子安貝や象牙なども集められており、権力の階層があったことがうかがい知れる。青銅器については原始的な部分が無いままに高度な青銅器を作っているため他の地域、おそらくは黄河流域からの技術の流入と考えられる。長江文明と同じく文字は発見されていないが、「巴蜀文字」と呼ばれる文字らしきものがあり、一部にこれをインダス文字と結びつける説もある。\n" +
"\n" +
"[編集] その他\n" +
"\n" +
"    * 新楽遺跡…遼寧省(遼河流域)。紀元前5200年?ごろの定住集落。母系社会が定着し、農業も行われていた。\n" +
"\n" +
"[編集] 先秦時代\n" +
"\n" +
"[編集] 三代\n" +
"\n" +
"史記では伝説と目される三皇五帝時代に続いて夏[2]王朝について記述されている。夏については実在が確かでなくまた定説もない。\n" +
"\n" +
"殷[3]（商）が実在の確認されている最古の王朝である。殷では、王が占いによって政治を行っていた（神権政治）。殷は以前は山東で興ったとされたが、近年は河北付近に興ったとする見方が有力で、黄河文明で生まれた村のうち強大になり発展した都市国家の盟主であった[4]と考えられる。\n" +
"\n" +
"紀元前11世紀頃に殷を滅ぼした周は、各地の有力者や王族を諸侯として封建制をおこなった。しかし、周王朝は徐々に弱体化し、異民族に攻められ、紀元前770年には成周へ遷都した。その後、史記周本紀によれば犬戎の侵入により西周が滅び、洛陽に東周が再興されたされるが、同じく平勢隆郎の検討によれば幽王が殺害されたあと短期間携王が西、平王が東に並立し、紀元前759年平王が携王を滅ぼしたと考えられる。平王のもとで周は洛陽にあり、西周の故地には秦が入る。これ以降を春秋時代と呼ぶ。春秋時代には、周王朝の権威はまだ残っていたが、紀元前403年から始まるとされる戦国時代には、周王朝の権威は無視されるようになる。\n" +
"\n" +
"[編集] 春秋戦国\n" +
"諸子百家の一、孔子\n" +
"諸子百家の一、孔子\n" +
"\n" +
"春秋戦国時代は、諸侯が争う戦乱の時代であった。\n" +
"\n" +
"春秋時代は都市国家の盟主どうしの戦いだった。しかし春秋末期最強の都市国家晋が三分割されたころから様子が変わる。その当時の晋の有力な家臣六家が相争い、最初力が抜きん出ていた智氏が弱小な趙氏を攻めたものの、趙氏がよく農村を経済的ではなく封建的に支配し、それによって集めた食糧が多かったために城を守りきり、疲弊した智氏を魏氏、韓氏が攻め滅ぼしたために最終的に趙、魏、韓の三国が出来た。このこともあってそれまで人口多くてもせいぜい5万人程度だった都市国家が富国強兵に努め、商工業が発達し、貨幣も使用し始めやがて領土国家に変貌しその国都となった旧都市国家は30万人規模の都市に変貌する。また鉄器が普及したこともあいまって、農業生産も増大した。晋の分裂以後を一般に戦国時代という。\n" +
"\n" +
"また、このような戦乱の世をどのように過ごすべきかという思想がさまざまな人たちによって作られた。このような思想を説いた人たちを諸子百家（陰陽家、儒家、墨家、法家、名家、道家、兵家等が代表的）という。\n" +
"\n" +
"[編集] 秦漢帝国\n" +
"始皇帝\n" +
"\n" +
"現在の陝西省あたりにあった秦は、戦国時代に着々と勢力を伸ばした。勢力を伸ばした背景には、厳格な法律で人々を統治しようとする法家の思想を採用して、富国強兵に努めたことにあった。秦王政は、他の6つの列強を次々と滅ぼし、紀元前221年には史上はじめての中国統一を成し遂げた。秦王政は、自らの偉業をたたえ、王を超える称号として皇帝を用い、自ら始皇帝と名乗った。\n" +
"兵馬俑\n" +
"\n" +
"始皇帝は、法家の李斯を登用し、中央集権化を推し進めた。このとき、中央から派遣した役人が全国の各地方を支配する郡県制が施行された。また、文字・貨幣・度量衡の統一も行われた。さらに、当時モンゴル高原に勢力をもっていた遊牧民族の匈奴を防ぐために万里の長城を建設させた。さらに、軍隊を派遣して、匈奴の南下を抑えた。また、嶺南地方（現在の広東省）にも軍を派遣し、この地にいた百越諸族を制圧した。しかし、このような中央集権化や土木事業・軍事作戦は人々に多大な負担を与えた。そのため、紀元前210年に始皇帝が死ぬと、翌年には陳勝・呉広の乱という農民反乱がおきた。これに刺激され各地で反乱がおき、ついに秦は紀元前206年に滅びた。\n" +
"漢の偉大な発明、紙\n" +
"漢の偉大な発明、紙\n" +
"\n" +
"秦が滅びたあと、劉邦と項羽が覇権をめぐって争った（楚漢戦争）が、紀元前202年には、劉邦が項羽を破り、漢の皇帝となった。劉邦は、始皇帝が急速な中央集権化を推し進めて失敗したことから、一部の地域には親戚や臣下を王として治めさせ、ほかの地域を中央が直接管理できるようにした。これを郡国制という。しかし、紀元前154年には、各地の王が中央に対して呉楚七国の乱と呼ばれる反乱を起こした。この反乱は鎮圧され、結果として、中央集権化が進んだ。紀元前141年に即位した武帝は、国内の安定もあり、対外発展を推し進めた。武帝は匈奴を撃退し、シルクロードを通じた西方との貿易を直接行えるようにした。また、朝鮮半島北部、ベトナム北中部にも侵攻した。これらの地域はその後も強く中国文化の影響を受けることとなった。また、武帝は董仲舒の意見を聞いて、儒教を統治の基本とした。これ以降、中国の王朝は基本的に儒教を統治の基本としていく。一方で文帝の頃より貨幣経済が広汎に浸透しており、度重なる軍事行動と相まって、農民の生活を苦しめた。漢の宮廷では貨幣の浸透が農民に不利益であることがしばしば論じられており、農民の救済策が検討され、富商を中心に増税をおこなうなど大土地所有を抑制しようと努力した。また儒教の国教化に関連して儒教の教義論争がしばしば宮廷の重大問題とされるようになった。\n" +
"\n" +
"8年には、王莽が皇帝の位を奪って、一旦漢を滅ぼした。王莽は当初儒教主義的な徳治政治をおこなったが、相次ぐ貨幣の改鋳や頻繁な地名、官名の変更など理想主義的で恣意的な政策をおこなったため徐々に民心を失い、辺境異民族が頻繁に侵入し、赤眉の乱など漢の復興を求める反乱が起き、内乱状態に陥った。結局、漢の皇族の血を引く劉秀によって漢王朝が復興された。この劉秀が建てた漢を後漢という。王朝初期には雲南に進出し、また班超によって西域経営がおこなわれ、シルクロードをおさえた。初期の後漢王朝は豪族連合的な政権であったが、章帝の時代までは中央集権化につとめ安定した政治が行われた。しかし安帝時代以後外戚や宦官の権力の増大と官僚の党派対立に悩まされるようになった。\n" +
"\n" +
"[編集] 魏晋南北朝時代\n" +
"三国決戦の地、赤壁\n" +
"三国決戦の地、赤壁\n" +
"\n" +
"後漢末期の184年には、黄巾の乱と呼ばれる農民反乱がおきた。これ以降、隋が589年に中国を再統一するまで、一時期を除いて中国は分裂を続けた。この隋の再統一までの分裂の時代を魏晋南北朝時代という。また、この時期には日本や朝鮮など中国周辺の諸民族が独自の国家を形成し始めた時期でもある。\n" +
"\n" +
"さて、黄巾の乱が鎮圧されたあと、豪族が各地に独自政権を立てた。中でも有力であったのが、漢王朝の皇帝を擁していた曹操である。しかし、中国統一を目指していた曹操は、208年に赤壁の戦いで、江南の豪族孫権に敗れた。結局、曹操の死後、220年に曹操の子の曹丕が後漢の皇帝から皇帝の位を譲られ、魏を建国した。これに対して、221年には、現在の四川省に割拠していた劉備が皇帝となり、蜀を建国した。さらに、江南の孫権も229年に皇帝と称して、呉を建国した。この魏・呉・蜀の三国が並立した時代を三国時代という。\n" +
"\n" +
"三国の中で、もっとも有力であったのは魏であった。魏は後漢の半分以上の領土を継承したが、戦乱で荒廃した地域に積極的な屯田をおこない、支配地域の国力の回復につとめた。魏では官吏登用法として、九品官人法[5]がおこなわれた。\n" +
"\n" +
"三国は基本的に魏と呉・蜀同盟との争いを軸としてしばしば交戦したが、蜀がまず263年に魏に滅ぼされ、その魏も有力な臣下であった司馬炎に265年に皇帝の位を譲るという形で滅亡した。司馬炎は皇帝となって国号を晋と命名し、さらに280年に呉を滅ぼし、中国を統一した。しかし、300年から帝位をめぐって各地の皇族が戦争を起こした（八王の乱）。このとき、五胡と呼ばれる異民族を軍隊として用いたため、これらの五胡が非常に強い力を持つようになった。316年には、五胡の1つである匈奴が晋をいったん滅ぼした。これ以降、中国の北方は、五胡の建てた国々が支配し、南方は江南に避難した晋王朝（南に移ったあとの晋を東晋という）が支配した。この時期は、戦乱を憎み、宗教に頼る向きがあった。代表的な宗教が仏教と道教であり、この2つの宗教は時には激しく対立することがあった。\n" +
"\n" +
"さて、江南を中心とする中国の南方では、異民族を恐れて、中国の北方から人々が多く移住してきた。これらの人々によって、江南の開発が進んだ。それに伴い、貴族が大土地所有を行うということが一般的になり、貴族が国の政治を左右した。一部の貴族の権力は、しばしば皇帝権力よりも強かった。これらの貴族階層の者により散文、書画等の六朝文化と呼ばれる文化が発展した。東晋滅亡後、宋・斉・梁・陳という4つの王朝が江南地方を支配したが、貴族が強い力を握ることは変わらなかった。梁の武帝は仏教の保護に努めた。\n" +
"\n" +
"北方では、鮮卑族の王朝である北魏が台頭し、439年には、華北を統一した。471年に即位した孝文帝は漢化政策を推し進めた。また、土地を国家が民衆に割り振る均田制を始め、律令制の基礎付けをした。しかし、このような漢化政策に反対するものがいたこともあり、北魏は、西魏と東魏に分裂した。西魏は北周へと、東魏は北斉へと王朝が交代した。577年には北周が北斉を滅ぼしたが、581年に隋が北周にとって代わった。589年に隋は南方の陳を滅ぼし、中国を統一した。\n" +
"\n" +
"魏晋南北朝表も参照。\n" +
"\n" +
"[編集] 隋唐帝国\n" +
"現在でも使用される世界最大の大運河\n" +
"現在でも使用される世界最大の大運河\n" +
"\n" +
"中国を統一した隋の文帝は、均田制・租庸調制・府兵制などを進め、中央集権化を目指した。また同時に九品中正法を廃止し、試験によって実力を測る科挙を採用した。しかし、文帝の後を継いだ煬帝は、江南・華北を結ぶ大運河を建設したり、度重なる遠征を行ったために、民衆の負担が増大した。このため農民反乱が起き、618年に隋は滅亡した。\n" +
"\n" +
"隋に代わって、中国を支配したのが、唐である。唐は基本的に隋の支配システムを受け継いだ。626年に即位した太宗は、租庸調制を整備し、律令制を完成させた。唐の都の長安は、当時世界最大級の都市であり、各国の商人などが集まった。長安は、西方にはシルクロードによってイスラム帝国や東ローマ帝国などと結ばれ、ゾロアスター教・景教・マニ教をはじめとする各地の宗教が流入した。また、文化史上も唐時代の詩は最高のものとされる。\n" +
"当時世界最大の都市だった長安のシンボルタワー・大雁塔\n" +
"当時世界最大の都市だった長安のシンボルタワー・大雁塔\n" +
"\n" +
"太宗の死後着々と力を付けた太宗とその子の高宗の皇后武則天はついに690年皇帝に即位した。前にも後にも中国にはこれのほかに女帝はいない。\n" +
"\n" +
"712年に即位した玄宗は国内の安定を目指したが、すでに律令制は制度疲労を起こしていた。また、周辺諸民族の統治に失敗したため、辺境に強大な軍事力が置かれた。これを節度使という。節度使は、後に軍権以外にも、民政権・財政権をももつようになり、力を強めていく。763年には、節度使の安禄山たちが安史の乱と呼ばれる反乱を起こした。この反乱は郭子儀や僕固懐恩、ウイグル帝国の太子葉護らの活躍で何とか鎮圧されたが、反乱軍の投降者の勢力を無視できず、投降者を節度使に任じたことなどから各地で土地の私有（荘園）が進み、土地の国有を前提とする均田制が行えなくなっていった。結局、政府は土地の私有を認めざるを得なくなった。結果として、律令制度は崩壊した。875年から884年には黄巣の乱と呼ばれる農民反乱がおき、唐王朝の権威は失墜した。このような中、各地の節度使はますます権力を強めた。907年には、節度使の1人である朱全忠が唐を滅ぼした。\n" +
"\n" +
"[編集] 五代十国・宋\n" +
"画像:Compass in a wooden frame.jpg\n" +
"中国航海術の偉大な発明、羅針盤\n" +
"\n" +
"唐の滅亡後、各地で節度使があい争った。この時代を五代十国時代という。この戦乱を静めたのが、960年に皇帝となって宋を建国した趙匡胤である。ただし、完全に中国を宋が統一したのは趙匡胤の死後の976年である。\n" +
"\n" +
"趙匡胤は、節度使が強い権力をもっていたことで戦乱が起きていたことを考え、軍隊は文官が率いるという文治主義をとった。また、これらの文官は、科挙によって登用された。宋からは、科挙の最終試験は皇帝自らが行うものとされ、科挙で登用された官吏と皇帝の結びつきは深まった。また、多くの国家機関を皇帝直属のものとし、中央集権・皇帝権力強化を進めた。科挙を受験した人々は大体が、地主層であった。これらの地主層を士大夫と呼び、のちの清時代まで、この層が皇帝権力を支え、官吏を輩出し続けた。\n" +
"杭州\n" +
"杭州\n" +
"\n" +
"唐は、その強大な力によって、周辺諸民族を影響下においていたが、唐の衰退によってこれらの諸民族は自立し、独自文化を発達させた。また、宋は文治主義を採用していたたため、戦いに不慣れな文官が軍隊を統制したので、軍事力が弱く、周辺諸民族との戦いにも負け続けた。なかでも、契丹族の遼・タングート族の西夏・女真族の金は、中国本土にも侵入し、宋を圧迫した。これらの民族は、魏晋南北朝時代の五胡と違い、中国文化を唯一絶対なものとせず、独自文化を保持し続けた。このような王朝を征服王朝という。後代の元や清も征服王朝であり、以降、中国文化はこれらの周辺諸民族の影響を強く受けるようになった。\n" +
"\n" +
"1127年には、金の圧迫を受け、宋は、江南に移った。これ以前の宋を北宋、以降を南宋という。南宋時代には、江南の経済が急速に発展した。また、すでに唐代の終わりから、陸上の東西交易は衰退していたが、この時期には、ムスリム商人を中心とした海上の東西交易が発達した。当時の宋の特産品であった陶磁器から、この交易路は陶磁の道と呼ばれる。南宋の首都にして海上貿易の中心港だった杭州は経済都市として栄え、元時代に中国を訪れたマルコ・ポーロは杭州を「世界一繁栄し、世界一豊かな都市」と評している。\n" +
"\n" +
"文化的には、経済発展に伴って庶民文化が発達した。また、士大夫の中では新しい学問をもとめる動きが出て、儒教の一派として朱子学が生まれた。\n" +
"\n" +
"[編集] モンゴル帝国\n" +
"\n" +
"13世紀初頭にモンゴル高原で、チンギス・ハーンが、モンゴルの諸部族を統一し、ユーラシア大陸各地へと、征服運動を開始した。モンゴル人たちは、東ヨーロッパ、ロシア、小アジア、メソポタミア、ペルシャ、アフガニスタン、チベットに至る広大な領域を支配し、この帝国はモンゴル帝国と呼ばれる。中国もまた征服活動の例外ではなかった。当時、黄河が南流し、山東半島の南に流れていたため、漢民族は北方民族の攻勢を防げなかった。華北は満州系の女真族による金が、南部を南宋が支配していたが、金は1234年、南宋は1279年にモンゴルに滅ぼされた。\n" +
"\n" +
"モンゴル帝国は各地に王族や漢人有力者を分封した。モンゴル帝国の5代目の君主（ハーン）にクビライが即位すると、これに反発する者たちが、反乱を起こした。結局、モンゴル帝国西部に対する大ハーン直轄支配は消滅し、大ハーンの政権は中国に軸足を置くようになった。もっとも、西方が離反しても、帝国としての緩やかな連合は保たれ、ユーラシアには平和が訪れていた。1271年にクビライは元を国号として中国支配をすすめた。\n" +
"宋代に発明された火薬は元寇の時使用され、日本の武士を驚かせた\n" +
"宋代に発明された火薬は元寇の時使用され、日本の武士を驚かせた\n" +
"\n" +
"モンゴル帝国(元)は未だ征服していなかった南宋への牽制のためにも日本に対して通交を求めたが、日本側は断った。このため二度に渡り日本に侵攻したが、成功しなかった（元寇）。元は三度目の日本侵攻を計画したが、実現には至らなかった。\n" +
"\n" +
"中国南部を支配していた南宋を1279年に元が滅ぼしたのはすでに見たとおりである。\n" +
"\n" +
"元の中国支配は、伝統的な中国王朝とは大きく異なっていた。元は中国の伝統的な統治機構を採用せず、遊牧民の政治の仕組みを中国に移入したからである。元の支配階級の人々は、すでに西方の優れた文化に触れていたため、中国文化を無批判に取り入れることはなかった。それは政治においても同様だったのである。それに伴い、伝統的な統治機構を担ってきた、儒教的な教養を身に付けた士大夫層は冷遇され、政権から遠ざけられた。そのため、彼らは曲や小説などの娯楽性の強い文学作品の執筆に携わった。この時代の曲は元曲と呼ばれ、中国文学史上最高のものとされる。また、モンゴル帝国がユーラシア大陸を広く支配したために、この時期は東西交易が前代に増して盛んになった。\n" +
"\n" +
"元は、宮廷費用などを浪費しており、そのため塩の専売策や紙幣の濫発で収入を増やそうとした。しかし、これは経済を混乱させるだけであった。そして、庶民の生活は困窮した。こうした中、各地で反乱が発生した。中でも最大規模のものは1351年に勃発した紅巾党の乱であった。紅巾党の中から頭角をあらわした朱元璋は、1368年に南京で皇帝に即位して明を建国した。同年、朱元璋は元の都の大都を陥落させ、元の政府はモンゴル高原へと撤退した。撤退後の元のことを北元といい、明と北元はしばしば争った。明側は1388年に北元は滅んだと称しているが、実質的にはその後も両者の争いは続いた。\n" +
"\n" +
"[編集] 明清帝国\n" +
"鄭和の南海大遠征の時の巨艦・「宝船」\n" +
"鄭和の南海大遠征の時の巨艦・「宝船」\n" +
"\n" +
"洪武帝の死後、孫の建文帝が即位したが、洪武帝の四男である朱棣が反乱（靖難の変）を起こし、朱棣が永楽帝として皇帝になった。永楽帝は、モンゴルを攻撃するなど、積極的に対外進出を進めた。また、鄭和を南洋に派遣して、諸国に朝貢を求めた。この時の船が近年の研究によって長さ170m余、幅50m余という巨艦で、その約70年後の大航海時代の船の5倍から10倍近い船であったことが分かっている。\n" +
"\n" +
"また、永楽帝によって現在に至るまで世界最大の宮殿である紫禁城が北京に築かれた。\n" +
"\n" +
"永楽帝の死後、財政事情もあって、明は海禁政策をとり、貿易を著しく制限することとなる。このとき永楽帝を引き継いで、鄭和のようにずっと積極的に海外へ進出していれば、ヨーロッパのアジア・アフリカ支配も実現しなかっただろうと多くの歴史家は推測する。その後、モンゴルが再び勢力を強めはじめ、1449年には皇帝がモンゴルの捕虜になるという事件（土木の変）まで起きた。同じ頃、中国南部沿岸には、倭寇と呼ばれる海上の無法者たちが襲撃を重ねていた。これは、海禁政策で貿易が自由にできなくなっていたためである。倭寇とモンゴルを併称して北虜南倭というが、北虜南倭は明を強く苦しめた。\n" +
"紫禁城の中心、太和殿\n" +
"紫禁城の中心、太和殿\n" +
"\n" +
"また、皇帝による贅沢や多額の軍事費用の負担は民衆に重税となって圧し掛かってきた。これに対し、各地で反乱がおき、その中で頭角をあらわした李自成が1644年に明を滅ぼした。\n" +
"\n" +
"17世紀初頭には、現在の中国東北地方でヌルハチが女真族を統一した。その子のホンタイジは中国東北地方と内モンゴルを征服し、1636年にはモンゴル人から元の玉璽を譲られ、清を建国した。李自成が明を滅ぼすと清の軍隊は万里の長城を越えて、李自成の軍隊を打ち破り、中国全土を支配下に置いた。17世紀後半から18世紀にかけて、康熙帝・雍正帝・乾隆帝という3人の賢い皇帝の下で、清の支配領域は中国本土と中国東北地方・モンゴルのほかに、台湾・東トルキスタン・チベットにまで及んだ。\n" +
"\n" +
"この清の支配領域が大幅に広がった時期は、『四庫全書』の編纂など文化事業も盛んになった。しかし、これは学者をこのような事業に動員して、異民族支配に反抗する暇をなくそうとした面もあった。\n" +
"\n" +
"明代の後期には、メキシコや日本から大量の銀が中国に流入し、貨幣として基本的に銀が使われるようになった。そのため、政府も一条鞭法と呼ばれる税を銀で払わせる税法を始めた。また、清代に入ると、人頭税を廃止し土地課税のみとする地丁銀制が始まった。また明清両代ともに商品経済が盛んになり、農業生産も向上した。\n" +
"\n" +
"[編集] 中国の半植民地化\n" +
"フランス人が描いた中国半植民地化の風刺画。イギリス、ドイツ、ロシア、フランス、日本が中国を分割している。\n" +
"フランス人が描いた中国半植民地化の風刺画。イギリス、ドイツ、ロシア、フランス、日本が中国を分割している。\n" +
"\n" +
"18世紀が終わるまでには、清とヨーロッパとの貿易はイギリスがほぼ独占していた。しかし、当時イギリスの物産で中国に売れるものはほとんどなく、逆に中国の安いお茶はイギリスの労働者階級を中心に大きな需要があったこともあり、イギリスは貿易赤字に苦しんだ。そこで、イギリスは麻薬であるアヘンを中国に輸出し始めた。結果、イギリスは大幅な貿易黒字に転じた。しかし、中国にはアヘン中毒者が蔓延し、この事態を重く見た清朝政府は、1839年に林則徐に命じてアヘン貿易を取り締まらせた。しかし、これに反発したイギリス政府は清に対して翌1840年宣戦布告した。アヘン戦争と呼ばれるこの戦争では、工業化をとげ、近代兵器を持っていたイギリス軍が勝利した。これ以降、イギリスをはじめとするヨーロッパの列強は中国に対し、不平等条約（治外法権の承認、関税自主権の喪失、片務的最恵国待遇の承認、開港、租借といった）を締結させ、中国の半植民地化が進んだ。\n" +
"\n" +
"国内的には、太平天国の乱などの反乱もしばしば起きた。これに対し、同治帝（在位1861年 - 1875年）の治世の下で、ヨーロッパの技術の取り入れ（洋務運動）が行われた。\n" +
"\n" +
"1894年から翌1895年にかけて清と日本との間で行われた日清戦争にも清は敗退した。これは洋務運動の失敗を意味するものであった。この戦争の結果、日本と清との間で結んだ下関条約により、李氏朝鮮の独立が認められ、中国の王朝が長年続けてきた冊封体制が崩壊した。\n" +
"\n" +
"その後、清朝政府は改革を進めようとしたものの、沿岸地域を租借地とされるなどのイギリス・フランス・ロシア・ドイツ・アメリカ合衆国・日本による半植民地化の動きは止まらなかった。結局、1911年の武昌での軍隊蜂起をきっかけに辛亥革命が起こり、各地の省が清からの独立を宣言した。翌1912年1月1日、革命派の首領の孫文によって南京で中華民国の樹立が宣言された。北京にいた清の皇帝溥儀（宣統帝）は、清朝政府内部の実力者である袁世凱により2月12日に退位させられ、清は完全に滅亡した。\n" +
"\n" +
"[編集] 中華民国\n" +
"\n" +
"[編集] 革命後の中国の政局\n" +
"\n" +
"中華民国は成立したものの、清朝を打倒した時点で革命に参加した勢力どうしで利害をめぐって対立するようになり、政局は混乱した。各地の軍閥も民国政府の税金を横領したり勝手に新税を導入して独自の財源を持つようになり、自立化した。\n" +
"\n" +
"[編集] 袁世凱の台頭と帝制運動（1913年～1916年）\n" +
"袁世凱\n" +
"袁世凱\n" +
"\n" +
"臨時大総統であった袁世凱は大総統の権力強化を図って議会主義的な国民党の勢力削減を企てた。国民党の急進派はこれに反発、第二革命を起こしたが鎮圧された。1913年10月袁は正式な大総統となり、さらに11月には国民党を非合法化し、解散を命じた。1914年1月には国会を廃止、5月1日には立法府の権限を弱め大総統の権力を大幅に強化した中華民国約法を公布した。\n" +
"\n" +
"袁は列強から多額の借款を借り受けて積極的な軍備強化・経済政策に着手した。当初列強の袁政権に対する期待は高かった。しかしこのような外国依存の財政は、のちに列強による中国の半植民地化をますます進めることにもなった。第一次世界大戦が始まると、新規借款の望みがなくなったため、袁は財政的に行き詰まった。また日本が中国での権益拡大に積極的に動いた。\n" +
"\n" +
"1915年5月9日に、袁が大隈重信内閣の21ヶ条要求を受けたことは大きな外交的失敗と見られ、同日は国恥記念日とされ袁の外交姿勢は激しく非難された。袁は独裁を強化することでこの危機を乗り越えようとし、立憲君主制的な皇帝制度へ移行し、自身が皇帝となることを望んだ。日本も立憲君主制には当初賛成していたようだが、中国国内で帝制反対運動が激化すると反対に転じ外交圧力をかけた。1916年袁は失意のうちに没した。\n" +
"\n" +
"[編集] 袁世凱死後の政局（1916年～1920年）\n" +
"\n" +
"袁の死後、北京政府の実権を掌握したのは国務総理となった段祺瑞であった。段は当初国会[6]の国民党議員などと提携し、調整的な政策をとっていた。しかし、第一次世界戦に対独参戦しようとしたため徐々に国会と対立した。段は日本の援助の下に強硬な政策を断行した。1917年8月14日第一次世界大戦に対独参戦。軍備を拡張して国内の統一を進めた。また鉄道や通信などの業界を背景とする利権集団が段を支えた。1918年には国会議員改定選挙を強行した。国民党はこれに激しく対立し、南方の地方軍とともに孫文を首班とする広東軍政府をつくった。5月には日本と日中軍事協定[7]を結んだ。寺内正毅内閣失脚後に日本の外交方針が転回すると、段は急速に没落した。段の安徽派と対立関係にあった直隷派の馮国璋は徐世昌を大総統に推薦し、段もこれを受け入れた。親日的な安徽派は徐々に影響力を失っていった。1919年5月4日、山東半島での主権回復と反日を訴えるデモ行進が始まった。これを五・四運動という。なお山東半島は1922年に返還された。1920年7月の安直戦争で直隷派に敗れたことで段は失脚した。\n" +
"\n" +
"[編集] 国民革命（1920年～1928年）\n" +
"革命家・孫文\n" +
"革命家・孫文\n" +
"\n" +
"袁世凱により国民党が非合法化されたのち、孫文は1914年7月に中国革命党を東京で結成した。1919年には拠点を上海に移し、中国国民党と改称した。1921年には上海で中国共産党が成立した。これらの政党は1918年のロシア革命の影響を受けており、議会政党というよりも明確な計画性と組織性を備えた革命政党を目指した。1924年国民党は第一回全国大会をおこない、党の組織を改編するとともに共産党との合同（第一次国共合作）を打ち出した。孫文はこのころ全く機能していなかった国会に代わって国内の団体代表による国民会議を提唱し、これに呼応した馮国璋により北京に迎えられた。1925年には国民会議促成会が開かれたが、この会期中に孫文は没した。7月には広東軍政府で機構再編が進み、中華民国国民政府の成立が宣言された。一方で1924年6月には蒋介石を校長として黄埔軍官学校が設立された。1925年4月に国民革命軍が正式に発足され、国民党は蒋介石を指導者として軍事的な革命路線を推し進めることとなった。1926年に広州から北伐を開始した。1927年1月には武漢に政府を移し、武漢国民政府と呼ばれるようになった。この武漢国民政府では当初国民党左派と共産党が優位にあったが、蒋介石は同年4月12日上海クーデターを起こしてこれらを弾圧し、4月18日には反共を前面に打ち出した南京国民政府を成立させた。南京国民政府は主に上海系の資本家に支えられ、北京・武漢・南京に3つの政権が鼎立することになったが、9月ごろから武漢政府も反共に転じ、南京政府に吸収された。1928年6月南京政府の国民革命軍は北京の中華民国政府を打倒し、12月に張学良もこれを承認したことから、国民政府によって中国は再び統一された。\n" +
"\n" +
"[編集] 国民政府（1928年～1931年）\n" +
"蒋介石\n" +
"蒋介石\n" +
"\n" +
"国民政府においては基本的に国民党の一党独裁の立場が貫かれた。しかし一般党員の数は50万人以下であったとされており、4億をこえると考えられた中国国民のなかではかなり少数であった（国民の多くが「国民」として登録されておらず、しかも文盲のものも多かった）。そのため支配基盤は完全とは言えず、土地税を中心として地方政権の財源を確保する国地画分政策がおこなって、割拠的傾向がいまだに強い地方勢力に配慮したりした。1930年代前半には国民政府に叛旗を翻す形で地方政権が樹立される例が多くなり、軍事衝突なども起きた。1930年に閻錫山と汪兆銘が中心となった北平政府や1931年に孫科らがたてた広州政府などである。\n" +
"\n" +
"しかしこのような軍事的緊張は国民政府の中央軍を掌握していた蒋介石の立場を強めることにもなった。蒋介石は経済政策[8]でも手腕を発揮し影響力を増した。\n" +
"\n" +
"[編集] 抗日戦争（1931年～1937年）\n" +
"満州国皇帝愛新覚羅溥儀\n" +
"満州国皇帝愛新覚羅溥儀\n" +
"\n" +
"張作霖が関東軍に爆殺されたあとをついだ張学良は国民革命を支持しており、自身の支配していた中国東北地方を国民政府へ合流させた。このために反日運動が中国東北地方にも広がったが、日本は中国東北地方の権益を確保しようとしていたためにこれに大きく反発した。1931年9月、満州事変がおこり、関東軍によって日本政府の意向を無視して大規模な武力行動がおこなわれた。しかし列強はこれを傍観する姿勢をとったので、日本政府はこの行動を追認した。\n" +
"\n" +
"東北地方をほぼ制圧した日本軍は、1932年に上海事変を起こし、列強がそれに注目している間に傀儡政権として満州国を東北地方に樹立した。同年10月、リットン調査団が国際連盟によって派遣され、満州国を中国の主権の下に列強の共同管理による自治政府とするべきという妥協案を示したが、日本は採択に反対した。1933年5月日中間で停戦協定（塘沽協定）が結ばれた。1934年には満州国は帝制に移行し、満州帝国となった。\n" +
"\n" +
"1931年に瑞金に政権を樹立していた中国共産党は満州国建国時に日本に宣戦布告していたが、国民党との抗争に忙しく、中国国民で一致して日本の侵略に立ち向かうことはできなかった。1934年には瑞金は国民党により陥落し、打撃を受けた中国共産党は長征と称して西部に移動し、組織の再編をはかった。長征の結果中国共産党は延安に拠点を移した。\n" +
"\n" +
"[編集] 日中戦争（1937年～1945年）\n" +
"\n" +
"1937年には、盧溝橋事件を契機に、日本軍が中国本土に進出し、中華民国と全面戦争に入った（日中戦争）。これに対し、蒋介石は当初日本との戦いよりも中国共産党との戦いを優先していたが、西安事件により、二つの党が協力して日本と戦うことになった（第二次国共合作）。\n" +
"カイロ会談に出席した蒋介石とアメリカのフランクリン・D・ルーズベルト大統領、イギリスのウィンストン・チャーチル首相\n" +
"カイロ会談に出席した蒋介石とアメリカのフランクリン・D・ルーズベルト大統領、イギリスのウィンストン・チャーチル首相\n" +
"\n" +
"しかし日中戦争は当初日本軍優位に進み、日本軍は多くの都市を占領したが、各拠点支配はできても広大な中国において面での支配はできず、これを利用した国民党軍・共産党軍ともに各地でゲリラ戦を行い日本軍を苦しめ、戦線を膠着させた。日本は汪兆銘ら国民党左派を懐柔、南京国民政府を樹立させたが、国内外ともに支持は得られなかった。加えて1941年12月、日本はアメリカやイギリス（連合国）とも戦端を開いたが（太平洋戦争）、一方で中国で多くの戦力を釘付けにされるなど、苦しい状況に落ち込まされた。国民党政府は連合国側に所属し、アメリカやイギリスなどから豊富な援助を受けることとなった。\n" +
"\n" +
"結局、中国大陸戦線では終始日本側が優勢であったものの、1945年8月ポツダム宣言の受諾とともに日本が無条件降伏することで終結した。国民党政府は連合国の1国として大きな地位を占めていたこともあり、戦勝国として有利な立場を有することとなり、日本だけでなくヨーロッパ諸国も租界を返還するなど、中国の半植民地化は一応の終わりを見せた。\n" +
"\n" +
"しかしまもなく国民党と共産党との対立が激化して国共内戦が勃発し、結果として左派が力を持ったアメリカからの支援が減った国民党に対して、ソビエト連邦からの支援を受けていた中国共産党が勝利し、1949年10月1日に毛沢東が中華人民共和国の成立を宣言した。内戦に敗れた中国国民党率いる中華民国政府は台湾島に撤退し、現在に至るまで中国共産党率いる中華人民共和国と「中国を代表する正統な政府」の地位を争っている。\n" +
"\n" +
"[編集] 漢民族以外の民族の動向\n" +
"\n" +
"[編集] モンゴルとチベットでの動き\n" +
"\n" +
"辛亥革命により清国が消滅すると、その旧領をめぐって中国、モンゴル、チベットは、それぞれに自領域を主張した。\n" +
"\n" +
"中国は清領全域を主張した。これに対して、モンゴルとチベットは、自分たちは清朝の皇帝に服属していたのであって中国という国家に帰属するものではなく、服属先の清帝退位後は中国と対等の国家であると主張し独立を目指す動きが強まった。\n" +
"ポタラ宮、当時のチベットの中心地\n" +
"ポタラ宮、当時のチベットの中心地\n" +
"\n" +
"1913年、モンゴルではボグド・ハーンによって、チベットではダライ・ラマ13世よって中国からの独立が宣言され、両者はモンゴル・チベット相互承認条約を締結するなど国際的承認をもとめ、これを認めない中華民国とは戦火を交えた。 この状況は、モンゴル域への勢力浸透をはかるロシア、チベット域への進出をねらうイギリスの介入をゆるし、モンゴル・ロシア・中華民国はキャフタ協定に調印批准、チベット・イギリス・中華民国はシムラ協定（民国政府のみ調印、批准されなかった）が模索されたものの問題の解決には至らなかった。\n" +
"\n" +
"ダライ・ラマを補佐していたパンチェン・ラマは親中国的であったために、イギリスに接近するダライ・ラマに反発し、1925年に中国に亡命した。1933年、ダライ・ラマ13世が死去、中国の統治下にあったチベット東北部のアムド地方（青海省）で生まれたダライ・ラマ14世の即位式典に列席した国民政府の使節団は、式典が終了したのちも、蒙蔵委員会駐蔵弁事處を自称してラサにとどまった。1936年には長征中の中国共産党の労農紅軍が、カム地方東部（四川省西部、当時西康省）に滞留中、同地のチベット人に「チベット人人民共和国」（博巴人民共和国）[9]を組織させたが、紅軍の退出とともに、ほどなく消滅した。\n" +
"\n" +
"この問題は、モンゴルについては、1947年、外蒙古部分のみの独立を中華民国政府が承認することによって、チベットについては、1950年、十七ヶ条協定によってチベットの独立が否定され中華人民共和国の一地方となったことによって、一応の決着をみた。\n" +
"\n" +
"[編集] 東トルキスタン（新疆）での動き\n" +
"\n" +
"東トルキスタン（新疆)では、19世紀中に統治機構の中国化が達成されていた。すなわち、旗人の3将軍による軍政と、地元ムスリムによるベク官人制にかわり、省を頂点に府、州、県に行政区画された各地方に漢人科挙官僚が派遣されて統治する体制である。そのため、辛亥革命時、東トルキスタンでは、地元ムスリムがチベットやモンゴルと歩調をあわせて自身の独立国家を形成しようとする動きはみられず、新疆省の当局者たちは、すみやかに新共和国へ合流する姿勢を示した。この地では、楊増新が自立的な政権を維持し、またソ連と独自に難民や貿易の問題について交渉した。楊増新の暗殺後は金樹仁が実権が握ったが、彼は重税を課して腐敗した政治をおこなったため、1931年には大規模な内乱状態に陥った。その後金樹仁の部下であった盛世才が実権を握るようになり、彼はソ連にならった政策を打ち出して徐々に権力を強化した。一方で1933年には南部で東トルキスタン共和国の独立が宣言されたが、わずか6ヶ月で倒れた。\n" +
"\n" +
"[編集] 中華人民共和国\n" +
"\n" +
"[編集] 社会主義国化と粛清（1949年～1957年）\n" +
"「建国宣言」を行なう毛沢東\n" +
"「建国宣言」を行なう毛沢東\n" +
"\n" +
"1950年中ソ友好同盟相互援助条約が結ばれた。これは日本およびその同盟国との戦争を想定して締結されたものである。この条約でソ連が租借していた大連、旅順が返還され、ソ連の経済援助の下で復興を目指すこととなった。1953年より社会主義化が進み、人民政治協商会議に代わって全国人民代表大会が成立、農業生産合作社が組織された。\n" +
"\n" +
"1956年にソ連でフルシチョフによって「スターリン批判」がおこなわれると、東欧の社会主義国に動揺がはしった。中国共産党政府も共産圏にある国としてこの問題への対処を迫られ、この年初めて開催された党全国代表大会では、「毛沢東思想」という文言が党規約から消えた。そして全く一時的に（わずか2ヶ月）「百花斉放、百家争鳴」と称して民主党などの「ブルジョワ政党」の政治参加が試みられた。しかしブルジョワ政党が中国共産党政府による一党独裁に対して激しい批判を噴出させたため、逆に共産党による反右派闘争を惹起し、一党支配体制は強められた。一方で中ソ協定が結ばれ、軍事上の対ソ依存は強くなった。この時代の中華人民共和国をソ連のアメリカに対する緩衝国家あるいは衛星国家とみなすことも可能である。しかし徐々にデタント政策へと転回し始めていたソ連の対外政策は、中国共産党政府の中華民国に対する強硬政策と明らかに矛盾していた。\n" +
"\n" +
"[編集] 中国共産党の対ソ自立化（1958年～1965年）\n" +
"\n" +
"1958年に、毛沢東は大躍進政策を開始し、人民公社化を推進した。当初はかなりの効果をあげたかに見えた人民公社であったが、党幹部を意識した誇大報告の存在、極端な労働平均化などの問題が開始3ヶ月にしてすでに報告されていた。毛沢東はこのような報告を右派的な日和見主義であり、過渡的な問題に過ぎないと見ていたため、反対意見を封殺したが、あまりに急速な人民公社化は都市人口の異様な増大など深刻な問題を引き起こしていた。\n" +
"\n" +
"一方でこの年、中国共産党政府は台湾海峡で中華民国に対して大規模な軍事行動を起こし、アメリカ軍の介入を招いた。フルシチョフは中国共産党政府の強硬な姿勢を非難し、また自国がアメリカとの全面戦争に引きずり込まれないように努力した。ソ連はワルシャワ条約機構の東アジア版ともいうべき中ソの共同防衛体制を提案したが、中国共産党政府はソ連の対外政策への不信からこれを断った。その後1959年6月ソ連は中ソ協定を一方的に破棄した。1960年には経済技術援助条約も打ち切られ、この年の中国のGNPは1%も下落した。\n" +
"\n" +
"1959年と1960年に大規模な飢饉が中国を襲い、1500万人程度（2000万から5000万人以上とも）と言われる餓死者を出して大躍進政策も失敗に終わった。1960年代初頭には人民公社の縮小がおこなわれ、毛沢東自身が自己批判をおこなうなど、一見調整的な時期に入ったように思われた。劉少奇が第2次5ヶ年計画の失敗を人民公社による分権的傾向にあると指摘し、中央集権を目指した政治改革、個人経営を一部認めるなど官僚主義的な経済調整をおこなった。\n" +
"\n" +
"しかし党組織の中央集権化と個人経営に懐疑的であった毛沢東はこれを修正主義に陥るものであると見ていた。1963年に毛沢東は「社会主義教育運動」を提唱し、下部構造である「農村の基層組織の3分の1」は地主やブルジョワ分子によって簒奪されていると述べた。これは劉少奇ら「実権派」を暗に批判するものであった。またこのころ毛沢東は「文芸整風」運動と称して学術界、芸術界の刷新をはかっていたことも、のちの文化大革命の伏線となった。1964年中国は核実験に成功し、軍事的な自立化に大きな一歩を踏み出した。一方で1965年にアメリカによる北爆が始まりベトナム戦争が本格化すると、軍事的緊張も高まった。\n" +
"\n" +
"チベットでは独立運動が高まったが、政府はこれを運動家に対する拷問など暴力によって弾圧した。このため多数の難民がインドへ流入した。\n" +
"\n" +
"[編集] 文化大革命前期（1966年～1969年）\n" +
"天安門広場は中華人民共和国時代にも多くの歴史の舞台となった\n" +
"天安門広場は中華人民共和国時代にも多くの歴史の舞台となった\n" +
"\n" +
"1966年に毛沢東は文化大革命を提唱した。毛沢東の指示によって中央文化革命小組が設置され、北京の青少年によって革命に賛同する組織である紅衛兵が結成された。毛沢東は「造反有理」（反動派に対する謀反には道理がある）という言葉でこの運動を支持したので、紅衛兵は各地で組織されるようになった。\n" +
"\n" +
"毛沢東は文革の目的をブルジョワ的反動主義者と「実権派」であるとし、劉少奇とその支持者を攻撃対象とした。毛沢東は林彪の掌握する軍を背景として劉少奇を失脚させた。しかし文化大革命は政治だけにとどまることがなく、広く社会や文化一般にも批判の矛先が向けられ、反革命派とされた文化人をつるし上げたり、反動的とされた文物が破壊されたりした。\n" +
"\n" +
"1966年の末ごろから武力的な闘争が本格化し、地方では党組織と紅衛兵との間で武力を伴った激しい権力闘争がおこなわれた。毛沢東は秩序維持の目的から軍を介入させたが、軍は毛沢東の意向を汲んで紅衛兵などの中国共産党左派に加担した。中央では周恩来らと文革小組の間で権力闘争がおこなわれた。1967年の後半になると、毛沢東は内乱状態になった国内を鎮めるために軍を紅衛兵運動の基盤であった学校や工場に駐屯させた。\n" +
"\n" +
"この時期軍の影響力は極端に増大し、それに伴って林彪が急速に台頭した。1969年には中ソ国境の珍宝島で両国の軍事衝突があり（中ソ国境紛争）、軍事的緊張が高まったこともこれを推進した。同年採択された党規約で林彪は毛沢東の後継者であると定められた。\n" +
"\n" +
"[編集] 文化大革命後期（1969～1976年）\n" +
"\n" +
"文化大革命は後期になると国内の権力闘争や内乱状態を引き起こしたが、最終的に文化大革命は1976年の毛沢東死去で終結した。 文化大革命では各地で文化財破壊や大量の殺戮が行われ、その犠牲者の合計数は数百万人とも数千万人とも言われている。また学生たちが下放され農村で働くなど、生産現場や教育現場は混乱し、特に産業育成や高等教育などで長いブランクをもたらした。\n" +
"\n" +
"一方この時期、ソ連に敵対する中国共産党政府は、同じくソ連と敵対する日本やアメリカなどからの外交的承認を受け、この結果国連の常任理事国の議席も台湾島に遷都した中華民国政府（国民党政権）に変わって手にするなど、国際政治での存在感を高めつつあった。\n" +
"\n" +
"[編集] 改革開放以後の現在（1976年～）\n" +
"返還された香港は中国経済の牽引都市になっている\n" +
"返還された香港は中国経済の牽引都市になっている\n" +
"\n" +
"その後は一旦華国鋒が後を継いだが、1978年12月第11期三中全会で鄧小平が政権を握った。鄧小平は、政治体制は共産党一党独裁を堅持しつつ、資本主義経済導入などの改革開放政策を取り、近代化を進めた（社会主義市場経済、鄧小平理論）。この結果、香港ほか日米欧などの外資の流入が開始され、中国経済は離陸を始めた。\n" +
"\n" +
"[編集] 一党独裁\n" +
"\n" +
"冷戦崩壊後に、複数政党による選挙や言論の自由などの民主主義化を達成した中華民国と違い、いまだに中国共産党政府による一党独裁から脱却できない中華人民共和国には多数の問題が山積している。\n" +
"\n" +
"1989年には北京で、1980年代の改革開放政策を進めながら失脚していた胡耀邦の死を悼み、民主化を求める学生や市民の百万人規模のデモ（天安門事件）が起きたが、これは政府により武力鎮圧された。その一連の民主化運動の犠牲者数は中国共産党政府の報告と諸外国の調査との意見の違いがあるが、数百人から数万人に上るといわれている。しかし中国共産党政府はこの事件に関しては国内での正確な報道を許さず、事件後の国外からの非難についても虐殺の正当化に終始している。\n" +
"\n" +
"この事件以降も、中国共産党政府は情報や政策の透明化、民主化や法整備の充実などの国際市場が要求する近代化と、暴動や国家分裂につながる事態を避けるため、内外の報道機関やインターネットに統制を加え、反政府活動家に対する弾圧を加えるなどの前近代的な動きとの間で揺れている。この様な中、2003年には国内でSARSの大発生があったが、このときも政府は虚偽の発表を行なうなど問題の隠蔽を繰り返した。\n" +
"\n" +
"天安門事件で外資流入に急ブレーキがかかったが、1990年代には、江沢民政権のもとで、鄧小平路線に従い、経済の改革開放が進み、特に安い人件費を生かした工場誘致で「世界の工場」と呼ばれるほど経済は急成長した。なお、1997年にイギリスから香港が、1999年にポルトガルからマカオが、それぞれ中華人民共和国に返還され、植民地時代に整備された経済的、法的インフラを引き継ぎ、中華人民共和国の経済の大きな推進役となっている。また、敵対している中華民国との間にも経済的な交流が進み、両国の首都の間に直行便が就航するまでになっている。\n" +
"\n" +
"人口、面積ともに世界的な規模をもつことから、アメリカの証券会社であるゴールドマンサックスは、「中華人民共和国は2050年に世界最大の経済大国になる」と予想するなど、現在、中国経済の動向は良くも悪くも注目されているが、低賃金による大量生産を売り物にしてきた経済成長は賃金上昇・東南アジアやインドの追い上げなどで限界に達しており、産業の高度化や高付加価値化などの難題に迫られている。また、各種経済統計も中国共産党政府発表のそれは信憑性が乏しいと諸外国から指摘されている。各省など地方も独自の産業振興策に走り、中国共産党中央政府に対して経済統計の水増し発表や災害などの情報隠蔽を行うなど、統計や発表の信憑性不足に拍車をかけている。\n" +
"\n" +
"これらのことより、中国共産党の一党独裁による言論統制や貧富格差、地域格差など国内のひずみを放置し続ければ、いずれ内部崩壊を起こして再度混乱状態に陥り、ソ連同様に中華人民共和国という国家体制そのものが解体、消滅するという意見も多い。\n" +
"\n" +
"[編集] 少数民族問題\n" +
"\n" +
"なお、少数民族が住む新疆ウイグル自治区（東トルキスタン）では現在漢化政策の進展によって、漢民族が同地域へ大量に流入する、都市を中心として就職などに有利な中国語教育の充実によりウイグル語が廃れるなどの民族的なマイノリティ問題が発生している。またタクラマカン砂漠の石油資源利用や新疆南北の経済格差が広がっているなど、中国共産党政府の経済政策に対する批判も根強い。\n" +
"\n" +
"1997年には新疆ウイグル自治区で大規模な暴動が起きた。海外で東トルキスタン独立運動がおこなわれている一方国内でもウイグル人活動家の処刑などが行われているが、民族自治における権限拡大という現実主義的な主張もあらわれている。たとえば中国語教育を受けたウイグル人が中国共産党組織に参加する、新疆での中国共産党政府の経済政策に積極的に参加するといった事例も見られる。\n" +
"\n" +
"チベット自治区では歴史的なチベットの主権を主張するダライ・ラマの亡命政権が海外に存在し、中国共産党政府が不法な領土占拠をしていると訴えるとともに独立運動が継続されている。中国共産党政府はこれを武力で弾圧し続け、独立運動家への拷問などを行なったために、多数の難民が隣国のインドに流入した。\n" +
"\n" +
"[編集] 人口の変遷\n" +
"\n" +
"以下のデータは主に楊学通「計画生育是我国人口史発展的必然」（1980年）による。\n" +
"時代 	年代 	戸数 	人口 	資料出所\n" +
"（夏） 	禹（前2205年とされる） 		13,553,923 	『帝王世紀』\n" +
"秦 			20,000,000? 	\n" +
"前漢 	平帝元始2年（2年） 	12,233,062 	59,594,978 	『漢書』地理志\n" +
"新 			20,000,000? 	\n" +
"後漢 	順帝建康元年（144年） 	9,946,919 	49,730,550 	『冊府元亀』\n" +
"晋 	武帝泰康元年（280年） 	2,459,804 	16,163,863 	『晋書』食貨志\n" +
"隋 	煬帝大業2年（606年） 	8,907,536 	46,019,056 	『隋書』地理志・食貨志\n" +
"唐 	玄宗天宝14年（755年） 	8,914,709 	52,919,309 	『通志』\n" +
"宋 	神宗元豊3年（1080年） 	14,852,684 	33,303,889 	『宋史』地理志\n" +
"金 	章宗明昌6年（1195年） 	7,223,400 	48,490,400 	『金史』食貨志\n" +
"元 	世祖至元27年（1290年） 	13,196,206 	58,834,711 	『元史』地理志\n" +
"明 	神宗万暦6年（1570年） 	10,621,436 	60,692,850 	『続文献通考』\n" +
"清 	清初（1644年） 		45,000,000 	\n" +
"聖祖康熙50年（1711年） 		100,000,000以上 	\n" +
"高宗乾隆27年（1762年） 		200,000,000以上 	\n" +
"高宗乾隆55年（1790年） 		300,000,000以上 	\n" +
"仁宗嘉慶17年（1812年） 		333,700,560 	『東華録』\n" +
"宣宗道光14年（1834年） 		400,000,000以上 	\n" +
"中華民国 	民国36年（1947年） 		455,590,000 	『統計提要』\n" +
"中華人民共和国 	1995年 		1,211,210,000 	『中国統計年鑑』\n" +
"\n" +
"[編集] 地方行政制度\n" +
"\n" +
"[編集] 封建制度（前1600年頃～前221年）\n" +
"\n" +
"殷・周の時代は封建制度[10]によって一定の直轄地以外は間接的に統治された。\n" +
"\n" +
"[編集] 郡県制度（前221年～249年）\n" +
"\n" +
"中国最初の統一王朝である秦は全国を郡とその下級単位である県に分ける郡県制度によって征服地を統治した。前漢初期においては、郡以上に広域な自治を認められた行政単位である国が一部の功臣や皇族のために設置された。しかし徐々に国の行政権限が回収されるとともに、推恩政策によって国の細分化が進められ、国は郡県と等しいものとなり、後漢時代には実質郡県制度そのままとなっていた。\n" +
"\n" +
"前漢時代に広域な監察制度としての刺史制度が始められると全国を13州[11]に分けた。これはいまだ行政的なものではない[12]と考えられている。後漢の後の魏王朝では官僚登用制度としての九品官人法が249年に司馬懿によって州単位でおこなわれるように適用されたので、行政単位として郡以上に広域な州が現実的な行政単位として確立したと考えられている。が、軍政面と官吏登用面のほかにどれほど地方行政に貢献したか[13]はあまり明確ではない。\n" +
"\n" +
"[編集] 軍府による広域行政（249年～583年）\n" +
"\n" +
"魏晋時代から都督府などの軍府の重要性が高まった。五胡十六国および南北朝時代になると、中国内部で複数の王朝が割拠し軍事的な緊張が高まったことから、とくに南朝において重要性が増した。これは本来特定の行政機関を持たなかったと思われる刺史に対して、軍事的に重要な地域の刺史に例外的に複数の州を統括できる行政権を与えたものであった。長官である府主（府の長官は一般的にさまざまな将軍号を帯び、呼称は一定ではないため便宜的に府主とする）は属僚の選定に対して大幅な裁量権が与えられており、そのため地方で自治的な支配を及ぼすことが出来た。また南朝では西晋末期から官吏登用において州は形骸化しており、吏部尚書によって官制における中央集権化が進行している。したがって中正官も単なる地方官吏に過ぎなくなり、広域行政単位としての州は官吏登用の面からは重要性が低下したが、地方行政単位としてはより実際性を帯びた。この時代州は一般に細分化傾向にあり、南北朝前期には中国全土で5,60州、南北朝末期に至ると中国全土で300州以上になり、ひとつの州がわずか2郡、ひとつの郡はわずか2,3県しか含まないという有様であった。\n" +
"\n" +
"[編集] 州県制（583年～1276年）\n" +
"\n" +
"南朝では都督制度が発達していたころ、北魏では州鎮制度が発達した。北魏では征服地にまず軍事的性格の強い鎮を置き、鎮は一般の平民と区別され軍籍に登録された鎮民を隷属させて支配した。鎮は徐々に州に改められたようであるが、北部辺境などでは鎮がずっと維持された。583年に隋の文帝が郡を廃止し、州県二級の行政制度を開始した。この際従来の軍府制度[14]にあった漢代地方制度的な旧州刺史系統の地方官は廃止され、軍府系統の地方官に統一されたと考えられている。595年には形骸化していた中正官も最終的に廃止されたという指摘もされている。またこれにより府主の属官任命権が著しく制限され、中央集権化がはかられた。唐では辺境を中心に広域な州鎮的軍府である総管府が置かれたが徐々に廃止され、刺史制度に基づいた地方軍的軍府、それに中央軍に対する吏部の人事権が強化・一元化され、軍事制度の中央集権化が完成された。特定の州に折衝府が置かれ、自営農民を中心として府兵が組織され常備地方軍[15]とされた。唐では州の上に10の道も設置されたが、これは監察区域で行政単位ではないと考えられている。\n" +
"\n" +
"[編集] 祭祀制度\n" +
"\n" +
"中国でおこなわれた国家祭祀については皇帝祭祀を参照。\n" +
"\n" +
"[編集] 外交\n" +
"\n" +
"中国大陸の諸王朝は前近代まで基本的に東アジアでの優越的な地位を主張し、外交的には大国として近隣諸国を従属的に扱う冊封体制が主流であった。\n" +
"\n" +
"[編集] 漢帝国\n" +
"\n" +
"漢代には南越、閩越、衛氏朝鮮などが漢の宗主権下にあったと考えられ、これらの国々は漢の冊封体制下にあったと考えられている。前漢武帝の時にこれらの諸国は征服され郡県に編入された。このことは漢の冊封が必ずしも永続的な冊封秩序を形成することを意図したものではなく、機会さえあれば実効支配を及ぼそうとしていたことを示す。また匈奴は基本的には冊封体制に組み込まれず、匈奴の単于と中国王朝の皇帝は原則的には対等であった。大秦（ローマ帝国のことを指すとされる）や大月氏などとの外交関係は冊封を前提とされていない。\n" +
"\n" +
"[編集] 魏晋南北朝時代\n" +
"\n" +
"魏晋南北朝時代には、中国王朝が分立する事態になったので、冊封体制は変質し実効支配を意図しない名目的な傾向が強くなったと考えられている。朝鮮半島では高句麗をはじめとして中小国家が分立する状態があらわれ、日本列島の古代国家[16] も半島の紛争に介入するようになったために、半島の紛争での外交的優位を得るため、これらの国々は積極的に中国王朝の冊封を求めた。しかし高句麗が北朝の実効支配には頑強に抵抗しているように、あくまで名目的関係にとどめようという努力がなされており、南越と閩越の紛争においておこなわれたような中国王朝の主導による紛争解決などは期待されていないという見方が主流である。\n" +
"\n" +
"[編集] 隋唐帝国\n" +
"\n" +
"再び中国大陸を統一した隋・唐の王朝の時代は東アジアの冊封体制がもっとも典型的となったという見方が主流である。隋は高句麗がみだりに突厥と通交し、辺境を侵したことからこれを討伐しようとしたが、遠征に失敗した。唐は、新羅と連合し、高句麗・百済を滅亡させ、朝鮮半島を州県支配しようとしたが、新羅に敗北し、願いは、叶わなかった。したがって隋・唐の冊封は実効支配とは無関係に形成されるようになった。唐の冊封体制の下では、律令的な政治体制・仏教的な文化が共有された。\n" +
"\n" +
"一方、突厥や西域諸国が服属すると、それらの地域に対する支配は直接支配としての州県、外交支配としての冊封とは異なった羈縻政策[17]がおこなわれた。\n" +
"\n" +
"[編集] 関連項目\n" +
"\n" +
"    * 中華人民共和国\n" +
"    * 中華民国\n" +
"    * 中国帝王一覧\n" +
"    * 中国の首都\n" +
"    * 中国史時代区分表\n" +
"          o 夏商周年表\n" +
"          o 魏晋南北朝表\n" +
"    * 元号一覧\n" +
"    * 二十四史（清によって公認された正史）\n" +
"    * 中国史関係記事一覧\n" +
"    * マカオの歴史\n" +
"    * 香港の歴史\n" +
"    * 台湾の歴史\n" +
"    * 中国の通貨制度史\n" +
"    * 中国の仏教\n" +
"    * 中国法制史\n" +
"    * 中国化\n" +
"\n" +
"Wikibooks\n" +
"ウィキブックスに中国史関連の教科書や解説書があります。\n" +
"[編集] 脚注\n" +
"\n" +
"   1. ^ 浙江省紹興市郊外にある陵墓が禹のものであるとされ、戦国時代同地を支配していた越王勾践が禹の子孫を標榜していること、夏の桀王が『史記』鄭玄注などで淮河と長江の中間にある南巣で死んだとしていることなどによる。\n" +
"   2. ^ 河南省にある偃師二里頭遺跡が夏のものではないかとされているが、文書などが発見されていないため確定はされていない。また偃師二里頭遺跡での発掘結果から殷との連続性が確認されたが、細かい分析においては殷との非連続性も確認されているため、偃師二里頭遺跡が夏王朝のものであっても、夏が黄河流域起源の王朝であったかどうかは論争中である。\n" +
"   3. ^ 代表的な遺跡殷墟が有名であるため日本では一般に殷と呼ばれるが、商の地が殷王朝の故郷とされており、商が自称であるという説もあるため、中国では商と呼ぶほうが一般的である。\n" +
"   4. ^ ただし殷を北西から侵入してきた遊牧民族による征服王朝だとする説もある。これは偃師二里頭遺跡では青銅器が現地生産されているのに対し、殷時代の青銅器は主に蜀方面で生産されていたことが確認されていることによる。\n" +
"   5. ^ 当初は漢魏革命の際に漢の官僚を魏宮廷に回収する目的で制定されたものであったが、優れたものであったために一般的な官吏登用に使用されるようになった。これは中正官を通して地方の世論を反映した人事政策をおこなうもので、地方で名望のあったものをその程度に応じて品位に分け官僚として登用するものであった。官僚は自身の品位と官職の官品に従って一定の官職を歴任した。地方の世論に基づくとはいえ、一般的に家柄が重視される傾向にあり、「上品に寒門なく、下品に勢族なし」といわれた。南北朝時代になると官職内で名誉的な清流官職と濁流官職が貴族意識によって明確に分けられ、また家柄によって官職が固定される傾向が顕著となった。このような傾向は専制支配を貫徹しようとする皇帝の意向と対立するものであったため、官品の整理をおこなって清濁の区別をなくす努力が続けられた。しかし皇帝も貴族社会の解体そのものを望んでおらず、貴族社会の上位に皇帝権力を位置づけることでヒエラルキーを維持しようとしていたから、官職制度の根幹的な改変には至らず、官職の家柄による独占傾向を抑えることは出来なかった。\n" +
"   6. ^ 1916年8月に復活された。\n" +
"   7. ^ これはロシア革命に対するシベリア出兵において日中両軍が協力するという秘密条約である。\n" +
"   8. ^ 1928年～30年に各国と交渉して関税自主権を回復し、関税を引き上げ、塩税と統一消費税をさだめて財源を確保した。アメリカとイギリスの銀行資本に「法幣」という紙幣を使用させ、秤量貨幣であった銀両を廃止した。さらにアメリカ政府に銀を売ってドルを外為資金として貯蓄した。これにより国際的な銀価格の中国の国内経済に対する影響が大幅に緩和された。このような経済政策を積極的に推進したのは国民政府財政部長の宋子文で、彼は孫文の妻宋慶齢の弟で、妹はのちに蒋介石と結婚した宋美齢であった。\n" +
"   9. ^ 博巴あるいは波巴とはチベット人の自称。日本語に訳せばチベット人の人民政府という意味である。博巴と波巴はともに「ぽぱ」と読む。\n" +
"  10. ^ 封建制度は殷代からおこなわれているが、殷代封建制についてはあまり明確なことはわからない。殷では封建がおこなわれている地域と方国と呼ばれる、外様あるいは異民族の国家の存在が知られ、殷を方国の連盟の盟主であり、封建された国々は殷の同族国家であるとする説もあるが詳しいことはわからない。周では一定の城市を基準とした邑に基づいた封建制が広汎におこなわれたと考えられているが、この邑制国家の実態も不明である。邑をポリス的な都市国家とみる見方から、邑と周辺農地である鄙が一緒になって（これを邑土という）、貴族による大土地所有であるとする見方もある。明らかであるのは邑を支配した貴族が長子相続を根幹とした血族共同体をもっていたということで、このような共同体に基づいた支配形態を宗法制度という。宗法制度については殷代にさかのぼる見方もあるが、広汎におこなわれたのは春秋あるいは戦国時代であったとする説もある。周の封建制を宗法制度の延長にあるものと捉え、封建儀礼を宗族への加盟儀礼の延長として捉える見方もある。\n" +
"  11. ^ 中国古来より中国世界を9つの地方に分ける考え方が漠然と存在した。中国王朝の支配領域を「九州」といい、それがすなわち「天下」であった。ただし九州の概念は後漢時代にいたるまでははっきりしたものではなく一様でない。\n" +
"  12. ^ 前漢成帝のときに州の監察権が御史中丞へ移行され、刺史が行政官となったという見方もあるが、後漢末期に刺史に軍事権が認められると、広域行政単位としての州はにわかに現実化したとみる見方もある。\n" +
"  13. ^ このころの州を行政単位ではなく、軍管区のような概念上の管理単位であるとする見方も強い。\n" +
"  14. ^ 北周の宇文護が創始した二十四軍制をもっていわゆる府兵制の成立と見做す見方があるがこれについては詳しいことはわからない。\n" +
"  15. ^ 折衝府の置かれた州と非設置州では当然差異があったのであるが、唐代はほかに募兵に基づく行軍制度もおこなわれており、大規模な対外戦争の際にはおもに折衝府非設置州を中心として兵が集められた。唐後期にはこの募兵制が常態化することで節度使制度がおこなわれるようになった。\n" +
"  16. ^ なお、史書からうかがえる外交記録と日本国内での銅鏡など出土品に記載された年号の問題などから、日本の古代王朝は特に南朝との外交関係を重視していたという見方が主流であるが、北朝との通交事実を明らかにしようという研究は続けられている。\n" +
"  17. ^ これは都護府を通じて服属民族を部族別に自治権を与えて間接支配するもので、羈縻政策がおこなわれた地域では現地民の国家は否定された。このことは羈縻州の住民が自発的に中国王朝の文化を受け入れることを阻害したと考えられており、羈縻政策のおこなわれた地域では冊封のおこなわれた地域とは異なり、漢字や律令などの文化の共有はおこなわれず、唐の支配が後退すると、唐の文化もこの地域では衰退することになった。冊封された国々で唐の支配が後退したあとも漢字文化が存続したことと対照的である。\n";


var korean =
"한국의 역사\n" +
"위키백과 ― 우리 모두의 백과사전.\n" +
" 이 문서는 남, 북으로 분단된 1945년 이전의 한국에 대한 역사를 주로 기술하고 있다.\n" +
"\n" +
"한국의 역사 (연표)\n" +
"한국의 선사 시대 (유적)\n" +
"환인 · 환웅 (신시)\n" +
"　	고조선 - 단군\n" +
"진국\n" +
"원\n" +
"삼\n" +
"국\n" +
"|\n" +
"삼\n" +
"국\n" +
"|\n" +
"남\n" +
"북\n" +
"국\n" +
"|\n" +
"후\n" +
"삼\n" +
"국	삼한	옥\n" +
"저	동\n" +
"예	부\n" +
"여\n" +
"진\n" +
"한	변\n" +
"한	마\n" +
"한\n" +
"　	가\n" +
"야	　\n" +
"　\n" +
"백\n" +
"제\n" +
"　\n" +
"　	고\n" +
"구\n" +
"려	　	　\n" +
"신\n" +
"라	　	　\n" +
"　	　\n" +
"후\n" +
"백\n" +
"제	태\n" +
"봉	발\n" +
"해\n" +
"　\n" +
"고려\n" +
"　\n" +
"　\n" +
"조선\n" +
"　\n" +
"대한제국\n" +
"대한민국임시정부\n" +
"일제 강점기 (조선총독부)\n" +
"군정기\n" +
"대한민국	조선민주주의\n" +
"인민공화국\n" +
"한국의 인물\n" +
"한국의 역사는 구석기 시대 이후의 주로 한반도와 만주, 넓게는 동아시아 지역을 배경으로 발전되어 온 한국인의 역사이다.\n" +
"목차 [숨기기]\n" +
"1 선사 시대\n" +
"1.1 유적에 의한 구분\n" +
"1.2 문헌에 의한 구분\n" +
"2 상고 시대 (B.C. 2333년 ~ A.D. 1세기)\n" +
"2.1 고조선 시대\n" +
"2.2 고조선 멸망 이후 여러나라의 성장\n" +
"3 고대 시대 (A.D. 1세기~A.D. 900)\n" +
"3.1 삼국시대\n" +
"3.1.1 삼국시대 경제\n" +
"3.1.2 삼국시대 정치\n" +
"3.2 남북국시대\n" +
"4 중세시대 (A.D. 918년 ~ A.D. 1392년)\n" +
"4.1 고려의 정치\n" +
"4.2 고려의 경제\n" +
"4.3 고려의 사회\n" +
"4.4 고려의 문화\n" +
"5 근세시대 (A.D. 1392년 ~ A.D. 1506년)\n" +
"5.1 초기 조선의 정치\n" +
"5.2 초기 조선의 경제\n" +
"5.3 초기 조선의 사회\n" +
"5.4 초기 조선의 문화\n" +
"6 근대 태동기 (A.D. 1506년 ~ A.D. 1907년)\n" +
"6.1 후기 조선의 정치\n" +
"6.2 후기 조선의 경제\n" +
"6.3 후기 조선의 사회\n" +
"6.4 후기 조선의 문화\n" +
"7 근현대시대 (A.D. 1907년 ~ )\n" +
"7.1 개괄\n" +
"7.2 근대시대\n" +
"7.3 현대시대\n" +
"8 주석\n" +
"9 같이 보기\n" +
"10 참고문헌 및 링크\n" +
"10.1 역사 일반\n" +
"10.2 재단, 기타, 정부 기관\n" +
"[편집]\n" +
"선사 시대\n" +
"\n" +
"[편집]\n" +
"유적에 의한 구분\n" +
"한국의 구석기 시대(20만 년 이전 ~ 약 1만 년 전)\n" +
"한국의 신석기 시대(약 1만 년 전 ~ 약 4천 년 전)\n" +
"참고>> 웅기 부포리와 평양 만달리 유적, 통영 상노대도의 조개더미 최하층, 거창 임불리, 홍천 화화계리 유적 등을 중석기 유적지로 보는 사학자도 있다.\n" +
"[편집]\n" +
"문헌에 의한 구분\n" +
"환국시대 [1](비공식)\n" +
"신시[2] 또는 배달국 시대 [3](비공식)\n" +
"[편집]\n" +
"상고 시대 (B.C. 2333년 ~ A.D. 1세기)\n" +
"\n" +
"농경의 발달로 잉여 생산물이 생기고 청동기가 사용되면서 사유 재산 제도와 계급이 발생하였고, 그 결과, 부와 권력을 가진 족장(군장)이 출현하였다고 추측된다. 이 시기의 대표적인 유적으로 고인돌, 비파형 동검, 미송리식 토기 등이 있다. 부족장은 세력을 키워 주변 지역을 아우르고, 마침내 국가를 이룩하였다. 이 시기에 성립된 한국 최초의 국가가 고조선이다. 기원전 4세기경 철기가 보급되었고, 이후, 고조선은 철기 문화를 수용하면서 중국과 대립할 정도로 크게 발전하였으며, 만주와 한반도 각지에는 부여, 고구려, 옥저, 동예, 삼한 등 여러 나라가 성립될 수 있는 터전이 마련되었다.\n" +
"[편집]\n" +
"고조선 시대\n" +
"단군조선\n" +
"위만조선\n" +
"조선 시대 이전에는 은나라에서 건너온 기자가 세운 기자조선이 정식 역사로서 인정되었으나, 일제강점기를 전후로 점차 부인되어 현재에는 대한민국과 조선민주주의인민공화국의 역사학계 모두 이를 공식적으로 인정하지 않고 있으며, 사학자들도 대체적으로 이 설을 부정한다.\n" +
"[편집]\n" +
"고조선 멸망 이후 여러나라의 성장\n" +
"철기문명을 받아들인 각 나라들은 철기를 이용하여 농업을 발전시키면서도 독특한 사회 풍습을 유지하였다. 많은 소국들이 경쟁하는 가운데 일부는 다른 나라를 병합되었고, 다시 연맹 왕국으로 발전하여 중앙 집권 국가를 형성할 수 있는 기반을 마련하게 되었다.\n" +
"부여: 북부여, 동부여, 졸본부여\n" +
"옥저\n" +
"동예\n" +
"삼한:\n" +
"마한\n" +
"변한\n" +
"진한\n" +
"[편집]\n" +
"고대 시대 (A.D. 1세기~A.D. 900)\n" +
"\n" +
"[편집]\n" +
"삼국시대\n" +
"고구려\n" +
"백제\n" +
"신라\n" +
"삼국시대 초반은 고구려와 백제가 주도했으나 진흥왕 이후 국력이 막강해진 신라가 삼국시대 후기를 주도 했다.\n" +
"[편집]\n" +
"삼국시대 경제\n" +
"삼국의 경제는 기본적으로 물물교환 경제를 못 벗어난 체제였다고 한다.[출처 필요]\n" +
"삼국사기에는 신라가 수도에 시전을 세웠다는 기록이 있다.\n" +
"[편집]\n" +
"삼국시대 정치\n" +
"삼국의 정치는 기본적으로 중앙집권체제를 토대로 한 전제왕권 또는 귀족정치였다.\n" +
"[편집]\n" +
"남북국시대\n" +
"신라\n" +
"발해\n" +
"[편집]\n" +
"중세시대 (A.D. 918년 ~ A.D. 1392년)\n" +
"\n" +
"한국사에서는 고려시대를 중세시대로 보고 있다.\n" +
"[편집]\n" +
"고려의 정치\n" +
"고려는 새로운 통일 왕조로서 커다란 역사적 의의를 지닌다. 고려의 성립은 고대 사회에서 중세 사회로 이행하는 우리 역사의 내재적 발전을 의미한다. 신라말의 득난(6두품 세력) 출신 지식인과 호족 출신을 중심으로 성립한 고려는 골품 위주의 신라 사회보다 개방적이었고, 통치 체제도 과거제를 실시하는 등 효율성과 합리성이 강화되는 방향으로 정비되었다. 특히, 사상적으로 유교 정치 이념을 수용하여 고대적 성격을 벗어날 수 있었다.\n" +
"고려 시대는 외적의 침입이 유달리 많았던 시기였다. 그러나 고려는 줄기찬 항쟁으로 이를 극복할 수 있었다. 12세기 후반에 무신들이 일으킨 무신정변은 종전의 문신 귀족 중심의 사회를 변화 시키는 계기가 되어 신분이 낮은 사람도 정치적으로 진출할 수 있었다.\n" +
"이후, 무신 집권기와 원나라 간섭기를 지나 고려 후기에 이르러서는 새롭게 성장한 신진 사대부를 중심으로 성리학이 수용되어 합리적이고 민본적인 정치 이념이 성립되었고, 이에 따른 사회 개혁이 진전되었다.\n" +
"[편집]\n" +
"고려의 경제\n" +
"고려는 후삼국 시기의 혼란을 극복하고 전시과 제도를 만드는 등 토지 제도를 정비하여 통치 체제의 토대를 확립하였다. 또, 수취 체제를 정비하면서 토지와 인구를 파악하기 위하여 양전 사업을 실시하고 호적을 작성하였다. 아울러 국가가 주도하여 산업을 재편하면서 경작지를 확대시키고, 상업과 수공업의 체제를 확립하여 안정된 경제 기반을 확보하였다.\n" +
"농업에서는 기술의 발달로 농업 생산력이 증대되었고, 상업은 시전을 중심으로 도시 상업이 발달하면서 점차 지방에서도 상업 활동이 증가하였다. 수공업도 관청 수공업 중심에서 점차 사원이나 농민을 중심으로한 민간 수공업을 중심으로 발전해 갔다.\n" +
"[편집]\n" +
"고려의 사회\n" +
"고려의 사회 신분은 귀족, 중류층, 양민, 천민으로 구성되었다. 고려 지배층의 핵심은 귀족이었다. 신분은 세습되는 것이 원칙이었고, 각 신분에는 그에 따른 역이 부과되었다. 그러나 그렇지 않은 경우도 있었는데, 향리로부터 문반직에 오르는 경우와 군인이 군공을 쌓아 무반으로 출세하는 경우를 들 수 있다.\n" +
"백성의 대부분을 이루는 양민은 군현에 거주하는 농민으로, 조세, 공납, 역을 부담하였다. 향, 부곡, 소 같은 특수 행정 구역에 거주하는 백성은 조세 부담에 있어서 군현민보다 차별받았으나, 고려 후기 이후 특수 행정 구역은 일반 군현으로 바뀌어 갔다. 흉년이나 재해 등으로 어려움을 겪는 백성들의 생활을 안정시키기 위하여 국가는 의창과 상평창을 설치하고, 여러 가지 사회 복지 시책을 실시 하였다.\n" +
"[편집]\n" +
"고려의 문화\n" +
"고려 시대에 해당하는 중세 문화는 고대 문화의 기반 위에서 조상들의 노력과 슬기가 보태져 새로운 양상을 보였다.\n" +
"유교가 정치 이념으로 채택, 적용됨으로써 유교에 대한 인식이 확대 되었으며, 후기에는 성리학도 전래 되었다. 불교는 그 저변이 확대되어 생활 전반에 영향을 끼쳤다. 이런 가운데 불교 사상이 심화되고, 교종과 선종의 통합운동이 꾸준히 추진되었다.\n" +
"중세의 예술은 귀족 중심의 우아하고 세련된 특징을 드러내고 있다. 건축과 조각에서는 고대의 성격을 벗어나 중세적 양식을 창출하였으며, 청자와 인쇄술은 세계적인 수준을 자랑하고 있다. 그림과 문학에서도 중세의 품격 높은 멋을 찾아 볼 수 있다.\n" +
"[편집]\n" +
"근세시대 (A.D. 1392년 ~ A.D. 1506년)\n" +
"\n" +
"한국사에서는 초기 조선 시대를 근세시대로 보고 있다.\n" +
"[편집]\n" +
"초기 조선의 정치\n" +
"조선은 왕과 양반 관료들에 의하여 통치되었다. 왕은 최고 명령권자로서 통치 체제의 중심이었다. 조선 초기에는 고려 말에 성리학을 정치 이념으로 하면서 지방에서 성장한 신진 사대부들이 지배층이 되어 정국을 이끌어 나갔다. 그러나 15세기 말부터 새롭게 성장한 사림이 16세기 후반 이후 정국을 주도해 나가면서 학파를 중심으로 사림이 분열하여 붕당을 이루었다. 이후 여러 붕당 사이에 서로 비판하며 견제하는 붕당 정치를 전개하였다.\n" +
"정치 구조는 권력의 집중을 방지하면서 행정의 효율성을 높이는 방향으로 정비되었다. 관리 등용에 혈연이나 지연보다 능력을 중시하였고, 언로를 개방하여 독점적인 권력 행사를 견제하였다. 아울러 육조를 중심으로 행정을 분담하여 효율성을 높이면서 정책의 협의나 집행 과정에서 유기적인 연결이 가능하도록 하였다. 조선은 고려에 비하여 한 단계 발전된 모습을 보여 주면서 중세 사회에서 벗어나 근세 사회로 나아갔다.\n" +
"[편집]\n" +
"초기 조선의 경제\n" +
"조선은 고려 말기의 파탄된 국가 재정과 민생 문제를 해결하고 재정 확충과 민생 안정을 위한 방안으로 농본주의 경제 정책을 내세웠다. 특히 애민사상을 주장하는 왕도 정치 사상에서 민생 안정은 가장 먼저 해결해야 할 과제였다.\n" +
"조선 건국을 주도하였던 신진 사대부들은 중농 정책을 표방하면서 농경지를 확대하고 농업 생산력을 증가시키며, 농민의 조세 부담을 줄여 농민들의 생활을 안정시키려 하였다. 그리하여 건국 초부터 토지 개간을 장려하고 양전 사업을 실시한 결과 고려 말 50여만 결이었던 경지 면적이 15세기 중엽에는 160여만 결로 증가하였다. 또한 농업 생산력을 향상시키기 위하여 새로운 농업 기술과 농기구를 개발하여 민간에 널리 보급하였다.\n" +
"반면 상공업자가 허가 없이 마음대로 영업 활동을 벌이는 것을 규제하였는데, 이는 당시 검약한 생활을 강조하는 유교적인 경제관을 가진 사대부들이 물화의 수량과 종류를 정부가 통제하지 않고 자유 활동에 맡겨 두면 사치와 낭비가 조장되며 농업이 피폐하여 빈부의 격차가 커지게 된다고 생각하였기 때문이다. 더욱이 당시 사회에서는 직업적인 차별이 있어 상공업자들이 제대로 대우받지 못하였다.\n" +
"[편집]\n" +
"초기 조선의 사회\n" +
"조선은 사회 신분을 양인과 천민으로 구분하는 양천 제도를 법제화하였다. 양인은 과거에 응시하고 벼슬길에 오를 수 있는 자유민으로서 조세, 국역 등의 의무를 지녔다. 천민은 비(非)자유민으로서 개인이나 국가에 소속되어 천역을 담당하였다.\n" +
"양천 제도는 갑오개혁 이전까지 조선 사회를 지탱해 온 기본적인 신분 제도였다. 그러나 실제로는 양천 제도의 원칙에만 입각하여 운영되지는 않았다. 세월이 흐를수록 관직을 가진 사람을 의미하던 양반은 하나의 신분으로 굳어져 갔고, 양반 관료들을 보좌하던 중인도 신분층으로 정착되어 갔다. 그리하여 지배층인 양반과 피지배층인 상민 간의 차별을 두는 반상 제도가 일반화되고 양반, 중인, 상민, 천민의 신분 제도가 점차 정착되었다.\n" +
"조선 시대는 엄격한 신분제 사회였으나 신분 이동이 가능하였다. 법적으로 양인 이상이면 누구나 과거에 응시하여 관직에 오를 수 있었고, 양반도 죄를 지으면 노비가 되거나 경제적으로 몰락하여 중인이나 상민이 되기도 하였다.\n" +
"[편집]\n" +
"초기 조선의 문화\n" +
"조선 초기에는 괄목할 만한 민족적이면서 실용적인 성격의 학문이 발달하여 다른 시기보다 민족 문화의 발전이 크게 이루어졌다. 당시의 집권층은 민생 안정과 부국강병을 위하여 과학 기술과 실용적 학문을 중시하여, 한글이 창제되고 역사책을 비롯한 각 분야의 서적들이 출반되는 등 민족 문화 발전의 기반이 형성되었다.\n" +
"성리학이 정착, 발달하여 전 사회에 큰 영향을 끼쳤고, 여러 갈래의 학파가 나타났다. 15세기 문화를 주도한 관학파 계열의 관료들과 학자들은 성리학을 지도 이념으로 내세웠으나 성리학 이외의 학문과 사상이라도 좋은 점이 있으면 받아들이는 융통성을 보였다. 불교는 정부에 의하여 정비되면서 위축되었으나 민간에서는 여전히 신앙의 대상으로 자리 잡고 있었다.\n" +
"천문학, 의학 등 과학 기술에 있어서도 큰 발전을 이룩하여 생활에 응용되었고, 농업 기술은 크게 향상되어 농업 생산력을 증대시켰다.\n" +
"예술 분야에서도 민족적 특색이 돋보이는 발전을 나타내었고, 사대부들의 검소하고 소박한 생활이 반영된 그림과 필체 및 자기 공예가 두드러졌다.\n" +
"[편집]\n" +
"근대 태동기 (A.D. 1506년 ~ A.D. 1907년)\n" +
"\n" +
"한국사에서는 후기 조선 시대를 근대 태동기로 보고 있다.\n" +
"[편집]\n" +
"후기 조선의 정치\n" +
"숙종 때에 이르러 붕당 정치가 변질되고 그 폐단이 심화되면서 특정 붕당이 정권을 독점하는 일당 전제화의 추세가 대두되었다. 붕당 정치가 변질되자 정치 집단 간의 세력 균형이 무너지고 왕권 자체도 불안하게 되었다. 이에 영조와 정조는 특정 붕당의 권력 장악을 견제하기 위하여 탕평 정치를 추진하였다. 탕평 정치는 특정 권력 집단을 억제하고 왕권을 강화하려는 방향으로 진행되어 어느 정도 성과를 거두었지만, 붕당 정치의 폐단을 일소하지는 못하였다.\n" +
"탕평 정치로 강화된 왕권을 순조 이후의 왕들이 제대로 행사하지 못하면서 왕실의 외척을 중심으로 한 소수 가문에 권력이 집중되고 정치 기강이 문란해지는 세도 정치가 전개되었다. 이로써 부정부패가 만연해지고 정부의 백성들에 대한 수탈이 심해졌다.\n" +
"[편집]\n" +
"후기 조선의 경제\n" +
"임진왜란과 병자호란을 거치면서 농촌 사회는 심각하게 파괴되었다. 수많은 농민들이 전란 중에 죽거나 피난을 가고 경작지는 황폐화되었다. 이에 정부는 수취 체제를 개편하여 농촌 사회를 안정시키고 재정 기반을 확대하려 하였다. 그것은 전세 제도, 공납 제도, 군역 제도의 개편으로 나타났다.\n" +
"서민들은 생산력을 높이기 위하여 농기구와 시비법을 개량하는 등 새로운 영농 방법을 추구하였고, 상품 작물을 재배하여 소득을 늘리려 하였다. 상인들도 상업 활동에 적극적으로 참여하여 대자본을 가진 상인들도 출현하였다. 수공업 생산도 활발해져 민간에서 생산 활동을 주도하여 갔다. 이러한 과정에서 자본 축적이 이루어지고, 지방의 상공업 활동이 활기를 띠었으며, 상업 도시가 출현하기에 이르렀다.\n" +
"[편집]\n" +
"후기 조선의 사회\n" +
"조선 후기 사회는 사회 경제적 변화로 인하여 신분 변동이 활발해져 양반 중심의 신분 체제가 크게 흔들렸다. 붕당 정치가 날이 갈수록 변질되어 가면서 양반 상호 간에 일어난 정치적 갈등은 양반층의 분화을 불러왔다. 이러한 현상은 일당 전제화가 전개되면서 더욱 두드러지고 권력을 장악한 소수의 양반을 제외한 다수의 양반들이 몰락하는 계기가 되었다. 이렇게 양반 계층의 도태 현상이 날로 심화되어 가면서도 양반의 수는 늘어나고 상민과 노비의 숫자는 줄어드는 경향을 보였다. 이는 부를 축적한 농민들이나 해방된 노비들이 자신들의 지위를 높이기 위하여 또는 역의 부담을 모면하기 위하여 양반 신분을 사는 경우가 많았기 때문이다.\n" +
"이러한 급격한 사회 변화에 대한 집권층의 자세는 극히 보수적이고 임기응변적이었다. 이에 계층 간의 갈등은 더욱 심화되어 갔으며, 19세기에 들어와 평등 사상과 내세 신앙을 주장한 로마 가톨릭이 유포되면서 백성들의 의식이 점차 높아져서[출처 필요] 크고 작은 봉기가 전국적으로 일어나게 되었다. 정부는 로마 가톨릭이 점차 교세가 확장되자 양반 중심의 신분 질서 부정과 왕권에 대한 도전으로 받아들여[출처 필요] 사교로 규정하고 탄압을 가하기에 이르렀다.\n" +
"[편집]\n" +
"후기 조선의 문화\n" +
"임진왜란과 병자호란 이후 사회 각 분야의 변화와 함께 문화에서는 새로운 기운이 나타났다. 양반층 뿐만 아니라 중인층과 서민층도 문화의 한 주역으로 등장하면서 문화의 질적 변화와 함께 문화의 폭이 확대되었다.\n" +
"학문에서는 성리학의 교조화와 형식화를 비판하며 실천성을 강조한 양명학을 받아들였으며 민생 안정과 부국강병을 목표로 하여 비판적이면서 실증적인 논리로 사회 개혁론을 제시한 실학이 대두되어 개혁 추진을 주장하기도 하였다.\n" +
"천문학의 의학 등 각 분야의 기술적 성과들이 농업과 상업 등 산업 발전을 촉진하였다. 서양 문물의 유입도 이러한 발전을 가속화하는 데 이바지하였다.\n" +
"예술 분야에서는 판소리, 탈품, 서민 음악 등 서민 문화가 크게 유행하였고, 백자 등 공예도 생활 공예가 중심이 되었다. 자연 경치와 삶을 소재로 하는 문예 풍토가 진작되어 문학과 서화에 큰 영향을 끼쳤다.\n" +
"[편집]\n" +
"근현대시대 (A.D. 1907년 ~ )\n" +
"\n" +
"[편집]\n" +
"개괄\n" +
"조선 사회는 안에서 성장하고 있던 근대적인 요소를 충분히 발전시키지 못한 채 19C 후반 제국주의 열강에 문호를 개방하였다. 이후 정부와 각계(各界), 각당(各堂), 각단체(各單體), 각층(各層), 각파(各派)에서는 근대화하려는 노력을 하였으나, 성공하지 못하였다.\n" +
"개항 이후 조선은 서구 문물을 수용하고 새로운 경제 정책을 펼치면서 자주적인 근대화를 모색하였다. 그러나 일본과 청을 비롯한 외세의 경제 침략이 본격화 되면서, 이러한 노력은 큰 성과를 거두지 못했다.\n" +
"개항 이후, 사회 개혁이 진행되면서 신분 제도가 폐지되고 평등 의식도 점차 성장하였다. 또, 외국과의 교류를 통해 외래 문물과 제도 등이 수용됨에 따라 전통적인 생활 모습에도 많은 변화가 생겨났다.\n" +
"개항 이후 서양 과학 기술에 대한 관심이 높아지자, 전기, 철도, 같은 근대 기술과 서양 의술 등 각종 근대 문물이 들어왔다. 근대 시설은 일상생활을 편리하게 해 주었으나, 열강의 침략 목적에 이용되기도 하였다.\n" +
"일제는 강압적인 식민 통치를 통하여 우리 민족을 지배하였다. 이에 맞서 우리 민족은 국내외에서 무장 독립 투쟁, 민족 실력 양성 운동, 독립 외교 활동 등을 벌여 일제에 줄기차게 저항하였다. 이러한 우리 민족의 투쟁과 연합군의 승리로 1945년 8월에 광복을 맞이하였다.\n" +
"일제 강점기에는 일제의 경제적 침략으로 경제 발전이 왜곡되어, 우리 민족은 고통을 겪게 되었다. 광복 이후 일제의 식민 지배를 벗어나면서부터는 새로운 경제 발전의 계기를 마련할 수 있었다. 그러나 분단과 전쟁으로 인한 경제적 어려움도 대단히 컸다.\n" +
"일제 강점기에는 국권을 되찾으려는 독립 운동이 줄기차게 일어났고, 다른 한편에서는 근대화를 위한 각계(各界), 각당(各堂), 각단체(各單體), 각층(各層), 각파(各派)에서는 근대화하려는 노력이 펼쳐졌다. 이러한 가운데 근대 자본주의 문명이 본격적으로 유입되어 전통 사회는 점차 근대 사회로 변모해 갔는데, 식민지 현실 아래에서 근대화는 왜곡될 수밖에 없었다.\n" +
"일제는 국권을 탈취한 후에 동화와 차별의 이중 정책을 바탕으로 황국 신민화를 강력하게 추진하였다. 특히, 우리 민족의 독립 의지를 꺾으려고 우리의 역사와 문화를 왜곡하였다. 이에 맞서 우리의 전통과 문화를 지키려는 움직임이 일어났다.\n" +
"그런데, 미∙소의 한반도 분할 정책과 좌∙우익 세력의 갈등으로 남북이 분단되어 통일 국가를 세우지 못하였다. 특히, 6∙25 전쟁을 겪으면서 분단은 더욱 고착화되고 남북 사이의 상호 불신이 깊어 갔다.\n" +
"대한민국 정부 수립 이후, 민주주의가 정착되는 과정에서 많은 시련을 겪었다. 그러나 4∙19혁명과 5∙18민주화 운동, 6월 민주 항쟁 등으로 민주주의가 점차 발전하였다. 이와 함께, 냉전 체제가 해체되면서 민족 통일을 위한 노력도 계속 되고 있다.\n" +
"1960년대 이후 한국 경제는 비약적인 성장을 일구어 냈다. 한국은 이제 가난한 농업 국가가 아닌, 세계적인 경제 대국으로 변모하고 있다.\n" +
"광복 후에 한국은 많은 어려움 속에서도 경제 발전을 이룩하였는데, 이는 커다란 사회 변화를 가져왔다. 농업 사회에서 산업 사회로, 다시 정보화 사회로 발전하면서 사람들의 생활양식과 가치관도 많이 변하였다.1980년대에 진행된 민주화 운동으로 권위주의적 정치 문화가 점차 극복되고, 사회의 민주화도 꾸준히 이루어 졌다.\n" +
"광복 이후에는 학문 활동이 활발해지고 교육의 기회가 크게 확대되었다. 그러나 미국을 비롯한 서구 문화가 급속하게 유입되면서 가치관의 혼란과 전통문화의 위축 현상을 가져오기도 하였다.\n" +
"민주화와 더불어 문화의 다양화가 촉진되고, 반도체 등 몇몇 과학 기술 분야는 세계적인 수준까지 도달하였다. 한편, 현대 사회의 윤리와 생명 과학 기술의 발달 사이에서 빚어지는 갈등을 해소하려는 노력도 펼쳐지고 있다.\n" +
"[편집]\n" +
"근대시대\n" +
"대한 제국\n" +
"일제강점기 : 일본의 제국주의 세력이 한반도를 강제적으로 식민지로 삼은 시기로서, 무단 통치 시기, 문화 통치 시기, 전시 체계 시기로 나뉜다.\n" +
"무단 통치 시기 : 조선을 영구히 통치하기 위해 조선 총독부를 설치하고, 군대를 파견하여 의병 활동을 억누르고 국내의 저항 세력을 무단으로 통치한 시기이다. 언론, 집회, 출판, 결사의 자유같은 기본권을 박탈하고, 독립운동을 무자비하게 탄압하였다. 또, 헌병 경찰과 헌병 보조원을 전국에 배치하고 즉결 처분권을 부여하여 한국인을 태형에 처하기도 했다. 토지조사령을 공포하여 식민지 수탈을 시작하였고, 회사령을 공포하여 국내의 자본 세력을 억압하고 일본 자본 세력의 편의를 봐주었다. 이 시기의 한국인 노동자는 극악한 환경과 저임금, 민족적 차별까지 받으며 혹사 하였다.\n" +
"문화 통치 시기 : 3·1 운동이 발발하자 일제는 무단통치로는 조선을 효과적으로 지배할 수 없다는 판단하에, 친일파를 육성하는 문화정책을 펼친다. 이 문화정치는 가혹한 식민 통치를 은폐하려는 술책에 불과 했다. 헌병 경찰제를 보통 경찰제로 전환하였지만, 경찰력은 오히려 증강되었다. 이 들은 교육의 기회를 늘리고 자본 운용의 기회와 참정권의 기회등을 제공하겠다고 선전 하였으나 소수의 친일 분자를 육성하고, 민족 운동가들을 회유하여 민족을 기만하고 분열을 획책하였다.\n" +
"전시 체계 시기 : 1930년대 일제는 대륙침략을 본격적으로 시작하면서 한반도를 대륙 침략의 병참기지로 삼았다. 또한, 1941년 일제가 미국의 진주만을 불법적으로 기습하자 태평양 전쟁이 발발하였다. 조선에서는 일제의 강제 징용으로 한국인 노동력이 착취 되었고, 학도 지원병 제도, 징병 제도 등을 실시하여 수많은 젊은이를 전쟁에 동원하였다. 또, 젊은 여성을 정신대라는 이름으로 강제 동원하여 군수 공장 등에서 혹사시켰으며, 그 중 일부는 전선으로 끌고 가 일본군 위안부로 삼는 만행을 저질렀다.\n" +
"[편집]\n" +
"현대시대\n" +
"군정기 : 미국과 소련의 군대가 진주하여 한반도에 정부가 세워지기 이전까지의 시기\n" +
"대한민국\n" +
"제1공화국\n" +
"한국전쟁\n" +
"제2공화국\n" +
"제3공화국\n" +
"제4공화국 - 유신헌법시기. 종신 대통령제 채택\n" +
"제5공화국\n" +
"1. 정치 : 전두환 정부(군사 쿠데타에 의한 정부 - 12.12 사태) 시기. 대통령 간접선거제도 채택. 이 시기에는 민주화에 대한 무자비한 탄압이 자행되었으나, 광범위한 대중들의 1987년 6월 혁명으로 6월29선언(대통령 직접선거제도 공약)을 이끌어 내기도 하였다.\n" +
"2. 경제 : 1960~70년대에 닦아온 중공업, 경공업 기반을 첨단공업 수준으로 이끌어 올린 시기이다. 이 시기의 한국 경제는 세계에서 유래 없을 정도로 빠르게 성장했으며, 국내 물가가 가장 안정된 시기였다.\n" +
"3. 문화 : 1986년 서울 아시안 게임을 개최하였고, 1988년 서울 올림픽 게임을 유치하는 데 성공했다.\n" +
"제6공화국\n" +
"노태우 정권\n" +
"문민정부\n" +
"국민의 정부\n" +
"참여정부\n" +
"조선민주주의인민공화국\n" +
"조선민주주의인민공화국의 역사\n" +
"[편집]\n" +
"주석\n" +
"\n" +
"↑ 삼국유사 - 동경제국대학 1904년 판본, 환단고기 - 1979년 복원본\n" +
"↑ 동사 - 허목 숙종조, 규원사화 - 북애자 숙종원년\n" +
"↑ 환단고기 - 1979년 복원본\n" +
"[편집]\n" +
"같이 보기\n" +
"\n" +
"중국의 역사\n" +
"일본의 역사\n" +
"민족사관\n" +
"식민사관\n" +
"[편집]\n" +
"참고문헌 및 링크\n" +
"\n" +
"[편집]\n" +
"역사 일반\n" +
"국사 편찬 위원회 : 한국사에 관한 정보를 수집, 정리, 편찬하는 국가 연구 기관, 소장 자료, 논문, 저서 검색, 한국사 관련 연구 기관. 소장 자료, 논문, 저서 검색, 한국사 관련 안내\n" +
"국사 전자 교과서 : 현직 교사들이 연구.감수하고, 국사편찬위원회가 지원하였다. 2007년 개정된 국사교과서의 내용이 아직 반영되지 않았다.\n" +
"한국 역사 정보 시스템 : 한국사 연표, 한국사 기초 사전 및 신문 자료, 문헌 자료, 문집 등을 제공\n" +
"한국학 중앙 연구원 : 한국 문화 및 한국학 여러 분햐에 관한 연구와 교육을 수행하는 연구 기관. 디지털 한국학 개발, 정보 광장, 전자 도서관, 전통 문화 등 수록\n" +
"역사 문제 연구소 : 순수 민간 연구 단체(역사적 중립성이 의심됨), 근현대사 자료실, 간행물 자료, 한국사 학습 자료 등 수록\n" +
"[편집]\n" +
"재단, 기타, 정부 기관\n" +
"고구려 연구재단 : 고구려사를 비롯한 중국의 역사 왜곡에 학술적으로 대응하기 위하여 2004年 설립된 법인. 고구려, 발해를 비롯한 동아시아 역사 관련 자료의 조사, 수집, 정리, 정보화 자료 제공. 동북아역사재단으로 편입되어 더이상 유용하지 않다.\n" +
"국가 기록 영상관 : 대한 뉴스, 문화 기록 영화, 대통령 기록 영상 등 멀티미디어 역사 자료 제공\n" +
"국가 문화 유산 종합 정보 서비스 : 국보, 보물, 사적, 명승, 천연 기념물 지정 종목별, 시대별, 지역별, 유형별, 유물 정보, 검색 서비스 제공\n" +
"국가 지식 정보 통합 검색 시스템 : 정보 통신부 제공, 과학 기술, 정보 통신, 교육, 학술, 문화, 역사 등의 포괄적이고 연동적인 학술 데이터 검색\n" +
"국가기록유산 : 국가적 기록유산의 원본과 원문 열람 서비스 제공\n";


var persian =
"تاریخ ایران پیش از اسلام\n" +
"از ویکی‌پدیا، دانشنامهٔ آزاد.\n" +
"تمدنهای باستانی آسیای غربی\n" +
"بین‌النهرین، سومر، اکد، آشور، بابل\n" +
"هیتی‌ها، لیدیه\n" +
"ایلام، اورارتو، ماننا، ماد، هخامنشی\n" +
"امپراتوری‌ها / شهرها\n" +
"سومر: اوروک – اور – اریدو\n" +
"کیش – لاگاش – نیپور – اکد\n" +
"بابل – ایسین – کلدانی\n" +
"آشور: آسور، نینوا، نوزی، نمرود\n" +
"ایلامیان – اموری‌ها – شوش\n" +
"هوری‌ها – میتانی\n" +
"کاسی‌ها – اورارتو\n" +
"گاهشماری\n" +
"شاهان سومر\n" +
"شاهان ایلام\n" +
"شاهان آشور\n" +
"شاهان بابل\n" +
"شاهان ماد\n" +
"شاهان هخامنشی\n" +
"زبان\n" +
"خط میخی\n" +
"سومری – اکدی\n" +
"ایلامی – هوری\n" +
"اساطیر بین‌النهرین\n" +
"انوما الیش\n" +
"گیل گمش – مردوخ\n" +
"نیبیرو\n" +
"اگر بخواهیم تاریخ ایران پیش از اسلام را بررسی ‌‌کنیم باید از مردمانی که در دوران نوسنگی در فلات ایران زندگی می‌‌کردند نام ببریم. پیش از مهاجرت آریائیان به فلات ایران، اقوامی با تمدن‌های متفاوت در ایران می‌زیستند که آثار زیادی از آنها در نقاط مختلف فلات ایران مانند تمدن جیرفت (در کرمانِ کنونی) و شهر سوخته در سیستان، و تمدن ساکنان تمدن تپه سیلک (در کاشان)، تمدن اورارتو و ماننا (در آذربایجان)، تپه گیان نهاوند و تمدن کاسی‌ها (در لرستان امروز) بجای مانده است. اما تمدن این اقوام کم کم با ورود آریائیان، در فرهنگ و تمدن آنها حل شد.\n" +
"برای بررسی تاریخ ایران پیش از اسلام باید از دیگر تمدنهای باستانی آسیای غربی نیز نام ببریم. شناخت اوضاع و رابطه این مناطق ایران در رابطه با تمدن‌های دیگر نظیر سومر - اکد، کلده - بابل - آشور، و غیره نیز مهم است.\n" +
"فهرست مندرجات [مخفی شود]\n" +
"۱ ایلامیان\n" +
"۲ مهاجرت آریائیان به ایران\n" +
"۳ مادها\n" +
"۴ هخامنشیان\n" +
"۵ سلوکیان\n" +
"۶ اشکانیان\n" +
"۷ ساسانیان\n" +
"۸ منابع\n" +
"۹ جستارهای وابسته\n" +
"۱۰ پیوند به بیرون\n" +
"[ویرایش]\n" +
"ایلامیان\n" +
"\n" +
"ایلامیان یا عیلامی‌ها اقوامی بودند که از هزاره سوم پ. م. تا هزاره نخست پ. م. ، بر بخش بزرگی از مناطق جنوب و غرب ایران فرمانروایی داشتند. بر حسب تقسیمات جغرافیای سیاسی امروز، ایلام باستان سرزمین‌های خوزستان، فارس، ایلام و بخش‌هایی از استان‌های بوشهر، کرمان، لرستان و کردستان را شامل می‌شد.\n" +
"آثار كشف ‌شده تمدن ایلامیان، در شوش نمایانگر تمدن شهری قابل توجهی است. تمدن ایلامیان از راه شهر سوخته در سیستان، با تمدن پیرامون رود سند هند و از راه شوش با تمدن سومر مربوط می‌شده است. ایلامیان نخستین مخترعان خط در ایران هستند.\n" +
"به قدرت رسیدن حكومت ایلامیان و قدرت یافتن سلسله عیلامی پادشاهی اوان در شمال دشت خوزستان مهم ‌ترین رویداد سیاسی ایران در هزاره سوم پ. م. است. پادشاهی اَوان یکی از دودمان‌های ایلامی باستان در جنوب غربی ایران بود. پادشاهی آوان پس از شکوه و قدرت کوتیک ـ این شوشینک همچون امپراتوری اکد، ناگهان فرو پاشید؛ این فروپاشی و هرج و مرج در منطقه در پی تاخت و تاز گوتیان زاگرس نشین رخ داد. تا پیش از ورود مادها و پارسها حدود یك هزار سال تاریخ سرزمین ایران منحصر به تاریخ عیلام است.\n" +
"سرزمین اصلی عیلام در شمال دشت خوزستان بوده. فرهنگ و تمدن عیلامی از شرق رودخانه دجله تا شهر سوخته زابل و از ارتفاعات زاگرس مركزی تا بوشهر اثر گذار بوده است. عیلامیان نه سامی نژادند و نه آریایی آنان ساكنان اوليه دشت خوزستان هستند.\n" +
"[ویرایش]\n" +
"مهاجرت آریائیان به ایران\n" +
"\n" +
"آریائیان، مردمانی از نژاد هند و اروپایی بودند که در شمال فلات ایران می‌‌زیستند. دلیل اصلی مهاجرت آنها مشخص نیست اما به نظر می‌‌رسد دشوار شدن شرایط آب و هوایی و کمبود چراگاه ها، از دلایل آن باشد. مهاجرت آریائیان به فلات ایران یک مهاجرت تدریجی بوده است که در پایان دوران نوسنگی (7000 سال پیش از میلاد) آغاز شد و تا 4000 پیش از میلاد ادامه داشته است.\n" +
"نخستین آریایی‌هایی که به ایران آمدند شامل کاسی‌ها (کانتوها ـ کاشی‌ها)، لولوبیان و گوتیان بودند. کا‌سی‌ها تمدنی را پایه گذاری کردند که امروزه ما آن را بنام تمدن تپه سیلک می‌‌شناسیم. لولوبیان و گوتیان نیز در زاگرس مرکزی اقامت گزیدند که بعدها با آمدن مادها بخشی از آنها شدند. در حدود 5000 سال پیش از میلاد، مهاجرت بزرگ آریائیان به ایران آغاز شد و سه گروه بزرگ آریایی به ایران آمدند و هر یک در قسمتی از ایران سکنی گزیدند: مادها در شمال غربی ایران، پارس‌ها در قسمت جنوبی و پارت‌ها در حدود خراسان امروزی.\n" +
"شاخه‌های قومِ ایرانی در نیمه‌های هزاره‌ی اول قبل از مسیح عبارت بوده‌اند از: باختریان در باختریه (تاجیکستان و شمالشرق افغانستانِ کنونی)، سکاهای هوم‌کار در سگائیه (شرقِ ازبکستانِ کنونی)، سُغدیان در سغدیه (جنوب ازبکستان کنونی)، خوارزمیان در خوارزمیه (شمال ازبکستان و شمالشرق ترکمنستانِ کنونی)، مرغزیان در مرغوه یا مرو (جنوبغرب ازبکستان و شرق ترکمستان کنونی)، داهه در مرکز ترکمستان کنونی، هَرَیویان در هَرَیوَه یا هرات (غرب افغانستان کنونی)، دِرَنگِیان در درنگیانه یا سیستان (غرب افغانستان کنونی و شرق ایران کنونی)، مکائیان در مکائیه یا مَک‌کُران (بلوچستانِ ایران و پاکستان کنونی)، هیرکانیان در هیرکانیا یا گرگان (جنوبغربِ ترکمنستان کنونی و شمال ایرانِ کنونی)، پَرتُوَه‌ئیان در پارتیه (شمالشرق ایران کنونی)، تپوریان در تپوریه یا تپورستان (گیلان و مازندران کنونی)، آریازَنتا در اسپدانه در مرکزِ ایرانِ کنونی، سکاهای تیزخود در الانیه یا اران (آذربایجان مستقل کنونی)، آترپاتیگان در آذربایجان ایرانِ کنونی، مادایَه در ماد (غرب ایرانِ کنونی)، کُردوخ در کردستانِ (چهارپاره‌شده‌ی) کنونی، پارسَی در پارس و کرمانِ کنونی، انشان در لرستان و شمال خوزستان کنونی. قبایلی که در تاریخ با نامهای مانناها، لولوبیان‌ها، گوتیان‌ها، و کاسی‌ها شناسانده شده‌اند و در مناطق غربی ایران ساکن بوده‌اند تیره‌هائی از شاخه‌های قوم ایرانی بوده‌اند که زمانی برای خودشان اتحادیه‌های قبایلی و امیرنشین داشته‌اند، و سپس در پادشاهی ماد ادغام شده‌اند.\n" +
"مادها در ایران نزدیک 150 سال (708- 550 ق.م) هخامنشی‌ها کمی بیش از دویست سال (550-330 ق.م) اسکندر و سلوکی‌ها در حدود صد سال (330 -250 ق.م) اشکانیان قریب پانصد سال (250 ق.م – 226 م) و ساسانیان قریب چهار صد و سی سال (226-651 م) فرمانروایی داشتند.\n" +
"[ویرایش]\n" +
"مادها\n" +
"\n" +
"\n" +
"\n" +
"ماد در 675 پیش از میلاد\n" +
"\n" +
"\n" +
"ماد در 600 پیش از میلاد\n" +
"مادها قومی ایرانی بودند از تبار آریایی که در بخش غربی فلات ایران ساکن شدند. سرزمین مادها دربرگیرنده بخش غربی فلات ایران بود. سرزمین آذربایجان در شمال غربی فلات ایران را با نام ماد کوچک و بقیهٔ ناحیه زاگرس را با نام ماد بزرگ می‌شناختند. پایتخت ماد هگمتانه است آنها توانستند در اوایل قرن هفتم قبل از میلاد اولین دولت ایرانی را تأسیس کنند\n" +
"پس از حملات شدید و خونین آشوریان به مناطق مادنشین، گروهی از بزرگان ماد گرد رهبری به نام دیاکو جمع شدند.\n" +
"از پادشاهان بزرگ این دودمان هووخشتره بود که با دولت بابل متحد شد و سرانجام امپراتوری آشور را منقرض کرد و پایه‌های نخستین شاهنشاهی آریایی‌تباران در ایران را بنیاد نهاد.\n" +
"دولت ماد در ۵۵۰ پیش از میلاد به دست کوروش منقرض شد و سلطنت ایران به پارسی‌ها منتقل گشت. در زمان داریوش بزرگ، امپراتوری هخامنشی به منتهای بزرگی خود رسید: از هند تا دریای آدریاتیک و از دریای عمان تا کوه‌های قفقاز.\n" +
"[ویرایش]\n" +
"هخامنشیان\n" +
"\n" +
"\n" +
"\n" +
"شاهنشاهی بزرگ هخامنشی در 330 ق.م.\n" +
"هخامنشیان نخست پادشاهان بومی پارس و سپس انشان بودند ولی با شکستی که کوروش بزرگ بزرگ بر ایشتوویگو واپسین پادشاه ماد وارد ساخت و سپس فتح لیدیه و بابل پادشاهی هخامنشیان تبدیل به شاهنشاهی بزرگی شد. از این رو کوروش بزرگ را بنیادگذار شاهنشاهی هخامنشی می‌دانند.\n" +
"در ۵۲۹ پ.م کوروش بزرگ پایه گذار دولت هخامنشی در جنگ‌های شمال شرقی ایران با سکاها، کشته شد. لشکرکشی کمبوجیه جانشین او به مصر آخرین رمق کشاورزان و مردم مغلوب را کشید و زمینه را برای شورشی همگانی فراهم کرد. داریوش بزرگ در کتیبهً بیستون می‌‌گوید: \" بعد از رفتن او (کمبوجیه) به مصر مردم از او برگشتند...\"\n" +
"شورش‌ها بزرگ شد و حتی پارس زادگاه شاهان هخامنشی را نیز در برگرفت. داریوش در کتیبه بیستون شمه‌ای از این قیام‌ها را در بند دوم چنین نقل می‌کند: \" زمانی که من در بابل بودم این ایالات از من برگشتند: پارس، خوزستان، ماد، آشور، مصر، پارت خراسان (مرو، گوش) افغانستان (مکائیه).\" داریوش از 9 مهر ماه 522 تا 19 اسفند 520 ق.م به سرکوبی این جنبش‌ها مشغول بود.\n" +
"جنگ‌های ایران و یونان در زمان داریوش آغاز شد. دولت هخامنشی سر انجام در 330 ق. م به دست اسکندر مقدونی منقرض گشت و ایران به دست سپاهیان او افتاد.\n" +
"اسکندر سلسله هخامنشیان را نابود کرد، دارا را کشت ولی در حرکت خود به شرق همه جا به مقاومت‌های سخت برخورد، از جمله سغد و باکتریا یکی از سرداران جنگی او بنام سپتامان 327- 329 ق. م در راس جنبش همگانی مردم بیش از دو سال علیه مهاجم خارجی مبارزه دلاورانه کرد. در این ناحیه مکرر مردم علیه ساتراپهای اسکندر قیام کردند. گرچه سرانجام نیروهای مجهز و ورزیده اسکندر این جنبش‌ها را سرکوب کردند ولی از این تاریخ اسکندر ناچار روش خشونت آمیز خود را به نرمش و خوشخویی بدل کرد.\n" +
"\n" +
"ایران\n" +
"تاریخ ایران\n" +
"ایران پیش از آریایی‌ها	\n" +
"تاریخ ایران پیش از اسلام	\n" +
"    | دودمان‌ها و حکومت‌ها\n" +
"ایلامیان\n" +
"ماد\n" +
"هخامنشیان\n" +
"سلوکیان\n" +
"اشکانیان\n" +
"ساسانیان\n" +
"تاریخ ایران پس از اسلام	\n" +
"    | دودمان‌ها و حکومت‌ها\n" +
"خلفای راشدین\n" +
"امویان\n" +
"عباسیان\n" +
"ایران در دوران حکومت‌های محلی	\n" +
"    | دودمان‌ها و حکومت‌ها\n" +
"طاهریان\n" +
"صفاریان\n" +
"سامانیان\n" +
"آل زیار\n" +
"آل بویه\n" +
"غزنویان\n" +
"سلجوقیان\n" +
"خوارزمشاهیان\n" +
"ایران در دوره مغول	\n" +
"    | دودمان‌ها و حکومت‌ها\n" +
"ایلخانیان\n" +
"ایران در دوران ملوک‌الطوایفی	\n" +
"    | دودمان‌ها و حکومت‌ها\n" +
"سربداران\n" +
"تیموریان\n" +
"مرعشیان\n" +
"کیائیان\n" +
"قراقویونلو\n" +
"آق‌قویونلو\n" +
"ایران در دوران حکومت‌های ملی	\n" +
"    | دودمان‌ها و حکومت‌ها\n" +
"صفوی\n" +
"افشاریان\n" +
"زند\n" +
"قاجار\n" +
"پهلوی\n" +
"جمهوری اسلامی\n" +
"موضوعی\n" +
"تاریخ معاصر ایران\n" +
"تاریخ مذاهب ایران\n" +
"مهرپرستی\n" +
"زرتشتی\n" +
"تسنن\n" +
"تصوف\n" +
"تشیع\n" +
"تاریخ اسلام\n" +
"تاریخ زبان و ادبیات ایران\n" +
"جغرافیای ایران\n" +
"استان‌های تاریخی ایران\n" +
"اقتصاد ایران\n" +
"گاهشمار تاریخ ایران\n" +
"پروژه ایران\n" +
"[ویرایش]\n" +
"سلوکیان\n" +
"\n" +
"\n" +
"ایران در زمان سلوکیان (330 - 150 ق.م.)\n" +
"پس از مرگ اسکندر (323 ق. م) فتوحاتش بین سردارانش تقسیم شد و بیشتر متصرفات آسیائی او که ایران هسته آن بود به سلوکوس اول رسید. به این ترتیب ایران تحت حکومت سلوکیان (330 - 150 ق.م.) در آمد. پس از مدتی پارت‌ها نفوذ خود را گسترش دادند و سرانجام توانستند سلوکیان را نابود و امپراتوری اشکانی را ایجاد کنند.\n" +
"[ویرایش]\n" +
"اشکانیان\n" +
"\n" +
"\n" +
"\n" +
"امپراتوری اشکانی 250 ق.م. 224 م.\n" +
"اشکانیان (250 ق. م 224 م) که از تیره ایرانی پرنی و شاخه‌ای از طوایف وابسته به اتحادیه داهه از عشایر سکاهای حدود باختر بودند، از ایالت پارت که مشتمل بر خراسان فعلی بود برخاستند. نام سرزمین پارت در کتیبه‌های داریوش پرثوه آمده است که به زبان پارتی پهلوه می‌شود. چون پارتیان از اهل ایالت پهله بودند، از این جهت در نسبت به آن سرزمین ایشان را پهلوی نیز می‌‌توان خواند. ایالت پارتیها از مغرب به دامغان و سواحل جنوب شرقی دریای خزر و از شمال به ترکستان و از مشرق به رود تجن و از جنوب به کویر نمک و سیستان محدود می‌‌شد. قبایل پارتی در آغاز با قوم داهه که در مشرق دریای خزر می‌‌زیستند در یک جا سکونت داشتند و سپس از آنان جدا شده در ناحیه خراسان مسکن گزیدند.\n" +
"این امپراتوری در دوره اقتدارش از رود فرات تا هندوکش و از کوه‌های قفقاز تا خلیج فارس توسعه یافت. در عهد اشکانی جنگ‌های ایران و روم آغاز شد. سلسله اشکانی در اثر اختلافات داخلی و جنگ‌های خارجی به تدریج ضعیف شد تا سر انجام به دست اردشیر اول ساسانی منقرض گردید.\n" +
"[ویرایش]\n" +
"ساسانیان\n" +
"\n" +
"\n" +
"\n" +
"شاهنشاهی ساسانی در سالهای ۲۲۴ تا ۶۵۱ م.\n" +
"ساسانیان خاندان شاهنشاهی ایرانی در سالهای ۲۲۴ تا ۶۵۱ میلادی بودند. شاهنشاهان ساسانی که اصلیتشان از استان پارس بود بر بخش بزرگی از غرب قارهٔ آسیا چیرگی یافتند. پایتخت ساسانیان شهر تیسفون در نزدیکی بغداد در عراق امروزی بود.\n" +
"سلسله اشکانی به دست اردشیر اول ساسانی منقرض گردید. وی سلسله ساسانیان را بنا نهاد که تا 652 میلادی در ایران ادامه یافت. دولت ساسانی حکومتی ملی و متکی به دین و تمدن ایرانی بود و قدرت بسیار زیادی کسب کرد. در این دوره نیز جنگ‌های ایران و روم ادامه یافت.\n" +
"\n" +
"در همين دوران مانی[1] (216 - 276 میلادی) به تبلیغ مذهب خود پرداخت. مانی پس از مسافرت به هند و آشنائی با مذهب بودائی سیستم جهان مذهبی مانوی خود را که التقاطی از مذهب زردشتی، بودائی و مسیحی و اسطوره بود با دقت تنظیم کرد و در کتاب \"شاهپورگان\" اصول آن‌ها را بیان و هنگام تاجگذاری شاپوراول به شاه هدیه کرد. مانی اصول اخلاقی خود را بر پایه فلسفی مثنویت: روشنائی و تاریکی که ازلی و ابدی هستند استوار نمود. در واقع این اصول) خودداری از قتل نفس حتی در مورد حیوانات، نخوردن می، دوری از زن و جمع نکردن مال (واکنش در مقابل زندگی پر تجمل و پر از لذت طبقات حاکم و عکس العمل منفی در برابر بحران اجتماعی پایان حکومت اشکانی و آغاز حکومت ساسانی است. شاپور و هرمزد، نشر چنین مذهبی را تجویز کردند، زیرا با وجود مخالفت آن با شهوت پرستی و غارتگری و سود جوئی طبقات حاکم، از جانبی مردم را به راه \"معنویت\" و \"آشتی‌خواهی\" سوق می‌‌داد و از جانب دیگر از قدرت مذهب زردشت می‌‌کاست.\n" +
"جنبش معنوی مانی به سرعت در جهان آن روز گسترش یافت و تبدیل به نیروئی شد که با وجود جنبه منفی آن با هدف‌های شاهان و نجبا و پیشرفت جامعه آن روزی وفق نمی‌داد. پیشوایان زردتشتی و عیسوی که با هم دائما در نبرد بودند، متحد شدند و در دوران شاهی بهرام اول که شاهی تن آسا و شهوت پرست بود در جریان محاکمه او را محکوم و مقتول نمودند ( 276 میلادی). از آن پس مانی کشی آغاز شد و مغان مردم بسیاری را به نام زندک(زندیق) کشتند. مانویان درد و جانب شرق و غرب، در آسیای میانه تا سرحد چین و در غرب تا روم پراکنده شدند.\n" +
"\n" +
"امپراتوری پهناور ساسانی که از رود سند تا دریای سرخ وسعت داشت، در اثر مشکلات خارجی و داخلی ضعیف شد. آخرین پادشاه این سلسله یزدگرد سوم بود. در دوره او مسلمانان عرب به ایران حمله کردند و ایرانیان را در جنگ‌های قادسیه، مدائن، جلولاء و نهاوند شکست دادند و بدین ترتیب دولت ساسانی از میان رفت.\n" +
"در پایان سده پنجم و آغاز قرن ششم میلادی جنبش بزرگی جامعه ایران را تکان داد که به صورت قیامی واقعی سی سال ( 24-494 م.) دوام آورد و تأثیر شگرفی در تکامل جامعه آن روزایران بخشید.\n" +
"در چنین اوضاعی مزدک[2] پسر بامدادان به تبلیغ مذهب خود که گویند موسسش زردشت خورک بابوندس بوده، پرداخت. عقاید مزدک بر دو گانگی مانوی استوار است:\n" +
"روشنائی دانا و تاریکی نادان، به عبارت دیگر نیکی با عقل و بدی جاهل، این دو نیرو با هم در نبردند و چون روشنائی داناست سرانجام پیروز خواهد شد.\n" +
"اساس تعلیمات اجتماعی مزدک دو چیز است: یکی برابری و دیگری دادگری.\n" +
"مردم بسیاری به سرعت پیرو مذهب مزدک شدند. جنبش مزدکی با قتل او و پیروانش به طرز وحشیانه‌ای سرکوب شد، اما افکار او اثر خود را حتی در قیام‌ها و جنبش‌های مردم ایران در دوران اسلام، باقی گذاشت.\n" +
"[ویرایش]\n" +
"منابع\n" +
"\n" +
"تاریخ ایران - دکتر خنجی\n" +
"تاریخ اجتماعی ایران. مرتضی راوندی. ( جلد ۱ ) 1354\n" +
"تاریخ ماد. ایگور میخائیلوویچ دیاکونوف. ترجمه کریم کشاورز، تهران: نشر امیرکبیر.\n" +
"تاريخ ايران باستان. دياكونوف، ميخائيل ميخائيلوويچ. روحی ارباب. انتشارات علمی و فرهنگی، چاپ دوم 1380\n" +
"سهم ایرانیان در پیدایش و آفرینش خط در جهان ،دکتر رکن الدین همایونفرخ، انتشارات اساطیر.\n" +
"کمرون، جرج. ایران در سپیده دم تاریخ. ترجمه حسن انوشه. تهران، مرکز نشر دانشگاهی، 1379\n" +
"تاریخ ایران از زمان باستان تا امروز، ا. آ. گرانتوسكی - م. آ. داندامایو، مترجم، كیخسرو كشاورزی، ناشر: مرواريد 1385\n" +
"تاریخ ایران از عهد باستان تا قرن 18، پیگولووسکایا، ترجمه کریم کشاورز، تهران، 1353.\n" +
"[ویرایش]\n" +
"جستارهای وابسته\n" +
"\n" +
"ماد\n" +
"کاسی\n" +
"ایلامیان\n" +
"تپه هگمتانه\n" +
"تاریخ ایران\n" +
"ایران پیش از آریایی‌ها\n" +
"تمدنهای باستانی آسیای غربی\n" +
"[ویرایش]\n" +
"پیوند به بیرون\n" +
"\n" +
"ایران قبل از آریاها\n" +
"ايران پيش از آريایی‌ها\n" +
"تمدنهای قبل از آریایی ایران\n" +
"ایران ازدیدگاه باستانشناسی\n" +
"سنگ‌نبشته‌ی داریوش بزرگ در بیستون\n" +
"شیوه آسیائی تولید در ایران\n" +
"نیای اساطیری ایرانیان\n" +
"قیام‌های ایرانیان در طول تاریخ\n" +
"خلاصهٔ تاریخ ایران\n" +
"شهر، شهرسازی و شهرنشينی در ايران پيش از اسلام\n" +
"\n" +
"[3]\n" +
"[4]\n" +
"[5]\n" +
"[6]\n" +
"[7]\n" +
"\n" +
"\n" +
"\n" +
" این نوشتار خُرد است. با گسترش آن به ویکی‌پدیا کمک کنید.\n" +
"\n" +
"این مقاله نیازمند ویکی‌سازی است. لطفاً با توجه به راهنمای ویرایش و شیوه‌نامه آن را تغییر دهید. در پایان، پس از ویکی‌سازی این الگوی پیامی را بردارید.\n";


var source =
("/*\n" +
"  This is a version (aka dlmalloc) of malloc/free/realloc written by\n" +
"  Doug Lea and released to the public domain.  Use, modify, and\n" +
"  redistribute this code without permission or acknowledgement in any\n" +
"  way you wish.  Send questions, comments, complaints, performance\n" +
"  data, etc to dl@cs.oswego.edu\n" +
"\n" +
"* VERSION 2.7.2 Sat Aug 17 09:07:30 2002  Doug Lea  (dl at gee)\n" +
"\n" +
"   Note: There may be an updated version of this malloc obtainable at\n" +
"           ftp://gee.cs.oswego.edu/pub/misc/malloc.c\n" +
"         Check before installing!\n" +
"\n" +
"* Quickstart\n" +
"\n" +
"  This library is all in one file to simplify the most common usage:\n" +
"  ftp it, compile it (-O), and link it into another program. All\n" +
"  of the compile-time options default to reasonable values for use on\n" +
"  most unix platforms. Compile -DWIN32 for reasonable defaults on windows.\n" +
"  You might later want to step through various compile-time and dynamic\n" +
"  tuning options.\n" +
"\n" +
"  For convenience, an include file for code using this malloc is at:\n" +
"     ftp://gee.cs.oswego.edu/pub/misc/malloc-2.7.1.h\n" +
"  You don't really need this .h file unless you call functions not\n" +
"  defined in your system include files.  The .h file contains only the\n" +
"  excerpts from this file needed for using this malloc on ANSI C/C++\n" +
"  systems, so long as you haven't changed compile-time options about\n" +
"  naming and tuning parameters.  If you do, then you can create your\n" +
"  own malloc.h that does include all settings by cutting at the point\n" +
"  indicated below.\n" +
"\n" +
"* Why use this malloc?\n" +
"\n" +
"  This is not the fastest, most space-conserving, most portable, or\n" +
"  most tunable malloc ever written. However it is among the fastest\n" +
"  while also being among the most space-conserving, portable and tunable.\n" +
"  Consistent balance across these factors results in a good general-purpose\n" +
"  allocator for malloc-intensive programs.\n" +
"\n" +
"  The main properties of the algorithms are:\n" +
"  * For large (>= 512 bytes) requests, it is a pure best-fit allocator,\n" +
"    with ties normally decided via FIFO (i.e. least recently used).\n" +
"  * For small (<= 64 bytes by default) requests, it is a caching\n" +
"    allocator, that maintains pools of quickly recycled chunks.\n" +
"  * In between, and for combinations of large and small requests, it does\n" +
"    the best it can trying to meet both goals at once.\n" +
"  * For very large requests (>= 128KB by default), it relies on system\n" +
"    memory mapping facilities, if supported.\n" +
"\n" +
"  For a longer but slightly out of date high-level description, see\n" +
"     http://gee.cs.oswego.edu/dl/html/malloc.html\n" +
"\n" +
"  You may already by default be using a C library containing a malloc\n" +
"  that is  based on some version of this malloc (for example in\n" +
"  linux). You might still want to use the one in this file in order to\n" +
"  customize settings or to avoid overheads associated with library\n" +
"  versions.\n" +
"\n" +
"* Contents, described in more detail in \"description of public routines\" below.\n" +
"\n" +
"  Standard (ANSI/SVID/...)  functions:\n" +
"    malloc(size_t n);\n" +
"    calloc(size_t n_elements, size_t element_size);\n" +
"    free(Void_t* p);\n" +
"    realloc(Void_t* p, size_t n);\n" +
"    memalign(size_t alignment, size_t n);\n" +
"    valloc(size_t n);\n" +
"    mallinfo()\n" +
"    mallopt(int parameter_number, int parameter_value)\n" +
"\n" +
"  Additional functions:\n" +
"    independent_calloc(size_t n_elements, size_t size, Void_t* chunks[]);\n" +
"    independent_comalloc(size_t n_elements, size_t sizes[], Void_t* chunks[]);\n" +
"    pvalloc(size_t n);\n" +
"    cfree(Void_t* p);\n" +
"    malloc_trim(size_t pad);\n" +
"    malloc_usable_size(Void_t* p);\n" +
"    malloc_stats();\n" +
"\n" +
"* Vital statistics:\n" +
"\n" +
"  Supported pointer representation:       4 or 8 bytes\n" +
"  Supported size_t  representation:       4 or 8 bytes\n" +
"       Note that size_t is allowed to be 4 bytes even if pointers are 8.\n" +
"       You can adjust this by defining INTERNAL_SIZE_T\n" +
"\n" +
"  Alignment:                              2 * sizeof(size_t) (default)\n" +
"       (i.e., 8 byte alignment with 4byte size_t). This suffices for\n" +
"       nearly all current machines and C compilers. However, you can\n" +
"       define MALLOC_ALIGNMENT to be wider than this if necessary.\n" +
"\n" +
"  Minimum overhead per allocated chunk:   4 or 8 bytes\n" +
"       Each malloced chunk has a hidden word of overhead holding size\n" +
"       and status information.\n" +
"\n" +
"  Minimum allocated size: 4-byte ptrs:  16 bytes    (including 4 overhead)\n" +
"                          8-byte ptrs:  24/32 bytes (including, 4/8 overhead)\n" +
"\n" +
"       When a chunk is freed, 12 (for 4byte ptrs) or 20 (for 8 byte\n" +
"       ptrs but 4 byte size) or 24 (for 8/8) additional bytes are\n" +
"       needed; 4 (8) for a trailing size field and 8 (16) bytes for\n" +
"       free list pointers. Thus, the minimum allocatable size is\n" +
"       16/24/32 bytes.\n" +
"\n" +
"       Even a request for zero bytes (i.e., malloc(0)) returns a\n" +
"       pointer to something of the minimum allocatable size.\n" +
"\n" +
"       The maximum overhead wastage (i.e., number of extra bytes\n" +
"       allocated than were requested in malloc) is less than or equal\n" +
"       to the minimum size, except for requests >= mmap_threshold that\n" +
"       are serviced via mmap(), where the worst case wastage is 2 *\n" +
"       sizeof(size_t) bytes plus the remainder from a system page (the\n" +
"       minimal mmap unit); typically 4096 or 8192 bytes.\n" +
"\n" +
"  Maximum allocated size:  4-byte size_t: 2^32 minus about two pages\n" +
"                           8-byte size_t: 2^64 minus about two pages\n" +
"\n" +
"       It is assumed that (possibly signed) size_t values suffice to\n" +
"       represent chunk sizes. `Possibly signed' is due to the fact\n" +
"       that `size_t' may be defined on a system as either a signed or\n" +
"       an unsigned type. The ISO C standard says that it must be\n" +
"       unsigned, but a few systems are known not to adhere to this.\n" +
"       Additionally, even when size_t is unsigned, sbrk (which is by\n" +
"       default used to obtain memory from system) accepts signed\n" +
"       arguments, and may not be able to handle size_t-wide arguments\n" +
"       with negative sign bit.  Generally, values that would\n" +
"       appear as negative after accounting for overhead and alignment\n" +
"       are supported only via mmap(), which does not have this\n" +
"       limitation.\n" +
"\n" +
"       Requests for sizes outside the allowed range will perform an optional\n" +
"       failure action and then return null. (Requests may also\n" +
"       also fail because a system is out of memory.)\n" +
"\n" +
"  Thread-safety: NOT thread-safe unless USE_MALLOC_LOCK defined\n" +
"\n" +
"       When USE_MALLOC_LOCK is defined, wrappers are created to\n" +
"       surround every public call with either a pthread mutex or\n" +
"       a win32 spinlock (depending on WIN32). This is not\n" +
"       especially fast, and can be a major bottleneck.\n" +
"       It is designed only to provide minimal protection\n" +
"       in concurrent environments, and to provide a basis for\n" +
"       extensions.  If you are using malloc in a concurrent program,\n" +
"       you would be far better off obtaining ptmalloc, which is\n" +
"       derived from a version of this malloc, and is well-tuned for\n" +
"       concurrent programs. (See http://www.malloc.de) Note that\n" +
"       even when USE_MALLOC_LOCK is defined, you can can guarantee\n" +
"       full thread-safety only if no threads acquire memory through\n" +
"       direct calls to MORECORE or other system-level allocators.\n" +
"\n" +
"  Compliance: I believe it is compliant with the 1997 Single Unix Specification\n" +
"       (See http://www.opennc.org). Also SVID/XPG, ANSI C, and probably\n" +
"       others as well.\n" +
"\n" +
"* Synopsis of compile-time options:\n" +
"\n" +
"    People have reported using previous versions of this malloc on all\n" +
"    versions of Unix, sometimes by tweaking some of the defines\n" +
"    below. It has been tested most extensively on Solaris and\n" +
"    Linux. It is also reported to work on WIN32 platforms.\n" +
"    People also report using it in stand-alone embedded systems.\n" +
"\n" +
"    The implementation is in straight, hand-tuned ANSI C.  It is not\n" +
"    at all modular. (Sorry!)  It uses a lot of macros.  To be at all\n" +
"    usable, this code should be compiled using an optimizing compiler\n" +
"    (for example gcc -O3) that can simplify expressions and control\n" +
"    paths. (FAQ: some macros import variables as arguments rather than\n" +
"    declare locals because people reported that some debuggers\n" +
"    otherwise get confused.)\n" +
"\n" +
"    OPTION                     DEFAULT VALUE\n" +
"\n" +
"    Compilation Environment options:\n" +
"\n" +
"    __STD_C                    derived from C compiler defines\n" +
"    WIN32                      NOT defined\n" +
"    HAVE_MEMCPY                defined\n" +
"    USE_MEMCPY                 1 if HAVE_MEMCPY is defined\n" +
"    HAVE_MMAP                  defined as 1\n" +
"    MMAP_CLEARS                1\n" +
"    HAVE_MREMAP                0 unless linux defined\n" +
"    malloc_getpagesize         derived from system #includes, or 4096 if not\n" +
"    HAVE_USR_INCLUDE_MALLOC_H  NOT defined\n" +
"    LACKS_UNISTD_H             NOT defined unless WIN32\n" +
"    LACKS_SYS_PARAM_H          NOT defined unless WIN32\n" +
"    LACKS_SYS_MMAN_H           NOT defined unless WIN32\n" +
"    LACKS_FCNTL_H              NOT defined\n" +
"\n" +
"    Changing default word sizes:\n" +
"\n" +
"    INTERNAL_SIZE_T            size_t\n" +
"    MALLOC_ALIGNMENT           2 * sizeof(INTERNAL_SIZE_T)\n" +
"    PTR_UINT                   unsigned long\n" +
"    CHUNK_SIZE_T               unsigned long\n" +
"\n" +
"    Configuration and functionality options:\n" +
"\n" +
"    USE_DL_PREFIX              NOT defined\n" +
"    USE_PUBLIC_MALLOC_WRAPPERS NOT defined\n" +
"    USE_MALLOC_LOCK            NOT defined\n" +
"    DEBUG                      NOT defined\n" +
"    REALLOC_ZERO_BYTES_FREES   NOT defined\n" +
"    MALLOC_FAILURE_ACTION      errno = ENOMEM, if __STD_C defined, else no-op\n" +
"    TRIM_FASTBINS              0\n" +
"    FIRST_SORTED_BIN_SIZE      512\n" +
"\n" +
"    Options for customizing MORECORE:\n" +
"\n" +
"    MORECORE                   sbrk\n" +
"    MORECORE_CONTIGUOUS        1\n" +
"    MORECORE_CANNOT_TRIM       NOT defined\n" +
"    MMAP_AS_MORECORE_SIZE      (1024 * 1024)\n" +
"\n" +
"    Tuning options that are also dynamically changeable via mallopt:\n" +
"\n" +
"    DEFAULT_MXFAST             64\n" +
"    DEFAULT_TRIM_THRESHOLD     256 * 1024\n" +
"    DEFAULT_TOP_PAD            0\n" +
"    DEFAULT_MMAP_THRESHOLD     256 * 1024\n" +
"    DEFAULT_MMAP_MAX           65536\n" +
"\n" +
"    There are several other #defined constants and macros that you\n" +
"    probably don't want to touch unless you are extending or adapting malloc.\n" +
"*/\n" +
"\n" +
"#define MORECORE_CONTIGUOUS 0\n" +
"#define MORECORE_CANNOT_TRIM 1\n" +
"#define MALLOC_FAILURE_ACTION abort()\n" +
"\n" +
"\n" +
"namespace khtml {\n" +
"\n" +
"#ifndef NDEBUG\n" +
"\n" +
"// In debugging builds, use the system malloc for its debugging features.\n" +
"\n" +
"void *main_thread_malloc(size_t n)\n" +
"{\n" +
"    assert(pthread_main_np());\n" +
"    return malloc(n);\n" +
"}\n" +
"\n" +
"void *main_thread_calloc(size_t n_elements, size_t element_size)\n" +
"{\n" +
"    assert(pthread_main_np());\n" +
"    return calloc(n_elements, element_size);\n" +
"}\n" +
"\n" +
"void main_thread_free(void* p)\n" +
"{\n" +
"    // it's ok to main_thread_free on a non-main thread - the actual\n" +
"    // free will be scheduled on the main thread in that case.\n" +
"    free(p);\n" +
"}\n" +
"\n" +
"void *main_thread_realloc(void* p, size_t n)\n" +
"{\n" +
"    assert(pthread_main_np());\n" +
"    return realloc(p, n);\n" +
"}\n" +
"\n" +
"#else\n" +
"\n" +
"/*\n" +
"  WIN32 sets up defaults for MS environment and compilers.\n" +
"  Otherwise defaults are for unix.\n" +
"*/\n" +
"\n" +
"/* #define WIN32 */\n" +
"\n" +
"#ifdef WIN32\n" +
"\n" +
"#define WIN32_LEAN_AND_MEAN\n" +
"#include <windows.h>\n" +
"\n" +
"/* Win32 doesn't supply or need the following headers */\n" +
"#define LACKS_UNISTD_H\n" +
"#define LACKS_SYS_PARAM_H\n" +
"#define LACKS_SYS_MMAN_H\n" +
"\n" +
"/* Use the supplied emulation of sbrk */\n" +
"#define MORECORE sbrk\n" +
"#define MORECORE_CONTIGUOUS 1\n" +
"#define MORECORE_FAILURE    ((void*)(-1))\n" +
"\n" +
"/* Use the supplied emulation of mmap and munmap */\n" +
"#define HAVE_MMAP 1\n" +
"#define MUNMAP_FAILURE  (-1)\n" +
"#define MMAP_CLEARS 1\n" +
"\n" +
"/* These values don't really matter in windows mmap emulation */\n" +
"#define MAP_PRIVATE 1\n" +
"#define MAP_ANONYMOUS 2\n" +
"#define PROT_READ 1\n" +
"#define PROT_WRITE 2\n" +
"\n" +
"/* Emulation functions defined at the end of this file */\n" +
"\n" +
"/* If USE_MALLOC_LOCK, use supplied critical-section-based lock functions */\n" +
"#ifdef USE_MALLOC_LOCK\n") +
("static int slwait(int *sl);\n" +
"static int slrelease(int *sl);\n" +
"#endif\n" +
"\n" +
"static long getpagesize(void);\n" +
"static long getregionsize(void);\n" +
"static void *sbrk(long size);\n" +
"static void *mmap(void *ptr, long size, long prot, long type, long handle, long arg);\n" +
"static long munmap(void *ptr, long size);\n" +
"\n" +
"static void vminfo (unsigned long*free, unsigned long*reserved, unsigned long*committed);\n" +
"static int cpuinfo (int whole, unsigned long*kernel, unsigned long*user);\n" +
"\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  __STD_C should be nonzero if using ANSI-standard C compiler, a C++\n" +
"  compiler, or a C compiler sufficiently close to ANSI to get away\n" +
"  with it.\n" +
"*/\n" +
"\n" +
"#ifndef __STD_C\n" +
"#if defined(__STDC__) || defined(_cplusplus)\n" +
"#define __STD_C     1\n" +
"#else\n" +
"#define __STD_C     0\n" +
"#endif\n" +
"#endif /*__STD_C*/\n" +
"\n" +
"\n" +
"/*\n" +
"  Void_t* is the pointer type that malloc should say it returns\n" +
"*/\n" +
"\n" +
"#ifndef Void_t\n" +
"#if (__STD_C || defined(WIN32))\n" +
"#define Void_t      void\n" +
"#else\n" +
"#define Void_t      char\n" +
"#endif\n" +
"#endif /*Void_t*/\n" +
"\n" +
"#if __STD_C\n" +
"#include <stddef.h>   /* for size_t */\n" +
"#else\n" +
"#include <sys/types.h>\n" +
"#endif\n" +
"\n" +
"/* define LACKS_UNISTD_H if your system does not have a <unistd.h>. */\n" +
"\n" +
"/* #define  LACKS_UNISTD_H */\n" +
"\n" +
"#ifndef LACKS_UNISTD_H\n" +
"#include <unistd.h>\n" +
"#endif\n" +
"\n" +
"/* define LACKS_SYS_PARAM_H if your system does not have a <sys/param.h>. */\n" +
"\n" +
"/* #define  LACKS_SYS_PARAM_H */\n" +
"\n" +
"\n" +
"#include <stdio.h>    /* needed for malloc_stats */\n" +
"#include <errno.h>    /* needed for optional MALLOC_FAILURE_ACTION */\n" +
"\n" +
"\n" +
"/*\n" +
"  Debugging:\n" +
"\n" +
"  Because freed chunks may be overwritten with bookkeeping fields, this\n" +
"  malloc will often die when freed memory is overwritten by user\n" +
"  programs.  This can be very effective (albeit in an annoying way)\n" +
"  in helping track down dangling pointers.\n" +
"\n" +
"  If you compile with -DDEBUG, a number of assertion checks are\n" +
"  enabled that will catch more memory errors. You probably won't be\n" +
"  able to make much sense of the actual assertion errors, but they\n" +
"  should help you locate incorrectly overwritten memory.  The\n" +
"  checking is fairly extensive, and will slow down execution\n" +
"  noticeably. Calling malloc_stats or mallinfo with DEBUG set will\n" +
"  attempt to check every non-mmapped allocated and free chunk in the\n" +
"  course of computing the summmaries. (By nature, mmapped regions\n" +
"  cannot be checked very much automatically.)\n" +
"\n" +
"  Setting DEBUG may also be helpful if you are trying to modify\n" +
"  this code. The assertions in the check routines spell out in more\n" +
"  detail the assumptions and invariants underlying the algorithms.\n" +
"\n" +
"  Setting DEBUG does NOT provide an automated mechanism for checking\n" +
"  that all accesses to malloced memory stay within their\n" +
"  bounds. However, there are several add-ons and adaptations of this\n" +
"  or other mallocs available that do this.\n" +
"*/\n" +
"\n" +
"/*\n" +
"  The unsigned integer type used for comparing any two chunk sizes.\n" +
"  This should be at least as wide as size_t, but should not be signed.\n" +
"*/\n" +
"\n" +
"#ifndef CHUNK_SIZE_T\n" +
"#define CHUNK_SIZE_T unsigned long\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  The unsigned integer type used to hold addresses when they are are\n" +
"  manipulated as integers. Except that it is not defined on all\n" +
"  systems, intptr_t would suffice.\n" +
"*/\n" +
"#ifndef PTR_UINT\n" +
"#define PTR_UINT unsigned long\n" +
"#endif\n" +
"\n" +
"\n" +
"/*\n" +
"  INTERNAL_SIZE_T is the word-size used for internal bookkeeping\n" +
"  of chunk sizes.\n" +
"\n" +
"  The default version is the same as size_t.\n" +
"\n" +
"  While not strictly necessary, it is best to define this as an\n" +
"  unsigned type, even if size_t is a signed type. This may avoid some\n" +
"  artificial size limitations on some systems.\n" +
"\n" +
"  On a 64-bit machine, you may be able to reduce malloc overhead by\n" +
"  defining INTERNAL_SIZE_T to be a 32 bit `unsigned int' at the\n" +
"  expense of not being able to handle more than 2^32 of malloced\n" +
"  space. If this limitation is acceptable, you are encouraged to set\n" +
"  this unless you are on a platform requiring 16byte alignments. In\n" +
"  this case the alignment requirements turn out to negate any\n" +
"  potential advantages of decreasing size_t word size.\n" +
"\n" +
"  Implementors: Beware of the possible combinations of:\n" +
"     - INTERNAL_SIZE_T might be signed or unsigned, might be 32 or 64 bits,\n" +
"       and might be the same width as int or as long\n" +
"     - size_t might have different width and signedness as INTERNAL_SIZE_T\n" +
"     - int and long might be 32 or 64 bits, and might be the same width\n" +
"  To deal with this, most comparisons and difference computations\n" +
"  among INTERNAL_SIZE_Ts should cast them to CHUNK_SIZE_T, being\n" +
"  aware of the fact that casting an unsigned int to a wider long does\n" +
"  not sign-extend. (This also makes checking for negative numbers\n" +
"  awkward.) Some of these casts result in harmless compiler warnings\n" +
"  on some systems.\n" +
"*/\n" +
"\n" +
"#ifndef INTERNAL_SIZE_T\n" +
"#define INTERNAL_SIZE_T size_t\n" +
"#endif\n" +
"\n" +
"/* The corresponding word size */\n" +
"#define SIZE_SZ                (sizeof(INTERNAL_SIZE_T))\n" +
"\n" +
"\n") +
("\n" +
"/*\n" +
"  MALLOC_ALIGNMENT is the minimum alignment for malloc'ed chunks.\n" +
"  It must be a power of two at least 2 * SIZE_SZ, even on machines\n" +
"  for which smaller alignments would suffice. It may be defined as\n" +
"  larger than this though. Note however that code and data structures\n" +
"  are optimized for the case of 8-byte alignment.\n" +
"*/\n" +
"\n" +
"\n" +
"#ifndef MALLOC_ALIGNMENT\n" +
"#define MALLOC_ALIGNMENT       (2 * SIZE_SZ)\n" +
"#endif\n" +
"\n" +
"/* The corresponding bit mask value */\n" +
"#define MALLOC_ALIGN_MASK      (MALLOC_ALIGNMENT - 1)\n" +
"\n" +
"\n" +
"\n" +
"/*\n" +
"  REALLOC_ZERO_BYTES_FREES should be set if a call to\n" +
"  realloc with zero bytes should be the same as a call to free.\n" +
"  Some people think it should. Otherwise, since this malloc\n" +
"  returns a unique pointer for malloc(0), so does realloc(p, 0).\n" +
"*/\n" +
"\n" +
"/*   #define REALLOC_ZERO_BYTES_FREES */\n" +
"\n" +
"/*\n" +
"  TRIM_FASTBINS controls whether free() of a very small chunk can\n" +
"  immediately lead to trimming. Setting to true (1) can reduce memory\n" +
"  footprint, but will almost always slow down programs that use a lot\n" +
"  of small chunks.\n" +
"\n" +
"  Define this only if you are willing to give up some speed to more\n" +
"  aggressively reduce system-level memory footprint when releasing\n" +
"  memory in programs that use many small chunks.  You can get\n" +
"  essentially the same effect by setting MXFAST to 0, but this can\n" +
"  lead to even greater slowdowns in programs using many small chunks.\n" +
"  TRIM_FASTBINS is an in-between compile-time option, that disables\n" +
"  only those chunks bordering topmost memory from being placed in\n" +
"  fastbins.\n" +
"*/\n" +
"\n" +
"#ifndef TRIM_FASTBINS\n" +
"#define TRIM_FASTBINS  0\n" +
"#endif\n" +
"\n" +
"\n" +
"/*\n" +
"  USE_DL_PREFIX will prefix all public routines with the string 'dl'.\n" +
"  This is necessary when you only want to use this malloc in one part\n" +
"  of a program, using your regular system malloc elsewhere.\n" +
"*/\n" +
"\n" +
"#define USE_DL_PREFIX\n" +
"\n" +
"\n" +
"/*\n" +
"  USE_MALLOC_LOCK causes wrapper functions to surround each\n" +
"  callable routine with pthread mutex lock/unlock.\n" +
"\n" +
"  USE_MALLOC_LOCK forces USE_PUBLIC_MALLOC_WRAPPERS to be defined\n" +
"*/\n" +
"\n" +
"\n" +
"/* #define USE_MALLOC_LOCK */\n" +
"\n" +
"\n" +
"/*\n" +
"  If USE_PUBLIC_MALLOC_WRAPPERS is defined, every public routine is\n" +
"  actually a wrapper function that first calls MALLOC_PREACTION, then\n" +
"  calls the internal routine, and follows it with\n" +
"  MALLOC_POSTACTION. This is needed for locking, but you can also use\n" +
"  this, without USE_MALLOC_LOCK, for purposes of interception,\n" +
"  instrumentation, etc. It is a sad fact that using wrappers often\n" +
"  noticeably degrades performance of malloc-intensive programs.\n" +
"*/\n" +
"\n" +
"#ifdef USE_MALLOC_LOCK\n" +
"#define USE_PUBLIC_MALLOC_WRAPPERS\n" +
"#else\n" +
"/* #define USE_PUBLIC_MALLOC_WRAPPERS */\n" +
"#endif\n" +
"\n" +
"\n" +
"/*\n" +
"   Two-phase name translation.\n" +
"   All of the actual routines are given mangled names.\n" +
"   When wrappers are used, they become the public callable versions.\n" +
"   When DL_PREFIX is used, the callable names are prefixed.\n" +
"*/\n" +
"\n" +
"#ifndef USE_PUBLIC_MALLOC_WRAPPERS\n" +
"#define cALLOc      public_cALLOc\n" +
"#define fREe        public_fREe\n" +
"#define cFREe       public_cFREe\n" +
"#define mALLOc      public_mALLOc\n" +
"#define mEMALIGn    public_mEMALIGn\n" +
"#define rEALLOc     public_rEALLOc\n" +
"#define vALLOc      public_vALLOc\n" +
"#define pVALLOc     public_pVALLOc\n" +
"#define mALLINFo    public_mALLINFo\n" +
"#define mALLOPt     public_mALLOPt\n" +
"#define mTRIm       public_mTRIm\n" +
"#define mSTATs      public_mSTATs\n" +
"#define mUSABLe     public_mUSABLe\n" +
"#define iCALLOc     public_iCALLOc\n" +
"#define iCOMALLOc   public_iCOMALLOc\n" +
"#endif\n" +
"\n" +
"#ifdef USE_DL_PREFIX\n" +
"#define public_cALLOc    main_thread_calloc\n" +
"#define public_fREe      main_thread_free\n" +
"#define public_cFREe     main_thread_cfree\n" +
"#define public_mALLOc    main_thread_malloc\n" +
"#define public_mEMALIGn  main_thread_memalign\n" +
"#define public_rEALLOc   main_thread_realloc\n" +
"#define public_vALLOc    main_thread_valloc\n" +
"#define public_pVALLOc   main_thread_pvalloc\n" +
"#define public_mALLINFo  main_thread_mallinfo\n" +
"#define public_mALLOPt   main_thread_mallopt\n" +
"#define public_mTRIm     main_thread_malloc_trim\n" +
"#define public_mSTATs    main_thread_malloc_stats\n" +
"#define public_mUSABLe   main_thread_malloc_usable_size\n" +
"#define public_iCALLOc   main_thread_independent_calloc\n" +
"#define public_iCOMALLOc main_thread_independent_comalloc\n" +
"#else /* USE_DL_PREFIX */\n" +
"#define public_cALLOc    calloc\n" +
"#define public_fREe      free\n" +
"#define public_cFREe     cfree\n" +
"#define public_mALLOc    malloc\n" +
"#define public_mEMALIGn  memalign\n" +
"#define public_rEALLOc   realloc\n" +
"#define public_vALLOc    valloc\n" +
"#define public_pVALLOc   pvalloc\n" +
"#define public_mALLINFo  mallinfo\n" +
"#define public_mALLOPt   mallopt\n" +
"#define public_mTRIm     malloc_trim\n" +
"#define public_mSTATs    malloc_stats\n" +
"#define public_mUSABLe   malloc_usable_size\n" +
"#define public_iCALLOc   independent_calloc\n" +
"#define public_iCOMALLOc independent_comalloc\n" +
"#endif /* USE_DL_PREFIX */\n" +
"\n" +
"\n" +
"/*\n" +
"  HAVE_MEMCPY should be defined if you are not otherwise using\n" +
"  ANSI STD C, but still have memcpy and memset in your C library\n" +
"  and want to use them in calloc and realloc. Otherwise simple\n" +
"  macro versions are defined below.\n" +
"\n") +
("  USE_MEMCPY should be defined as 1 if you actually want to\n" +
"  have memset and memcpy called. People report that the macro\n" +
"  versions are faster than libc versions on some systems.\n" +
"\n" +
"  Even if USE_MEMCPY is set to 1, loops to copy/clear small chunks\n" +
"  (of <= 36 bytes) are manually unrolled in realloc and calloc.\n" +
"*/\n" +
"\n" +
"#define HAVE_MEMCPY\n" +
"\n" +
"#ifndef USE_MEMCPY\n" +
"#ifdef HAVE_MEMCPY\n" +
"#define USE_MEMCPY 1\n" +
"#else\n" +
"#define USE_MEMCPY 0\n" +
"#endif\n" +
"#endif\n" +
"\n" +
"\n" +
"#if (__STD_C || defined(HAVE_MEMCPY))\n" +
"\n" +
"#ifdef WIN32\n" +
"/* On Win32 memset and memcpy are already declared in windows.h */\n" +
"#else\n" +
"#if __STD_C\n" +
"extern \"C\" {\n" +
"void* memset(void*, int, size_t);\n" +
"void* memcpy(void*, const void*, size_t);\n" +
"}\n" +
"#else\n" +
"extern \"C\" {\n" +
"Void_t* memset();\n" +
"Void_t* memcpy();\n" +
"}\n" +
"#endif\n" +
"#endif\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  MALLOC_FAILURE_ACTION is the action to take before \"return 0\" when\n" +
"  malloc fails to be able to return memory, either because memory is\n" +
"  exhausted or because of illegal arguments.\n" +
"\n" +
"  By default, sets errno if running on STD_C platform, else does nothing.\n" +
"*/\n" +
"\n" +
"#ifndef MALLOC_FAILURE_ACTION\n" +
"#if __STD_C\n" +
"#define MALLOC_FAILURE_ACTION \\n" +
"   errno = ENOMEM;\n" +
"\n" +
"#else\n" +
"#define MALLOC_FAILURE_ACTION\n" +
"#endif\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  MORECORE-related declarations. By default, rely on sbrk\n" +
"*/\n" +
"\n" +
"\n" +
"#ifdef LACKS_UNISTD_H\n" +
"#if !defined(__FreeBSD__) && !defined(__OpenBSD__) && !defined(__NetBSD__)\n" +
"#if __STD_C\n" +
"extern Void_t*     sbrk(ptrdiff_t);\n" +
"#else\n" +
"extern Void_t*     sbrk();\n" +
"#endif\n" +
"#endif\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  MORECORE is the name of the routine to call to obtain more memory\n" +
"  from the system.  See below for general guidance on writing\n" +
"  alternative MORECORE functions, as well as a version for WIN32 and a\n" +
"  sample version for pre-OSX macos.\n" +
"*/\n" +
"\n" +
"#ifndef MORECORE\n" +
"#define MORECORE sbrk\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  MORECORE_FAILURE is the value returned upon failure of MORECORE\n" +
"  as well as mmap. Since it cannot be an otherwise valid memory address,\n" +
"  and must reflect values of standard sys calls, you probably ought not\n" +
"  try to redefine it.\n" +
"*/\n" +
"\n" +
"#ifndef MORECORE_FAILURE\n" +
"#define MORECORE_FAILURE (-1)\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  If MORECORE_CONTIGUOUS is true, take advantage of fact that\n" +
"  consecutive calls to MORECORE with positive arguments always return\n" +
"  contiguous increasing addresses.  This is true of unix sbrk.  Even\n" +
"  if not defined, when regions happen to be contiguous, malloc will\n" +
"  permit allocations spanning regions obtained from different\n" +
"  calls. But defining this when applicable enables some stronger\n" +
"  consistency checks and space efficiencies.\n" +
"*/\n" +
"\n" +
"#ifndef MORECORE_CONTIGUOUS\n" +
"#define MORECORE_CONTIGUOUS 1\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  Define MORECORE_CANNOT_TRIM if your version of MORECORE\n" +
"  cannot release space back to the system when given negative\n" +
"  arguments. This is generally necessary only if you are using\n" +
"  a hand-crafted MORECORE function that cannot handle negative arguments.\n" +
"*/\n" +
"\n" +
"/* #define MORECORE_CANNOT_TRIM */\n" +
"\n" +
"\n" +
"/*\n" +
"  Define HAVE_MMAP as true to optionally make malloc() use mmap() to\n" +
"  allocate very large blocks.  These will be returned to the\n" +
"  operating system immediately after a free(). Also, if mmap\n" +
"  is available, it is used as a backup strategy in cases where\n" +
"  MORECORE fails to provide space from system.\n" +
"\n" +
"  This malloc is best tuned to work with mmap for large requests.\n" +
"  If you do not have mmap, operations involving very large chunks (1MB\n" +
"  or so) may be slower than you'd like.\n" +
"*/\n" +
"\n" +
"#ifndef HAVE_MMAP\n" +
"#define HAVE_MMAP 1\n" +
"#endif\n" +
"\n" +
"#if HAVE_MMAP\n" +
"/*\n" +
"   Standard unix mmap using /dev/zero clears memory so calloc doesn't\n" +
"   need to.\n" +
"*/\n" +
"\n" +
"#ifndef MMAP_CLEARS\n" +
"#define MMAP_CLEARS 1\n" +
"#endif\n" +
"\n" +
"#else /* no mmap */\n" +
"#ifndef MMAP_CLEARS\n" +
"#define MMAP_CLEARS 0\n" +
"#endif\n" +
"#endif\n" +
"\n" +
"\n" +
"/*\n") +
("   MMAP_AS_MORECORE_SIZE is the minimum mmap size argument to use if\n" +
"   sbrk fails, and mmap is used as a backup (which is done only if\n" +
"   HAVE_MMAP).  The value must be a multiple of page size.  This\n" +
"   backup strategy generally applies only when systems have \"holes\" in\n" +
"   address space, so sbrk cannot perform contiguous expansion, but\n" +
"   there is still space available on system.  On systems for which\n" +
"   this is known to be useful (i.e. most linux kernels), this occurs\n" +
"   only when programs allocate huge amounts of memory.  Between this,\n" +
"   and the fact that mmap regions tend to be limited, the size should\n" +
"   be large, to avoid too many mmap calls and thus avoid running out\n" +
"   of kernel resources.\n" +
"*/\n" +
"\n" +
"#ifndef MMAP_AS_MORECORE_SIZE\n" +
"#define MMAP_AS_MORECORE_SIZE (1024 * 1024)\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  Define HAVE_MREMAP to make realloc() use mremap() to re-allocate\n" +
"  large blocks.  This is currently only possible on Linux with\n" +
"  kernel versions newer than 1.3.77.\n" +
"*/\n" +
"\n" +
"#ifndef HAVE_MREMAP\n" +
"#ifdef linux\n" +
"#define HAVE_MREMAP 1\n" +
"#else\n" +
"#define HAVE_MREMAP 0\n" +
"#endif\n" +
"\n" +
"#endif /* HAVE_MMAP */\n" +
"\n" +
"\n" +
"/*\n" +
"  The system page size. To the extent possible, this malloc manages\n" +
"  memory from the system in page-size units.  Note that this value is\n" +
"  cached during initialization into a field of malloc_state. So even\n" +
"  if malloc_getpagesize is a function, it is only called once.\n" +
"\n" +
"  The following mechanics for getpagesize were adapted from bsd/gnu\n" +
"  getpagesize.h. If none of the system-probes here apply, a value of\n" +
"  4096 is used, which should be OK: If they don't apply, then using\n" +
"  the actual value probably doesn't impact performance.\n" +
"*/\n" +
"\n" +
"\n" +
"#ifndef malloc_getpagesize\n" +
"\n" +
"#ifndef LACKS_UNISTD_H\n" +
"#  include <unistd.h>\n" +
"#endif\n" +
"\n" +
"#  ifdef _SC_PAGESIZE         /* some SVR4 systems omit an underscore */\n" +
"#    ifndef _SC_PAGE_SIZE\n" +
"#      define _SC_PAGE_SIZE _SC_PAGESIZE\n" +
"#    endif\n" +
"#  endif\n" +
"\n" +
"#  ifdef _SC_PAGE_SIZE\n" +
"#    define malloc_getpagesize sysconf(_SC_PAGE_SIZE)\n" +
"#  else\n" +
"#    if defined(BSD) || defined(DGUX) || defined(HAVE_GETPAGESIZE)\n" +
"       extern size_t getpagesize();\n" +
"#      define malloc_getpagesize getpagesize()\n" +
"#    else\n" +
"#      ifdef WIN32 /* use supplied emulation of getpagesize */\n" +
"#        define malloc_getpagesize getpagesize()\n" +
"#      else\n" +
"#        ifndef LACKS_SYS_PARAM_H\n" +
"#          include <sys/param.h>\n" +
"#        endif\n" +
"#        ifdef EXEC_PAGESIZE\n" +
"#          define malloc_getpagesize EXEC_PAGESIZE\n" +
"#        else\n" +
"#          ifdef NBPG\n" +
"#            ifndef CLSIZE\n" +
"#              define malloc_getpagesize NBPG\n" +
"#            else\n" +
"#              define malloc_getpagesize (NBPG * CLSIZE)\n" +
"#            endif\n" +
"#          else\n" +
"#            ifdef NBPC\n" +
"#              define malloc_getpagesize NBPC\n" +
"#            else\n" +
"#              ifdef PAGESIZE\n" +
"#                define malloc_getpagesize PAGESIZE\n" +
"#              else /* just guess */\n" +
"#                define malloc_getpagesize (4096)\n" +
"#              endif\n" +
"#            endif\n" +
"#          endif\n" +
"#        endif\n" +
"#      endif\n" +
"#    endif\n" +
"#  endif\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  This version of malloc supports the standard SVID/XPG mallinfo\n" +
"  routine that returns a struct containing usage properties and\n" +
"  statistics. It should work on any SVID/XPG compliant system that has\n" +
"  a /usr/include/malloc.h defining struct mallinfo. (If you'd like to\n" +
"  install such a thing yourself, cut out the preliminary declarations\n" +
"  as described above and below and save them in a malloc.h file. But\n" +
"  there's no compelling reason to bother to do this.)\n" +
"\n" +
"  The main declaration needed is the mallinfo struct that is returned\n" +
"  (by-copy) by mallinfo().  The SVID/XPG malloinfo struct contains a\n" +
"  bunch of fields that are not even meaningful in this version of\n" +
"  malloc.  These fields are are instead filled by mallinfo() with\n" +
"  other numbers that might be of interest.\n" +
"\n" +
"  HAVE_USR_INCLUDE_MALLOC_H should be set if you have a\n" +
"  /usr/include/malloc.h file that includes a declaration of struct\n" +
"  mallinfo.  If so, it is included; else an SVID2/XPG2 compliant\n" +
"  version is declared below.  These must be precisely the same for\n" +
"  mallinfo() to work.  The original SVID version of this struct,\n" +
"  defined on most systems with mallinfo, declares all fields as\n" +
"  ints. But some others define as unsigned long. If your system\n" +
"  defines the fields using a type of different width than listed here,\n" +
"  you must #include your system version and #define\n" +
"  HAVE_USR_INCLUDE_MALLOC_H.\n" +
"*/\n" +
"\n" +
"/* #define HAVE_USR_INCLUDE_MALLOC_H */\n" +
"\n" +
"#ifdef HAVE_USR_INCLUDE_MALLOC_H\n" +
"#include \"/usr/include/malloc.h\"\n" +
"#else\n" +
"\n" +
"/* SVID2/XPG mallinfo structure */\n" +
"\n" +
"struct mallinfo {\n" +
"  int arena;    /* non-mmapped space allocated from system */\n" +
"  int ordblks;  /* number of free chunks */\n" +
"  int smblks;   /* number of fastbin blocks */\n" +
"  int hblks;    /* number of mmapped regions */\n" +
"  int hblkhd;   /* space in mmapped regions */\n" +
"  int usmblks;  /* maximum total allocated space */\n" +
"  int fsmblks;  /* space available in freed fastbin blocks */\n" +
"  int uordblks; /* total allocated space */\n" +
"  int fordblks; /* total free space */\n" +
"  int keepcost; /* top-most, releasable (via malloc_trim) space */\n" +
"};\n" +
"\n" +
"/*\n" +
"  SVID/XPG defines four standard parameter numbers for mallopt,\n" +
"  normally defined in malloc.h.  Only one of these (M_MXFAST) is used\n" +
"  in this malloc. The others (M_NLBLKS, M_GRAIN, M_KEEP) don't apply,\n" +
"  so setting them has no effect. But this malloc also supports other\n" +
"  options in mallopt described below.\n" +
"*/\n") +
("#endif\n" +
"\n" +
"\n" +
"/* ---------- description of public routines ------------ */\n" +
"\n" +
"/*\n" +
"  malloc(size_t n)\n" +
"  Returns a pointer to a newly allocated chunk of at least n bytes, or null\n" +
"  if no space is available. Additionally, on failure, errno is\n" +
"  set to ENOMEM on ANSI C systems.\n" +
"\n" +
"  If n is zero, malloc returns a minimum-sized chunk. (The minimum\n" +
"  size is 16 bytes on most 32bit systems, and 24 or 32 bytes on 64bit\n" +
"  systems.)  On most systems, size_t is an unsigned type, so calls\n" +
"  with negative arguments are interpreted as requests for huge amounts\n" +
"  of space, which will often fail. The maximum supported value of n\n" +
"  differs across systems, but is in all cases less than the maximum\n" +
"  representable value of a size_t.\n" +
"*/\n" +
"#if __STD_C\n" +
"Void_t*  public_mALLOc(size_t);\n" +
"#else\n" +
"Void_t*  public_mALLOc();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  free(Void_t* p)\n" +
"  Releases the chunk of memory pointed to by p, that had been previously\n" +
"  allocated using malloc or a related routine such as realloc.\n" +
"  It has no effect if p is null. It can have arbitrary (i.e., bad!)\n" +
"  effects if p has already been freed.\n" +
"\n" +
"  Unless disabled (using mallopt), freeing very large spaces will\n" +
"  when possible, automatically trigger operations that give\n" +
"  back unused memory to the system, thus reducing program footprint.\n" +
"*/\n" +
"#if __STD_C\n" +
"void     public_fREe(Void_t*);\n" +
"#else\n" +
"void     public_fREe();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  calloc(size_t n_elements, size_t element_size);\n" +
"  Returns a pointer to n_elements * element_size bytes, with all locations\n" +
"  set to zero.\n" +
"*/\n" +
"#if __STD_C\n" +
"Void_t*  public_cALLOc(size_t, size_t);\n" +
"#else\n" +
"Void_t*  public_cALLOc();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  realloc(Void_t* p, size_t n)\n" +
"  Returns a pointer to a chunk of size n that contains the same data\n" +
"  as does chunk p up to the minimum of (n, p's size) bytes, or null\n" +
"  if no space is available.\n" +
"\n" +
"  The returned pointer may or may not be the same as p. The algorithm\n" +
"  prefers extending p when possible, otherwise it employs the\n" +
"  equivalent of a malloc-copy-free sequence.\n" +
"\n" +
"  If p is null, realloc is equivalent to malloc.\n" +
"\n" +
"  If space is not available, realloc returns null, errno is set (if on\n" +
"  ANSI) and p is NOT freed.\n" +
"\n" +
"  if n is for fewer bytes than already held by p, the newly unused\n" +
"  space is lopped off and freed if possible.  Unless the #define\n" +
"  REALLOC_ZERO_BYTES_FREES is set, realloc with a size argument of\n" +
"  zero (re)allocates a minimum-sized chunk.\n" +
"\n" +
"  Large chunks that were internally obtained via mmap will always\n" +
"  be reallocated using malloc-copy-free sequences unless\n" +
"  the system supports MREMAP (currently only linux).\n" +
"\n" +
"  The old unix realloc convention of allowing the last-free'd chunk\n" +
"  to be used as an argument to realloc is not supported.\n" +
"*/\n" +
"#if __STD_C\n" +
"Void_t*  public_rEALLOc(Void_t*, size_t);\n" +
"#else\n" +
"Void_t*  public_rEALLOc();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  memalign(size_t alignment, size_t n);\n" +
"  Returns a pointer to a newly allocated chunk of n bytes, aligned\n" +
"  in accord with the alignment argument.\n" +
"\n" +
"  The alignment argument should be a power of two. If the argument is\n" +
"  not a power of two, the nearest greater power is used.\n" +
"  8-byte alignment is guaranteed by normal malloc calls, so don't\n" +
"  bother calling memalign with an argument of 8 or less.\n" +
"\n" +
"  Overreliance on memalign is a sure way to fragment space.\n" +
"*/\n" +
"#if __STD_C\n" +
"Void_t*  public_mEMALIGn(size_t, size_t);\n" +
"#else\n" +
"Void_t*  public_mEMALIGn();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  valloc(size_t n);\n" +
"  Equivalent to memalign(pagesize, n), where pagesize is the page\n" +
"  size of the system. If the pagesize is unknown, 4096 is used.\n" +
"*/\n" +
"#if __STD_C\n" +
"Void_t*  public_vALLOc(size_t);\n" +
"#else\n" +
"Void_t*  public_vALLOc();\n" +
"#endif\n" +
"\n" +
"\n" +
"\n" +
"/*\n" +
"  mallopt(int parameter_number, int parameter_value)\n" +
"  Sets tunable parameters The format is to provide a\n" +
"  (parameter-number, parameter-value) pair.  mallopt then sets the\n" +
"  corresponding parameter to the argument value if it can (i.e., so\n" +
"  long as the value is meaningful), and returns 1 if successful else\n" +
"  0.  SVID/XPG/ANSI defines four standard param numbers for mallopt,\n" +
"  normally defined in malloc.h.  Only one of these (M_MXFAST) is used\n" +
"  in this malloc. The others (M_NLBLKS, M_GRAIN, M_KEEP) don't apply,\n" +
"  so setting them has no effect. But this malloc also supports four\n" +
"  other options in mallopt. See below for details.  Briefly, supported\n" +
"  parameters are as follows (listed defaults are for \"typical\"\n" +
"  configurations).\n" +
"\n" +
"  Symbol            param #   default    allowed param values\n" +
"  M_MXFAST          1         64         0-80  (0 disables fastbins)\n" +
"  M_TRIM_THRESHOLD -1         256*1024   any   (-1U disables trimming)\n" +
"  M_TOP_PAD        -2         0          any\n" +
"  M_MMAP_THRESHOLD -3         256*1024   any   (or 0 if no MMAP support)\n" +
"  M_MMAP_MAX       -4         65536      any   (0 disables use of mmap)\n" +
"*/\n" +
"#if __STD_C\n" +
"int      public_mALLOPt(int, int);\n" +
"#else\n" +
"int      public_mALLOPt();\n" +
"#endif\n" +
"\n" +
"\n" +
"/*\n" +
"  mallinfo()\n" +
"  Returns (by copy) a struct containing various summary statistics:\n" +
"\n") +
("  arena:     current total non-mmapped bytes allocated from system\n" +
"  ordblks:   the number of free chunks\n" +
"  smblks:    the number of fastbin blocks (i.e., small chunks that\n" +
"               have been freed but not use resused or consolidated)\n" +
"  hblks:     current number of mmapped regions\n" +
"  hblkhd:    total bytes held in mmapped regions\n" +
"  usmblks:   the maximum total allocated space. This will be greater\n" +
"                than current total if trimming has occurred.\n" +
"  fsmblks:   total bytes held in fastbin blocks\n" +
"  uordblks:  current total allocated space (normal or mmapped)\n" +
"  fordblks:  total free space\n" +
"  keepcost:  the maximum number of bytes that could ideally be released\n" +
"               back to system via malloc_trim. (\"ideally\" means that\n" +
"               it ignores page restrictions etc.)\n" +
"\n" +
"  Because these fields are ints, but internal bookkeeping may\n" +
"  be kept as longs, the reported values may wrap around zero and\n" +
"  thus be inaccurate.\n" +
"*/\n" +
"#if __STD_C\n" +
"struct mallinfo public_mALLINFo(void);\n" +
"#else\n" +
"struct mallinfo public_mALLINFo();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  independent_calloc(size_t n_elements, size_t element_size, Void_t* chunks[]);\n" +
"\n" +
"  independent_calloc is similar to calloc, but instead of returning a\n" +
"  single cleared space, it returns an array of pointers to n_elements\n" +
"  independent elements that can hold contents of size elem_size, each\n" +
"  of which starts out cleared, and can be independently freed,\n" +
"  realloc'ed etc. The elements are guaranteed to be adjacently\n" +
"  allocated (this is not guaranteed to occur with multiple callocs or\n" +
"  mallocs), which may also improve cache locality in some\n" +
"  applications.\n" +
"\n" +
"  The \"chunks\" argument is optional (i.e., may be null, which is\n" +
"  probably the most typical usage). If it is null, the returned array\n" +
"  is itself dynamically allocated and should also be freed when it is\n" +
"  no longer needed. Otherwise, the chunks array must be of at least\n" +
"  n_elements in length. It is filled in with the pointers to the\n" +
"  chunks.\n" +
"\n" +
"  In either case, independent_calloc returns this pointer array, or\n" +
"  null if the allocation failed.  If n_elements is zero and \"chunks\"\n" +
"  is null, it returns a chunk representing an array with zero elements\n" +
"  (which should be freed if not wanted).\n" +
"\n" +
"  Each element must be individually freed when it is no longer\n" +
"  needed. If you'd like to instead be able to free all at once, you\n" +
"  should instead use regular calloc and assign pointers into this\n" +
"  space to represent elements.  (In this case though, you cannot\n" +
"  independently free elements.)\n" +
"\n" +
"  independent_calloc simplifies and speeds up implementations of many\n" +
"  kinds of pools.  It may also be useful when constructing large data\n" +
"  structures that initially have a fixed number of fixed-sized nodes,\n" +
"  but the number is not known at compile time, and some of the nodes\n" +
"  may later need to be freed. For example:\n" +
"\n" +
"  struct Node { int item; struct Node* next; };\n" +
"\n" +
"  struct Node* build_list() {\n" +
"    struct Node** pool;\n" +
"    int n = read_number_of_nodes_needed();\n" +
"    if (n <= 0) return 0;\n" +
"    pool = (struct Node**)(independent_calloc(n, sizeof(struct Node), 0);\n" +
"    if (pool == 0) die();\n" +
"    // organize into a linked list...\n" +
"    struct Node* first = pool[0];\n" +
"    for (i = 0; i < n-1; ++i)\n" +
"      pool[i]->next = pool[i+1];\n" +
"    free(pool);     // Can now free the array (or not, if it is needed later)\n" +
"    return first;\n" +
"  }\n" +
"*/\n" +
"#if __STD_C\n" +
"Void_t** public_iCALLOc(size_t, size_t, Void_t**);\n" +
"#else\n" +
"Void_t** public_iCALLOc();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  independent_comalloc(size_t n_elements, size_t sizes[], Void_t* chunks[]);\n" +
"\n" +
"  independent_comalloc allocates, all at once, a set of n_elements\n" +
"  chunks with sizes indicated in the \"sizes\" array.    It returns\n" +
"  an array of pointers to these elements, each of which can be\n" +
"  independently freed, realloc'ed etc. The elements are guaranteed to\n" +
"  be adjacently allocated (this is not guaranteed to occur with\n" +
"  multiple callocs or mallocs), which may also improve cache locality\n" +
"  in some applications.\n" +
"\n" +
"  The \"chunks\" argument is optional (i.e., may be null). If it is null\n" +
"  the returned array is itself dynamically allocated and should also\n" +
"  be freed when it is no longer needed. Otherwise, the chunks array\n" +
"  must be of at least n_elements in length. It is filled in with the\n" +
"  pointers to the chunks.\n" +
"\n" +
"  In either case, independent_comalloc returns this pointer array, or\n" +
"  null if the allocation failed.  If n_elements is zero and chunks is\n" +
"  null, it returns a chunk representing an array with zero elements\n" +
"  (which should be freed if not wanted).\n" +
"\n" +
"  Each element must be individually freed when it is no longer\n" +
"  needed. If you'd like to instead be able to free all at once, you\n" +
"  should instead use a single regular malloc, and assign pointers at\n" +
"  particular offsets in the aggregate space. (In this case though, you\n" +
"  cannot independently free elements.)\n" +
"\n" +
"  independent_comallac differs from independent_calloc in that each\n" +
"  element may have a different size, and also that it does not\n" +
"  automatically clear elements.\n" +
"\n" +
"  independent_comalloc can be used to speed up allocation in cases\n" +
"  where several structs or objects must always be allocated at the\n" +
"  same time.  For example:\n" +
"\n" +
"  struct Head { ... }\n" +
"  struct Foot { ... }\n" +
"\n" +
"  void send_message(char* msg) {\n" +
"    int msglen = strlen(msg);\n" +
"    size_t sizes[3] = { sizeof(struct Head), msglen, sizeof(struct Foot) };\n" +
"    void* chunks[3];\n" +
"    if (independent_comalloc(3, sizes, chunks) == 0)\n" +
"      die();\n" +
"    struct Head* head = (struct Head*)(chunks[0]);\n" +
"    char*        body = (char*)(chunks[1]);\n" +
"    struct Foot* foot = (struct Foot*)(chunks[2]);\n" +
"    // ...\n" +
"  }\n" +
"\n" +
"  In general though, independent_comalloc is worth using only for\n" +
"  larger values of n_elements. For small values, you probably won't\n" +
"  detect enough difference from series of malloc calls to bother.\n" +
"\n" +
"  Overuse of independent_comalloc can increase overall memory usage,\n" +
"  since it cannot reuse existing noncontiguous small chunks that\n" +
"  might be available for some of the elements.\n" +
"*/\n" +
"#if __STD_C\n" +
"Void_t** public_iCOMALLOc(size_t, size_t*, Void_t**);\n" +
"#else\n" +
"Void_t** public_iCOMALLOc();\n" +
"#endif\n" +
"\n" +
"\n" +
"/*\n") +
("  pvalloc(size_t n);\n" +
"  Equivalent to valloc(minimum-page-that-holds(n)), that is,\n" +
"  round up n to nearest pagesize.\n" +
" */\n" +
"#if __STD_C\n" +
"Void_t*  public_pVALLOc(size_t);\n" +
"#else\n" +
"Void_t*  public_pVALLOc();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  cfree(Void_t* p);\n" +
"  Equivalent to free(p).\n" +
"\n" +
"  cfree is needed/defined on some systems that pair it with calloc,\n" +
"  for odd historical reasons (such as: cfree is used in example\n" +
"  code in the first edition of K&R).\n" +
"*/\n" +
"#if __STD_C\n" +
"void     public_cFREe(Void_t*);\n" +
"#else\n" +
"void     public_cFREe();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  malloc_trim(size_t pad);\n" +
"\n" +
"  If possible, gives memory back to the system (via negative\n" +
"  arguments to sbrk) if there is unused memory at the `high' end of\n" +
"  the malloc pool. You can call this after freeing large blocks of\n" +
"  memory to potentially reduce the system-level memory requirements\n" +
"  of a program. However, it cannot guarantee to reduce memory. Under\n" +
"  some allocation patterns, some large free blocks of memory will be\n" +
"  locked between two used chunks, so they cannot be given back to\n" +
"  the system.\n" +
"\n" +
"  The `pad' argument to malloc_trim represents the amount of free\n" +
"  trailing space to leave untrimmed. If this argument is zero,\n" +
"  only the minimum amount of memory to maintain internal data\n" +
"  structures will be left (one page or less). Non-zero arguments\n" +
"  can be supplied to maintain enough trailing space to service\n" +
"  future expected allocations without having to re-obtain memory\n" +
"  from the system.\n" +
"\n" +
"  Malloc_trim returns 1 if it actually released any memory, else 0.\n" +
"  On systems that do not support \"negative sbrks\", it will always\n" +
"  rreturn 0.\n" +
"*/\n" +
"#if __STD_C\n" +
"int      public_mTRIm(size_t);\n" +
"#else\n" +
"int      public_mTRIm();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  malloc_usable_size(Void_t* p);\n" +
"\n" +
"  Returns the number of bytes you can actually use in\n" +
"  an allocated chunk, which may be more than you requested (although\n" +
"  often not) due to alignment and minimum size constraints.\n" +
"  You can use this many bytes without worrying about\n" +
"  overwriting other allocated objects. This is not a particularly great\n" +
"  programming practice. malloc_usable_size can be more useful in\n" +
"  debugging and assertions, for example:\n" +
"\n" +
"  p = malloc(n);\n" +
"  assert(malloc_usable_size(p) >= 256);\n" +
"\n" +
"*/\n" +
"#if __STD_C\n" +
"size_t   public_mUSABLe(Void_t*);\n" +
"#else\n" +
"size_t   public_mUSABLe();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  malloc_stats();\n" +
"  Prints on stderr the amount of space obtained from the system (both\n" +
"  via sbrk and mmap), the maximum amount (which may be more than\n" +
"  current if malloc_trim and/or munmap got called), and the current\n" +
"  number of bytes allocated via malloc (or realloc, etc) but not yet\n" +
"  freed. Note that this is the number of bytes allocated, not the\n" +
"  number requested. It will be larger than the number requested\n" +
"  because of alignment and bookkeeping overhead. Because it includes\n" +
"  alignment wastage as being in use, this figure may be greater than\n" +
"  zero even when no user-level chunks are allocated.\n" +
"\n" +
"  The reported current and maximum system memory can be inaccurate if\n" +
"  a program makes other calls to system memory allocation functions\n" +
"  (normally sbrk) outside of malloc.\n" +
"\n" +
"  malloc_stats prints only the most commonly interesting statistics.\n" +
"  More information can be obtained by calling mallinfo.\n" +
"\n" +
"*/\n" +
"#if __STD_C\n" +
"void     public_mSTATs();\n" +
"#else\n" +
"void     public_mSTATs();\n" +
"#endif\n" +
"\n" +
"/* mallopt tuning options */\n" +
"\n" +
"/*\n" +
"  M_MXFAST is the maximum request size used for \"fastbins\", special bins\n" +
"  that hold returned chunks without consolidating their spaces. This\n" +
"  enables future requests for chunks of the same size to be handled\n" +
"  very quickly, but can increase fragmentation, and thus increase the\n" +
"  overall memory footprint of a program.\n" +
"\n" +
"  This malloc manages fastbins very conservatively yet still\n" +
"  efficiently, so fragmentation is rarely a problem for values less\n" +
"  than or equal to the default.  The maximum supported value of MXFAST\n" +
"  is 80. You wouldn't want it any higher than this anyway.  Fastbins\n" +
"  are designed especially for use with many small structs, objects or\n" +
"  strings -- the default handles structs/objects/arrays with sizes up\n" +
"  to 16 4byte fields, or small strings representing words, tokens,\n" +
"  etc. Using fastbins for larger objects normally worsens\n" +
"  fragmentation without improving speed.\n" +
"\n" +
"  M_MXFAST is set in REQUEST size units. It is internally used in\n" +
"  chunksize units, which adds padding and alignment.  You can reduce\n" +
"  M_MXFAST to 0 to disable all use of fastbins.  This causes the malloc\n" +
"  algorithm to be a closer approximation of fifo-best-fit in all cases,\n" +
"  not just for larger requests, but will generally cause it to be\n" +
"  slower.\n" +
"*/\n" +
"\n" +
"\n" +
"/* M_MXFAST is a standard SVID/XPG tuning option, usually listed in malloc.h */\n" +
"#ifndef M_MXFAST\n" +
"#define M_MXFAST            1\n" +
"#endif\n" +
"\n" +
"#ifndef DEFAULT_MXFAST\n" +
"#define DEFAULT_MXFAST     64\n" +
"#endif\n" +
"\n" +
"\n" +
"/*\n" +
"  M_TRIM_THRESHOLD is the maximum amount of unused top-most memory\n" +
"  to keep before releasing via malloc_trim in free().\n" +
"\n" +
"  Automatic trimming is mainly useful in long-lived programs.\n" +
"  Because trimming via sbrk can be slow on some systems, and can\n" +
"  sometimes be wasteful (in cases where programs immediately\n" +
"  afterward allocate more large chunks) the value should be high\n" +
"  enough so that your overall system performance would improve by\n" +
"  releasing this much memory.\n" +
"\n") +
("  The trim threshold and the mmap control parameters (see below)\n" +
"  can be traded off with one another. Trimming and mmapping are\n" +
"  two different ways of releasing unused memory back to the\n" +
"  system. Between these two, it is often possible to keep\n" +
"  system-level demands of a long-lived program down to a bare\n" +
"  minimum. For example, in one test suite of sessions measuring\n" +
"  the XF86 X server on Linux, using a trim threshold of 128K and a\n" +
"  mmap threshold of 192K led to near-minimal long term resource\n" +
"  consumption.\n" +
"\n" +
"  If you are using this malloc in a long-lived program, it should\n" +
"  pay to experiment with these values.  As a rough guide, you\n" +
"  might set to a value close to the average size of a process\n" +
"  (program) running on your system.  Releasing this much memory\n" +
"  would allow such a process to run in memory.  Generally, it's\n" +
"  worth it to tune for trimming rather tham memory mapping when a\n" +
"  program undergoes phases where several large chunks are\n" +
"  allocated and released in ways that can reuse each other's\n" +
"  storage, perhaps mixed with phases where there are no such\n" +
"  chunks at all.  And in well-behaved long-lived programs,\n" +
"  controlling release of large blocks via trimming versus mapping\n" +
"  is usually faster.\n" +
"\n" +
"  However, in most programs, these parameters serve mainly as\n" +
"  protection against the system-level effects of carrying around\n" +
"  massive amounts of unneeded memory. Since frequent calls to\n" +
"  sbrk, mmap, and munmap otherwise degrade performance, the default\n" +
"  parameters are set to relatively high values that serve only as\n" +
"  safeguards.\n" +
"\n" +
"  The trim value must be greater than page size to have any useful\n" +
"  effect.  To disable trimming completely, you can set to\n" +
"  (unsigned long)(-1)\n" +
"\n" +
"  Trim settings interact with fastbin (MXFAST) settings: Unless\n" +
"  TRIM_FASTBINS is defined, automatic trimming never takes place upon\n" +
"  freeing a chunk with size less than or equal to MXFAST. Trimming is\n" +
"  instead delayed until subsequent freeing of larger chunks. However,\n" +
"  you can still force an attempted trim by calling malloc_trim.\n" +
"\n" +
"  Also, trimming is not generally possible in cases where\n" +
"  the main arena is obtained via mmap.\n" +
"\n" +
"  Note that the trick some people use of mallocing a huge space and\n" +
"  then freeing it at program startup, in an attempt to reserve system\n" +
"  memory, doesn't have the intended effect under automatic trimming,\n" +
"  since that memory will immediately be returned to the system.\n" +
"*/\n" +
"\n" +
"#define M_TRIM_THRESHOLD       -1\n" +
"\n" +
"#ifndef DEFAULT_TRIM_THRESHOLD\n" +
"#define DEFAULT_TRIM_THRESHOLD (256 * 1024)\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  M_TOP_PAD is the amount of extra `padding' space to allocate or\n" +
"  retain whenever sbrk is called. It is used in two ways internally:\n" +
"\n" +
"  * When sbrk is called to extend the top of the arena to satisfy\n" +
"  a new malloc request, this much padding is added to the sbrk\n" +
"  request.\n" +
"\n" +
"  * When malloc_trim is called automatically from free(),\n" +
"  it is used as the `pad' argument.\n" +
"\n" +
"  In both cases, the actual amount of padding is rounded\n" +
"  so that the end of the arena is always a system page boundary.\n" +
"\n" +
"  The main reason for using padding is to avoid calling sbrk so\n" +
"  often. Having even a small pad greatly reduces the likelihood\n" +
"  that nearly every malloc request during program start-up (or\n" +
"  after trimming) will invoke sbrk, which needlessly wastes\n" +
"  time.\n" +
"\n" +
"  Automatic rounding-up to page-size units is normally sufficient\n" +
"  to avoid measurable overhead, so the default is 0.  However, in\n" +
"  systems where sbrk is relatively slow, it can pay to increase\n" +
"  this value, at the expense of carrying around more memory than\n" +
"  the program needs.\n" +
"*/\n" +
"\n" +
"#define M_TOP_PAD              -2\n" +
"\n" +
"#ifndef DEFAULT_TOP_PAD\n" +
"#define DEFAULT_TOP_PAD        (0)\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  M_MMAP_THRESHOLD is the request size threshold for using mmap()\n" +
"  to service a request. Requests of at least this size that cannot\n" +
"  be allocated using already-existing space will be serviced via mmap.\n" +
"  (If enough normal freed space already exists it is used instead.)\n" +
"\n" +
"  Using mmap segregates relatively large chunks of memory so that\n" +
"  they can be individually obtained and released from the host\n" +
"  system. A request serviced through mmap is never reused by any\n" +
"  other request (at least not directly; the system may just so\n" +
"  happen to remap successive requests to the same locations).\n" +
"\n" +
"  Segregating space in this way has the benefits that:\n" +
"\n" +
"   1. Mmapped space can ALWAYS be individually released back\n" +
"      to the system, which helps keep the system level memory\n" +
"      demands of a long-lived program low.\n" +
"   2. Mapped memory can never become `locked' between\n" +
"      other chunks, as can happen with normally allocated chunks, which\n" +
"      means that even trimming via malloc_trim would not release them.\n" +
"   3. On some systems with \"holes\" in address spaces, mmap can obtain\n" +
"      memory that sbrk cannot.\n" +
"\n" +
"  However, it has the disadvantages that:\n" +
"\n" +
"   1. The space cannot be reclaimed, consolidated, and then\n" +
"      used to service later requests, as happens with normal chunks.\n" +
"   2. It can lead to more wastage because of mmap page alignment\n" +
"      requirements\n" +
"   3. It causes malloc performance to be more dependent on host\n" +
"      system memory management support routines which may vary in\n" +
"      implementation quality and may impose arbitrary\n" +
"      limitations. Generally, servicing a request via normal\n" +
"      malloc steps is faster than going through a system's mmap.\n" +
"\n" +
"  The advantages of mmap nearly always outweigh disadvantages for\n" +
"  \"large\" chunks, but the value of \"large\" varies across systems.  The\n" +
"  default is an empirically derived value that works well in most\n" +
"  systems.\n" +
"*/\n" +
"\n" +
"#define M_MMAP_THRESHOLD      -3\n" +
"\n" +
"#ifndef DEFAULT_MMAP_THRESHOLD\n" +
"#define DEFAULT_MMAP_THRESHOLD (256 * 1024)\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  M_MMAP_MAX is the maximum number of requests to simultaneously\n" +
"  service using mmap. This parameter exists because\n" +
". Some systems have a limited number of internal tables for\n" +
"  use by mmap, and using more than a few of them may degrade\n" +
"  performance.\n" +
"\n" +
"  The default is set to a value that serves only as a safeguard.\n" +
"  Setting to 0 disables use of mmap for servicing large requests.  If\n" +
"  HAVE_MMAP is not set, the default value is 0, and attempts to set it\n" +
"  to non-zero values in mallopt will fail.\n" +
"*/\n" +
"\n" +
"#define M_MMAP_MAX             -4\n" +
"\n") +
("#ifndef DEFAULT_MMAP_MAX\n" +
"#if HAVE_MMAP\n" +
"#define DEFAULT_MMAP_MAX       (65536)\n" +
"#else\n" +
"#define DEFAULT_MMAP_MAX       (0)\n" +
"#endif\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  ========================================================================\n" +
"  To make a fully customizable malloc.h header file, cut everything\n" +
"  above this line, put into file malloc.h, edit to suit, and #include it\n" +
"  on the next line, as well as in programs that use this malloc.\n" +
"  ========================================================================\n" +
"*/\n" +
"\n" +
"/* #include \"malloc.h\" */\n" +
"\n" +
"/* --------------------- public wrappers ---------------------- */\n" +
"\n" +
"#ifdef USE_PUBLIC_MALLOC_WRAPPERS\n" +
"\n" +
"/* Declare all routines as internal */\n" +
"#if __STD_C\n" +
"static Void_t*  mALLOc(size_t);\n" +
"static void     fREe(Void_t*);\n" +
"static Void_t*  rEALLOc(Void_t*, size_t);\n" +
"static Void_t*  mEMALIGn(size_t, size_t);\n" +
"static Void_t*  vALLOc(size_t);\n" +
"static Void_t*  pVALLOc(size_t);\n" +
"static Void_t*  cALLOc(size_t, size_t);\n" +
"static Void_t** iCALLOc(size_t, size_t, Void_t**);\n" +
"static Void_t** iCOMALLOc(size_t, size_t*, Void_t**);\n" +
"static void     cFREe(Void_t*);\n" +
"static int      mTRIm(size_t);\n" +
"static size_t   mUSABLe(Void_t*);\n" +
"static void     mSTATs();\n" +
"static int      mALLOPt(int, int);\n" +
"static struct mallinfo mALLINFo(void);\n" +
"#else\n" +
"static Void_t*  mALLOc();\n" +
"static void     fREe();\n" +
"static Void_t*  rEALLOc();\n" +
"static Void_t*  mEMALIGn();\n" +
"static Void_t*  vALLOc();\n" +
"static Void_t*  pVALLOc();\n" +
"static Void_t*  cALLOc();\n" +
"static Void_t** iCALLOc();\n" +
"static Void_t** iCOMALLOc();\n" +
"static void     cFREe();\n" +
"static int      mTRIm();\n" +
"static size_t   mUSABLe();\n" +
"static void     mSTATs();\n" +
"static int      mALLOPt();\n" +
"static struct mallinfo mALLINFo();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  MALLOC_PREACTION and MALLOC_POSTACTION should be\n" +
"  defined to return 0 on success, and nonzero on failure.\n" +
"  The return value of MALLOC_POSTACTION is currently ignored\n" +
"  in wrapper functions since there is no reasonable default\n" +
"  action to take on failure.\n" +
"*/\n" +
"\n" +
"\n" +
"#ifdef USE_MALLOC_LOCK\n" +
"\n" +
"#ifdef WIN32\n" +
"\n" +
"static int mALLOC_MUTEx;\n" +
"#define MALLOC_PREACTION   slwait(&mALLOC_MUTEx)\n" +
"#define MALLOC_POSTACTION  slrelease(&mALLOC_MUTEx)\n" +
"\n" +
"#else\n" +
"\n" +
"#include <pthread.h>\n" +
"\n" +
"static pthread_mutex_t mALLOC_MUTEx = PTHREAD_MUTEX_INITIALIZER;\n" +
"\n" +
"#define MALLOC_PREACTION   pthread_mutex_lock(&mALLOC_MUTEx)\n" +
"#define MALLOC_POSTACTION  pthread_mutex_unlock(&mALLOC_MUTEx)\n" +
"\n" +
"#endif /* USE_MALLOC_LOCK */\n" +
"\n" +
"#else\n" +
"\n" +
"/* Substitute anything you like for these */\n" +
"\n" +
"#define MALLOC_PREACTION   (0)\n" +
"#define MALLOC_POSTACTION  (0)\n" +
"\n" +
"#endif\n" +
"\n" +
"Void_t* public_mALLOc(size_t bytes) {\n" +
"  Void_t* m;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  m = mALLOc(bytes);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"\n" +
"static pthread_once_t free_mutex_once = PTHREAD_ONCE_INIT;\n" +
"static pthread_mutex_t free_mutex;\n" +
"static int scheduled_free_size;\n" +
"static int scheduled_free_capacity;\n" +
"static int scheduled_free_list;\n" +
"bool free_is_scheduled;\n" +
"\n" +
"static void initialize_scheduled_free_list()\n" +
"{\n" +
"    pthread_mutex_init(&free_mutex, NULL);\n" +
"}\n" +
"\n" +
"static void drain_scheduled_free_list()\n" +
"{\n" +
"    pthread_mutex_lock(&free_mutex);\n" +
"    if (free_is_scheduled) {\n" +
"        for(int i = 0; i < scheduled_free_size; i++) {\n" +
"            main_thread_free(scheduled_free_list[i]);\n" +
"        }\n" +
"        free(scheduled_free_list);\n" +
"        scheduled_free_list = NULL;\n" +
"        scheduled_free_size = 0;\n" +
"        scheduled_free_capacity = 0;\n" +
"        free_is_scheduled = false;\n" +
"    }\n" +
"    pthread_mutex_unlock(&free_mutex);\n" +
"}\n" +
"\n" +
"static void schedule_free_on_main_thread(Void_t* m)\n" +
"{\n" +
"    pthread_once(&free_mutex_once, initialize_scheduled_free_list);\n" +
"\n" +
"    pthread_mutex_lock(&free_mutex);\n" +
"    if (scheduled_free_size == scheduled_free_capacity) {\n" +
"        scheduled_free_capacity = scheduled_free_capacity == 0 ? 16 : scheduled_free_capacity * 1.2;\n" +
"        scheduled_free_list = (Void_t**)realloc(scheduled_free_list, sizeof(Void_t*) * scheduled_free_capacity);\n" +
"    }\n" +
"    scheduled_free_list[scheduled_free_size++] = m;\n" +
"    if (!free_is_scheduled) {\n" +
"        QTimer::immediateSingleShotOnMainThread(0, drain_scheduled_free_list);\n" +
"        free_is_scheduled = true;\n" +
"    }\n" +
"    pthread_mutex_unlock(&free_mutex);\n" +
"}\n") +
("\n" +
"void public_fREe(Void_t* m) {\n" +
"  if (!pthread_main_np()) {\n" +
"      schedule_free_on_main_thread(m);\n" +
"      return;\n" +
"  }\n" +
"\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return;\n" +
"  }\n" +
"  fREe(m);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"}\n" +
"\n" +
"Void_t* public_rEALLOc(Void_t* m, size_t bytes) {\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  m = rEALLOc(m, bytes);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"Void_t* public_mEMALIGn(size_t alignment, size_t bytes) {\n" +
"  Void_t* m;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  m = mEMALIGn(alignment, bytes);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"Void_t* public_vALLOc(size_t bytes) {\n" +
"  Void_t* m;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  m = vALLOc(bytes);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"Void_t* public_pVALLOc(size_t bytes) {\n" +
"  Void_t* m;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  m = pVALLOc(bytes);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"Void_t* public_cALLOc(size_t n, size_t elem_size) {\n" +
"  Void_t* m;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  m = cALLOc(n, elem_size);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"\n" +
"Void_t** public_iCALLOc(size_t n, size_t elem_size, Void_t** chunks) {\n" +
"  Void_t** m;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  m = iCALLOc(n, elem_size, chunks);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"Void_t** public_iCOMALLOc(size_t n, size_t sizes[], Void_t** chunks) {\n" +
"  Void_t** m;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  m = iCOMALLOc(n, sizes, chunks);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"void public_cFREe(Void_t* m) {\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return;\n" +
"  }\n" +
"  cFREe(m);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"}\n" +
"\n" +
"int public_mTRIm(size_t s) {\n" +
"  int result;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  result = mTRIm(s);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return result;\n" +
"}\n" +
"\n" +
"size_t public_mUSABLe(Void_t* m) {\n" +
"  size_t result;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  result = mUSABLe(m);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return result;\n" +
"}\n" +
"\n" +
"void public_mSTATs() {\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return;\n" +
"  }\n" +
"  mSTATs();\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"}\n" +
"\n" +
"struct mallinfo public_mALLINFo() {\n" +
"  struct mallinfo m;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    struct mallinfo nm = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };\n" +
"    return nm;\n" +
"  }\n" +
"  m = mALLINFo();\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return m;\n" +
"}\n" +
"\n" +
"int public_mALLOPt(int p, int v) {\n" +
"  int result;\n" +
"  if (MALLOC_PREACTION != 0) {\n" +
"    return 0;\n" +
"  }\n" +
"  result = mALLOPt(p, v);\n" +
"  if (MALLOC_POSTACTION != 0) {\n" +
"  }\n" +
"  return result;\n" +
"}\n" +
"\n") +
("#endif\n" +
"\n" +
"\n" +
"\n" +
"/* ------------- Optional versions of memcopy ---------------- */\n" +
"\n" +
"\n" +
"#if USE_MEMCPY\n" +
"\n" +
"/*\n" +
"  Note: memcpy is ONLY invoked with non-overlapping regions,\n" +
"  so the (usually slower) memmove is not needed.\n" +
"*/\n" +
"\n" +
"#define MALLOC_COPY(dest, src, nbytes)  memcpy(dest, src, nbytes)\n" +
"#define MALLOC_ZERO(dest, nbytes)       memset(dest, 0,   nbytes)\n" +
"\n" +
"#else /* !USE_MEMCPY */\n" +
"\n" +
"/* Use Duff's device for good zeroing/copying performance. */\n" +
"\n" +
"#define MALLOC_ZERO(charp, nbytes)                                            \\n" +
"do {                                                                          \\n" +
"  INTERNAL_SIZE_T* mzp = (INTERNAL_SIZE_T*)(charp);                           \\n" +
"  CHUNK_SIZE_T  mctmp = (nbytes)/sizeof(INTERNAL_SIZE_T);                     \\n" +
"  long mcn;                                                                   \\n" +
"  if (mctmp < 8) mcn = 0; else { mcn = (mctmp-1)/8; mctmp %= 8; }             \\n" +
"  switch (mctmp) {                                                            \\n" +
"    case 0: for(;;) { *mzp++ = 0;                                             \\n" +
"    case 7:           *mzp++ = 0;                                             \\n" +
"    case 6:           *mzp++ = 0;                                             \\n" +
"    case 5:           *mzp++ = 0;                                             \\n" +
"    case 4:           *mzp++ = 0;                                             \\n" +
"    case 3:           *mzp++ = 0;                                             \\n" +
"    case 2:           *mzp++ = 0;                                             \\n" +
"    case 1:           *mzp++ = 0; if(mcn <= 0) break; mcn--; }                \\n" +
"  }                                                                           \\n" +
"} while(0)\n" +
"\n" +
"#define MALLOC_COPY(dest,src,nbytes)                                          \\n" +
"do {                                                                          \\n" +
"  INTERNAL_SIZE_T* mcsrc = (INTERNAL_SIZE_T*) src;                            \\n" +
"  INTERNAL_SIZE_T* mcdst = (INTERNAL_SIZE_T*) dest;                           \\n" +
"  CHUNK_SIZE_T  mctmp = (nbytes)/sizeof(INTERNAL_SIZE_T);                     \\n" +
"  long mcn;                                                                   \\n" +
"  if (mctmp < 8) mcn = 0; else { mcn = (mctmp-1)/8; mctmp %= 8; }             \\n" +
"  switch (mctmp) {                                                            \\n" +
"    case 0: for(;;) { *mcdst++ = *mcsrc++;                                    \\n" +
"    case 7:           *mcdst++ = *mcsrc++;                                    \\n" +
"    case 6:           *mcdst++ = *mcsrc++;                                    \\n" +
"    case 5:           *mcdst++ = *mcsrc++;                                    \\n" +
"    case 4:           *mcdst++ = *mcsrc++;                                    \\n" +
"    case 3:           *mcdst++ = *mcsrc++;                                    \\n" +
"    case 2:           *mcdst++ = *mcsrc++;                                    \\n" +
"    case 1:           *mcdst++ = *mcsrc++; if(mcn <= 0) break; mcn--; }       \\n" +
"  }                                                                           \\n" +
"} while(0)\n" +
"\n" +
"#endif\n" +
"\n" +
"/* ------------------ MMAP support ------------------  */\n" +
"\n" +
"\n" +
"#if HAVE_MMAP\n" +
"\n" +
"#ifndef LACKS_FCNTL_H\n" +
"#include <fcntl.h>\n" +
"#endif\n" +
"\n" +
"#ifndef LACKS_SYS_MMAN_H\n" +
"#include <sys/mman.h>\n" +
"#endif\n" +
"\n" +
"#if !defined(MAP_ANONYMOUS) && defined(MAP_ANON)\n" +
"#define MAP_ANONYMOUS MAP_ANON\n" +
"#endif\n" +
"\n" +
"/*\n" +
"   Nearly all versions of mmap support MAP_ANONYMOUS,\n" +
"   so the following is unlikely to be needed, but is\n" +
"   supplied just in case.\n" +
"*/\n" +
"\n" +
"#ifndef MAP_ANONYMOUS\n" +
"\n" +
"static int dev_zero_fd = -1; /* Cached file descriptor for /dev/zero. */\n" +
"\n" +
"#define MMAP(addr, size, prot, flags) ((dev_zero_fd < 0) ? \\n" +
" (dev_zero_fd = open(\"/dev/zero\", O_RDWR), \\n" +
"  mmap((addr), (size), (prot), (flags), dev_zero_fd, 0)) : \\n" +
"   mmap((addr), (size), (prot), (flags), dev_zero_fd, 0))\n" +
"\n" +
"#else\n" +
"\n" +
"#define MMAP(addr, size, prot, flags) \\n" +
" (mmap((addr), (size), (prot), (flags)|MAP_ANONYMOUS, -1, 0))\n" +
"\n" +
"#endif\n" +
"\n" +
"\n" +
"#endif /* HAVE_MMAP */\n" +
"\n" +
"\n" +
"/*\n" +
"  -----------------------  Chunk representations -----------------------\n" +
"*/\n" +
"\n" +
"\n" +
"/*\n" +
"  This struct declaration is misleading (but accurate and necessary).\n" +
"  It declares a \"view\" into memory allowing access to necessary\n" +
"  fields at known offsets from a given base. See explanation below.\n" +
"*/\n" +
"\n" +
"struct malloc_chunk {\n" +
"\n" +
"  INTERNAL_SIZE_T      prev_size;  /* Size of previous chunk (if free).  */\n" +
"  INTERNAL_SIZE_T      size;       /* Size in bytes, including overhead. */\n" +
"\n" +
"  struct malloc_chunk* fd;         /* double links -- used only if free. */\n" +
"  struct malloc_chunk* bk;\n" +
"};\n" +
"\n" +
"\n" +
"typedef struct malloc_chunk* mchunkptr;\n" +
"\n" +
"/*\n" +
"   malloc_chunk details:\n" +
"\n" +
"    (The following includes lightly edited explanations by Colin Plumb.)\n" +
"\n" +
"    Chunks of memory are maintained using a `boundary tag' method as\n" +
"    described in e.g., Knuth or Standish.  (See the paper by Paul\n" +
"    Wilson ftp://ftp.cs.utexas.edu/pub/garbage/allocsrv.ps for a\n" +
"    survey of such techniques.)  Sizes of free chunks are stored both\n" +
"    in the front of each chunk and at the end.  This makes\n" +
"    consolidating fragmented chunks into bigger chunks very fast.  The\n" +
"    size fields also hold bits representing whether chunks are free or\n" +
"    in use.\n" +
"\n" +
"    An allocated chunk looks like this:\n" +
"\n" +
"\n" +
"    chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"            |             Size of previous chunk, if allocated            | |\n" +
"            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"            |             Size of chunk, in bytes                         |P|\n" +
"      mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"            |             User data starts here...                          .\n" +
"            .                                                               .\n" +
"            .             (malloc_usable_space() bytes)                     .\n" +
"            .                                                               |\n" +
"nextchunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"            |             Size of chunk                                     |\n" +
"            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"\n") +
("\n" +
"    Where \"chunk\" is the front of the chunk for the purpose of most of\n" +
"    the malloc code, but \"mem\" is the pointer that is returned to the\n" +
"    user.  \"Nextchunk\" is the beginning of the next contiguous chunk.\n" +
"\n" +
"    Chunks always begin on even word boundries, so the mem portion\n" +
"    (which is returned to the user) is also on an even word boundary, and\n" +
"    thus at least double-word aligned.\n" +
"\n" +
"    Free chunks are stored in circular doubly-linked lists, and look like this:\n" +
"\n" +
"    chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"            |             Size of previous chunk                            |\n" +
"            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"    `head:' |             Size of chunk, in bytes                         |P|\n" +
"      mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"            |             Forward pointer to next chunk in list             |\n" +
"            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"            |             Back pointer to previous chunk in list            |\n" +
"            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"            |             Unused space (may be 0 bytes long)                .\n" +
"            .                                                               .\n" +
"            .                                                               |\n" +
"nextchunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"    `foot:' |             Size of chunk, in bytes                           |\n" +
"            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n" +
"\n" +
"    The P (PREV_INUSE) bit, stored in the unused low-order bit of the\n" +
"    chunk size (which is always a multiple of two words), is an in-use\n" +
"    bit for the *previous* chunk.  If that bit is *clear*, then the\n" +
"    word before the current chunk size contains the previous chunk\n" +
"    size, and can be used to find the front of the previous chunk.\n" +
"    The very first chunk allocated always has this bit set,\n" +
"    preventing access to non-existent (or non-owned) memory. If\n" +
"    prev_inuse is set for any given chunk, then you CANNOT determine\n" +
"    the size of the previous chunk, and might even get a memory\n" +
"    addressing fault when trying to do so.\n" +
"\n" +
"    Note that the `foot' of the current chunk is actually represented\n" +
"    as the prev_size of the NEXT chunk. This makes it easier to\n" +
"    deal with alignments etc but can be very confusing when trying\n" +
"    to extend or adapt this code.\n" +
"\n" +
"    The two exceptions to all this are\n" +
"\n" +
"     1. The special chunk `top' doesn't bother using the\n" +
"        trailing size field since there is no next contiguous chunk\n" +
"        that would have to index off it. After initialization, `top'\n" +
"        is forced to always exist.  If it would become less than\n" +
"        MINSIZE bytes long, it is replenished.\n" +
"\n" +
"     2. Chunks allocated via mmap, which have the second-lowest-order\n" +
"        bit (IS_MMAPPED) set in their size fields.  Because they are\n" +
"        allocated one-by-one, each must contain its own trailing size field.\n" +
"\n" +
"*/\n" +
"\n" +
"/*\n" +
"  ---------- Size and alignment checks and conversions ----------\n" +
"*/\n" +
"\n" +
"/* conversion from malloc headers to user pointers, and back */\n" +
"\n" +
"#define chunk2mem(p)   ((Void_t*)((char*)(p) + 2*SIZE_SZ))\n" +
"#define mem2chunk(mem) ((mchunkptr)((char*)(mem) - 2*SIZE_SZ))\n" +
"\n" +
"/* The smallest possible chunk */\n" +
"#define MIN_CHUNK_SIZE        (sizeof(struct malloc_chunk))\n" +
"\n" +
"/* The smallest size we can malloc is an aligned minimal chunk */\n" +
"\n" +
"#define MINSIZE  \\n" +
"  (CHUNK_SIZE_T)(((MIN_CHUNK_SIZE+MALLOC_ALIGN_MASK) & ~MALLOC_ALIGN_MASK))\n" +
"\n" +
"/* Check if m has acceptable alignment */\n" +
"\n" +
"#define aligned_OK(m)  (((PTR_UINT)((m)) & (MALLOC_ALIGN_MASK)) == 0)\n" +
"\n" +
"\n" +
"/*\n" +
"   Check if a request is so large that it would wrap around zero when\n" +
"   padded and aligned. To simplify some other code, the bound is made\n" +
"   low enough so that adding MINSIZE will also not wrap around sero.\n" +
"*/\n" +
"\n" +
"#define REQUEST_OUT_OF_RANGE(req)                                 \\n" +
"  ((CHUNK_SIZE_T)(req) >=                                        \\n" +
"   (CHUNK_SIZE_T)(INTERNAL_SIZE_T)(-2 * MINSIZE))\n" +
"\n" +
"/* pad request bytes into a usable size -- internal version */\n" +
"\n" +
"#define request2size(req)                                         \\n" +
"  (((req) + SIZE_SZ + MALLOC_ALIGN_MASK < MINSIZE)  ?             \\n" +
"   MINSIZE :                                                      \\n" +
"   ((req) + SIZE_SZ + MALLOC_ALIGN_MASK) & ~MALLOC_ALIGN_MASK)\n" +
"\n" +
"/*  Same, except also perform argument check */\n" +
"\n" +
"#define checked_request2size(req, sz)                             \\n" +
"  if (REQUEST_OUT_OF_RANGE(req)) {                                \\n" +
"    MALLOC_FAILURE_ACTION;                                        \\n" +
"    return 0;                                                     \\n" +
"  }                                                               \\n" +
"  (sz) = request2size(req);\n" +
"\n" +
"/*\n" +
"  --------------- Physical chunk operations ---------------\n" +
"*/\n" +
"\n" +
"\n" +
"/* size field is or'ed with PREV_INUSE when previous adjacent chunk in use */\n" +
"#define PREV_INUSE 0x1\n" +
"\n" +
"/* extract inuse bit of previous chunk */\n" +
"#define prev_inuse(p)       ((p)->size & PREV_INUSE)\n" +
"\n" +
"\n" +
"/* size field is or'ed with IS_MMAPPED if the chunk was obtained with mmap() */\n" +
"#define IS_MMAPPED 0x2\n" +
"\n" +
"/* check for mmap()'ed chunk */\n" +
"#define chunk_is_mmapped(p) ((p)->size & IS_MMAPPED)\n" +
"\n" +
"/*\n" +
"  Bits to mask off when extracting size\n" +
"\n" +
"  Note: IS_MMAPPED is intentionally not masked off from size field in\n" +
"  macros for which mmapped chunks should never be seen. This should\n" +
"  cause helpful core dumps to occur if it is tried by accident by\n" +
"  people extending or adapting this malloc.\n" +
"*/\n" +
"#define SIZE_BITS (PREV_INUSE|IS_MMAPPED)\n" +
"\n" +
"/* Get size, ignoring use bits */\n" +
"#define chunksize(p)         ((p)->size & ~(SIZE_BITS))\n" +
"\n" +
"\n" +
"/* Ptr to next physical malloc_chunk. */\n" +
"#define next_chunk(p) ((mchunkptr)( ((char*)(p)) + ((p)->size & ~PREV_INUSE) ))\n" +
"\n" +
"/* Ptr to previous physical malloc_chunk */\n" +
"#define prev_chunk(p) ((mchunkptr)( ((char*)(p)) - ((p)->prev_size) ))\n" +
"\n" +
"/* Treat space at ptr + offset as a chunk */\n" +
"#define chunk_at_offset(p, s)  ((mchunkptr)(((char*)(p)) + (s)))\n" +
"\n" +
"/* extract p's inuse bit */\n" +
"#define inuse(p)\\n" +
"((((mchunkptr)(((char*)(p))+((p)->size & ~PREV_INUSE)))->size) & PREV_INUSE)\n" +
"\n" +
"/* set/clear chunk as being inuse without otherwise disturbing */\n" +
"#define set_inuse(p)\\n" +
"((mchunkptr)(((char*)(p)) + ((p)->size & ~PREV_INUSE)))->size |= PREV_INUSE\n" +
"\n") +
("#define clear_inuse(p)\\n" +
"((mchunkptr)(((char*)(p)) + ((p)->size & ~PREV_INUSE)))->size &= ~(PREV_INUSE)\n" +
"\n" +
"\n" +
"/* check/set/clear inuse bits in known places */\n" +
"#define inuse_bit_at_offset(p, s)\\n" +
" (((mchunkptr)(((char*)(p)) + (s)))->size & PREV_INUSE)\n" +
"\n" +
"#define set_inuse_bit_at_offset(p, s)\\n" +
" (((mchunkptr)(((char*)(p)) + (s)))->size |= PREV_INUSE)\n" +
"\n" +
"#define clear_inuse_bit_at_offset(p, s)\\n" +
" (((mchunkptr)(((char*)(p)) + (s)))->size &= ~(PREV_INUSE))\n" +
"\n" +
"\n" +
"/* Set size at head, without disturbing its use bit */\n" +
"#define set_head_size(p, s)  ((p)->size = (((p)->size & PREV_INUSE) | (s)))\n" +
"\n" +
"/* Set size/use field */\n" +
"#define set_head(p, s)       ((p)->size = (s))\n" +
"\n" +
"/* Set size at footer (only when chunk is not in use) */\n" +
"#define set_foot(p, s)       (((mchunkptr)((char*)(p) + (s)))->prev_size = (s))\n" +
"\n" +
"\n" +
"/*\n" +
"  -------------------- Internal data structures --------------------\n" +
"\n" +
"   All internal state is held in an instance of malloc_state defined\n" +
"   below. There are no other static variables, except in two optional\n" +
"   cases:\n" +
"   * If USE_MALLOC_LOCK is defined, the mALLOC_MUTEx declared above.\n" +
"   * If HAVE_MMAP is true, but mmap doesn't support\n" +
"     MAP_ANONYMOUS, a dummy file descriptor for mmap.\n" +
"\n" +
"   Beware of lots of tricks that minimize the total bookkeeping space\n" +
"   requirements. The result is a little over 1K bytes (for 4byte\n" +
"   pointers and size_t.)\n" +
"*/\n" +
"\n" +
"/*\n" +
"  Bins\n" +
"\n" +
"    An array of bin headers for free chunks. Each bin is doubly\n" +
"    linked.  The bins are approximately proportionally (log) spaced.\n" +
"    There are a lot of these bins (128). This may look excessive, but\n" +
"    works very well in practice.  Most bins hold sizes that are\n" +
"    unusual as malloc request sizes, but are more usual for fragments\n" +
"    and consolidated sets of chunks, which is what these bins hold, so\n" +
"    they can be found quickly.  All procedures maintain the invariant\n" +
"    that no consolidated chunk physically borders another one, so each\n" +
"    chunk in a list is known to be preceded and followed by either\n" +
"    inuse chunks or the ends of memory.\n" +
"\n" +
"    Chunks in bins are kept in size order, with ties going to the\n" +
"    approximately least recently used chunk. Ordering isn't needed\n" +
"    for the small bins, which all contain the same-sized chunks, but\n" +
"    facilitates best-fit allocation for larger chunks. These lists\n" +
"    are just sequential. Keeping them in order almost never requires\n" +
"    enough traversal to warrant using fancier ordered data\n" +
"    structures.\n" +
"\n" +
"    Chunks of the same size are linked with the most\n" +
"    recently freed at the front, and allocations are taken from the\n" +
"    back.  This results in LRU (FIFO) allocation order, which tends\n" +
"    to give each chunk an equal opportunity to be consolidated with\n" +
"    adjacent freed chunks, resulting in larger free chunks and less\n" +
"    fragmentation.\n" +
"\n" +
"    To simplify use in double-linked lists, each bin header acts\n" +
"    as a malloc_chunk. This avoids special-casing for headers.\n" +
"    But to conserve space and improve locality, we allocate\n" +
"    only the fd/bk pointers of bins, and then use repositioning tricks\n" +
"    to treat these as the fields of a malloc_chunk*.\n" +
"*/\n" +
"\n" +
"typedef struct malloc_chunk* mbinptr;\n" +
"\n" +
"/* addressing -- note that bin_at(0) does not exist */\n" +
"#define bin_at(m, i) ((mbinptr)((char*)&((m)->bins[(i)<<1]) - (SIZE_SZ<<1)))\n" +
"\n" +
"/* analog of ++bin */\n" +
"#define next_bin(b)  ((mbinptr)((char*)(b) + (sizeof(mchunkptr)<<1)))\n" +
"\n" +
"/* Reminders about list directionality within bins */\n" +
"#define first(b)     ((b)->fd)\n" +
"#define last(b)      ((b)->bk)\n" +
"\n" +
"/* Take a chunk off a bin list */\n" +
"#define unlink(P, BK, FD) {                                            \\n" +
"  FD = P->fd;                                                          \\n" +
"  BK = P->bk;                                                          \\n" +
"  FD->bk = BK;                                                         \\n" +
"  BK->fd = FD;                                                         \\n" +
"}\n" +
"\n" +
"/*\n" +
"  Indexing\n" +
"\n" +
"    Bins for sizes < 512 bytes contain chunks of all the same size, spaced\n" +
"    8 bytes apart. Larger bins are approximately logarithmically spaced:\n" +
"\n" +
"    64 bins of size       8\n" +
"    32 bins of size      64\n" +
"    16 bins of size     512\n" +
"     8 bins of size    4096\n" +
"     4 bins of size   32768\n" +
"     2 bins of size  262144\n" +
"     1 bin  of size what's left\n" +
"\n" +
"    The bins top out around 1MB because we expect to service large\n" +
"    requests via mmap.\n" +
"*/\n" +
"\n" +
"#define NBINS              96\n" +
"#define NSMALLBINS         32\n" +
"#define SMALLBIN_WIDTH      8\n" +
"#define MIN_LARGE_SIZE    256\n" +
"\n" +
"#define in_smallbin_range(sz)  \\n" +
"  ((CHUNK_SIZE_T)(sz) < (CHUNK_SIZE_T)MIN_LARGE_SIZE)\n" +
"\n" +
"#define smallbin_index(sz)     (((unsigned)(sz)) >> 3)\n" +
"\n" +
"/*\n" +
"  Compute index for size. We expect this to be inlined when\n" +
"  compiled with optimization, else not, which works out well.\n" +
"*/\n" +
"static int largebin_index(unsigned int sz) {\n" +
"  unsigned int  x = sz >> SMALLBIN_WIDTH;\n" +
"  unsigned int m;            /* bit position of highest set bit of m */\n" +
"\n" +
"  if (x >= 0x10000) return NBINS-1;\n" +
"\n" +
"  /* On intel, use BSRL instruction to find highest bit */\n" +
"#if defined(__GNUC__) && defined(i386)\n" +
"\n" +
"  __asm__(\"bsrl %1,%0\\n\\t\"\n" +
"          : \"=r\" (m)\n" +
"          : \"g\"  (x));\n" +
"\n" +
"#else\n" +
"  {\n" +
"    /*\n" +
"      Based on branch-free nlz algorithm in chapter 5 of Henry\n" +
"      S. Warren Jr's book \"Hacker's Delight\".\n" +
"    */\n" +
"\n" +
"    unsigned int n = ((x - 0x100) >> 16) & 8;\n" +
"    x <<= n;\n" +
"    m = ((x - 0x1000) >> 16) & 4;\n" +
"    n += m;\n" +
"    x <<= m;\n" +
"    m = ((x - 0x4000) >> 16) & 2;\n" +
"    n += m;\n" +
"    x = (x << m) >> 14;\n" +
"    m = 13 - n + (x & ~(x>>1));\n" +
"  }\n" +
"#endif\n" +
"\n") +
(
"  /* Use next 2 bits to create finer-granularity bins */\n" +
"  return NSMALLBINS + (m << 2) + ((sz >> (m + 6)) & 3);\n" +
"}\n" +
"\n" +
"#define bin_index(sz) \\n" +
" ((in_smallbin_range(sz)) ? smallbin_index(sz) : largebin_index(sz))\n" +
"\n" +
"/*\n" +
"  FIRST_SORTED_BIN_SIZE is the chunk size corresponding to the\n" +
"  first bin that is maintained in sorted order. This must\n" +
"  be the smallest size corresponding to a given bin.\n" +
"\n" +
"  Normally, this should be MIN_LARGE_SIZE. But you can weaken\n" +
"  best fit guarantees to sometimes speed up malloc by increasing value.\n" +
"  Doing this means that malloc may choose a chunk that is\n" +
"  non-best-fitting by up to the width of the bin.\n" +
"\n" +
"  Some useful cutoff values:\n" +
"      512 - all bins sorted\n" +
"     2560 - leaves bins <=     64 bytes wide unsorted\n" +
"    12288 - leaves bins <=    512 bytes wide unsorted\n" +
"    65536 - leaves bins <=   4096 bytes wide unsorted\n" +
"   262144 - leaves bins <=  32768 bytes wide unsorted\n" +
"       -1 - no bins sorted (not recommended!)\n" +
"*/\n" +
"\n" +
"#define FIRST_SORTED_BIN_SIZE MIN_LARGE_SIZE\n" +
"/* #define FIRST_SORTED_BIN_SIZE 65536 */\n" +
"\n" +
"/*\n" +
"  Unsorted chunks\n" +
"\n" +
"    All remainders from chunk splits, as well as all returned chunks,\n" +
"    are first placed in the \"unsorted\" bin. They are then placed\n" +
"    in regular bins after malloc gives them ONE chance to be used before\n" +
"    binning. So, basically, the unsorted_chunks list acts as a queue,\n" +
"    with chunks being placed on it in free (and malloc_consolidate),\n" +
"    and taken off (to be either used or placed in bins) in malloc.\n" +
"*/\n" +
"\n" +
"/* The otherwise unindexable 1-bin is used to hold unsorted chunks. */\n" +
"#define unsorted_chunks(M)          (bin_at(M, 1))\n" +
"\n" +
"/*\n" +
"  Top\n" +
"\n" +
"    The top-most available chunk (i.e., the one bordering the end of\n" +
"    available memory) is treated specially. It is never included in\n" +
"    any bin, is used only if no other chunk is available, and is\n" +
"    released back to the system if it is very large (see\n" +
"    M_TRIM_THRESHOLD).  Because top initially\n" +
"    points to its own bin with initial zero size, thus forcing\n" +
"    extension on the first malloc request, we avoid having any special\n" +
"    code in malloc to check whether it even exists yet. But we still\n" +
"    need to do so when getting memory from system, so we make\n" +
"    initial_top treat the bin as a legal but unusable chunk during the\n" +
"    interval between initialization and the first call to\n" +
"    sYSMALLOc. (This is somewhat delicate, since it relies on\n" +
"    the 2 preceding words to be zero during this interval as well.)\n" +
"*/\n" +
"\n" +
"/* Conveniently, the unsorted bin can be used as dummy top on first call */\n" +
"#define initial_top(M)              (unsorted_chunks(M))\n" +
"\n" +
"/*\n" +
"  Binmap\n" +
"\n" +
"    To help compensate for the large number of bins, a one-level index\n" +
"    structure is used for bin-by-bin searching.  `binmap' is a\n" +
"    bitvector recording whether bins are definitely empty so they can\n" +
"    be skipped over during during traversals.  The bits are NOT always\n" +
"    cleared as soon as bins are empty, but instead only\n" +
"    when they are noticed to be empty during traversal in malloc.\n" +
"*/\n" +
"\n" +
"/* Conservatively use 32 bits per map word, even if on 64bit system */\n" +
"#define BINMAPSHIFT      5\n" +
"#define BITSPERMAP       (1U << BINMAPSHIFT)\n" +
"#define BINMAPSIZE       (NBINS / BITSPERMAP)\n" +
"\n" +
"#define idx2block(i)     ((i) >> BINMAPSHIFT)\n" +
"#define idx2bit(i)       ((1U << ((i) & ((1U << BINMAPSHIFT)-1))))\n" +
"\n" +
"#define mark_bin(m,i)    ((m)->binmap[idx2block(i)] |=  idx2bit(i))\n" +
"#define unmark_bin(m,i)  ((m)->binmap[idx2block(i)] &= ~(idx2bit(i)))\n" +
"#define get_binmap(m,i)  ((m)->binmap[idx2block(i)] &   idx2bit(i))\n" +
"\n" +
"/*\n" +
"  Fastbins\n" +
"\n" +
"    An array of lists holding recently freed small chunks.  Fastbins\n" +
"    are not doubly linked.  It is faster to single-link them, and\n" +
"    since chunks are never removed from the middles of these lists,\n" +
"    double linking is not necessary. Also, unlike regular bins, they\n" +
"    are not even processed in FIFO order (they use faster LIFO) since\n" +
"    ordering doesn't much matter in the transient contexts in which\n" +
"    fastbins are normally used.\n" +
"\n" +
"    Chunks in fastbins keep their inuse bit set, so they cannot\n" +
"    be consolidated with other free chunks. malloc_consolidate\n" +
"    releases all chunks in fastbins and consolidates them with\n" +
"    other free chunks.\n" +
"*/\n" +
"\n" +
"typedef struct malloc_chunk* mfastbinptr;\n" +
"\n" +
"/* offset 2 to use otherwise unindexable first 2 bins */\n" +
"#define fastbin_index(sz)        ((((unsigned int)(sz)) >> 3) - 2)\n" +
"\n" +
"/* The maximum fastbin request size we support */\n" +
"#define MAX_FAST_SIZE     80\n" +
"\n" +
"#define NFASTBINS  (fastbin_index(request2size(MAX_FAST_SIZE))+1)\n" +
"\n" +
"/*\n" +
"  FASTBIN_CONSOLIDATION_THRESHOLD is the size of a chunk in free()\n" +
"  that triggers automatic consolidation of possibly-surrounding\n" +
"  fastbin chunks. This is a heuristic, so the exact value should not\n" +
"  matter too much. It is defined at half the default trim threshold as a\n" +
"  compromise heuristic to only attempt consolidation if it is likely\n" +
"  to lead to trimming. However, it is not dynamically tunable, since\n" +
"  consolidation reduces fragmentation surrounding loarge chunks even\n" +
"  if trimming is not used.\n" +
"*/\n" +
"\n" +
"#define FASTBIN_CONSOLIDATION_THRESHOLD  \\n" +
"  ((unsigned long)(DEFAULT_TRIM_THRESHOLD) >> 1)\n" +
"\n" +
"/*\n" +
"  Since the lowest 2 bits in max_fast don't matter in size comparisons,\n" +
"  they are used as flags.\n" +
"*/\n" +
"\n" +
"/*\n" +
"  ANYCHUNKS_BIT held in max_fast indicates that there may be any\n" +
"  freed chunks at all. It is set true when entering a chunk into any\n" +
"  bin.\n" +
"*/\n" +
"\n" +
"#define ANYCHUNKS_BIT        (1U)\n" +
"\n" +
"#define have_anychunks(M)     (((M)->max_fast &  ANYCHUNKS_BIT))\n" +
"#define set_anychunks(M)      ((M)->max_fast |=  ANYCHUNKS_BIT)\n" +
"#define clear_anychunks(M)    ((M)->max_fast &= ~ANYCHUNKS_BIT)\n" +
"\n" +
"/*\n" +
"  FASTCHUNKS_BIT held in max_fast indicates that there are probably\n" +
"  some fastbin chunks. It is set true on entering a chunk into any\n" +
"  fastbin, and cleared only in malloc_consolidate.\n" +
"*/\n" +
"\n") +
(
"#define FASTCHUNKS_BIT        (2U)\n" +
"\n" +
"#define have_fastchunks(M)   (((M)->max_fast &  FASTCHUNKS_BIT))\n" +
"#define set_fastchunks(M)    ((M)->max_fast |=  (FASTCHUNKS_BIT|ANYCHUNKS_BIT))\n" +
"#define clear_fastchunks(M)  ((M)->max_fast &= ~(FASTCHUNKS_BIT))\n" +
"\n" +
"/*\n" +
"   Set value of max_fast.\n" +
"   Use impossibly small value if 0.\n" +
"*/\n" +
"\n" +
"#define set_max_fast(M, s) \\n" +
"  (M)->max_fast = (((s) == 0)? SMALLBIN_WIDTH: request2size(s)) | \\n" +
"  ((M)->max_fast &  (FASTCHUNKS_BIT|ANYCHUNKS_BIT))\n" +
"\n" +
"#define get_max_fast(M) \\n" +
"  ((M)->max_fast & ~(FASTCHUNKS_BIT | ANYCHUNKS_BIT))\n" +
"\n" +
"\n" +
"/*\n" +
"  morecore_properties is a status word holding dynamically discovered\n" +
"  or controlled properties of the morecore function\n" +
"*/\n" +
"\n" +
"#define MORECORE_CONTIGUOUS_BIT  (1U)\n" +
"\n" +
"#define contiguous(M) \\n" +
"        (((M)->morecore_properties &  MORECORE_CONTIGUOUS_BIT))\n" +
"#define noncontiguous(M) \\n" +
"        (((M)->morecore_properties &  MORECORE_CONTIGUOUS_BIT) == 0)\n" +
"#define set_contiguous(M) \\n" +
"        ((M)->morecore_properties |=  MORECORE_CONTIGUOUS_BIT)\n" +
"#define set_noncontiguous(M) \\n" +
"        ((M)->morecore_properties &= ~MORECORE_CONTIGUOUS_BIT)\n" +
"\n" +
"\n" +
"/*\n" +
"   ----------- Internal state representation and initialization -----------\n" +
"*/\n" +
"\n" +
"struct malloc_state {\n" +
"\n" +
"  /* The maximum chunk size to be eligible for fastbin */\n" +
"  INTERNAL_SIZE_T  max_fast;   /* low 2 bits used as flags */\n" +
"\n" +
"  /* Fastbins */\n" +
"  mfastbinptr      fastbins[NFASTBINS];\n" +
"\n" +
"  /* Base of the topmost chunk -- not otherwise kept in a bin */\n" +
"  mchunkptr        top;\n" +
"\n" +
"  /* The remainder from the most recent split of a small request */\n" +
"  mchunkptr        last_remainder;\n" +
"\n" +
"  /* Normal bins packed as described above */\n" +
"  mchunkptr        bins[NBINS * 2];\n" +
"\n" +
"  /* Bitmap of bins. Trailing zero map handles cases of largest binned size */\n" +
"  unsigned int     binmap[BINMAPSIZE+1];\n" +
"\n" +
"  /* Tunable parameters */\n" +
"  CHUNK_SIZE_T     trim_threshold;\n" +
"  INTERNAL_SIZE_T  top_pad;\n" +
"  INTERNAL_SIZE_T  mmap_threshold;\n" +
"\n" +
"  /* Memory map support */\n" +
"  int              n_mmaps;\n" +
"  int              n_mmaps_max;\n" +
"  int              max_n_mmaps;\n" +
"\n" +
"  /* Cache malloc_getpagesize */\n" +
"  unsigned int     pagesize;\n" +
"\n" +
"  /* Track properties of MORECORE */\n" +
"  unsigned int     morecore_properties;\n" +
"\n" +
"  /* Statistics */\n" +
"  INTERNAL_SIZE_T  mmapped_mem;\n" +
"  INTERNAL_SIZE_T  sbrked_mem;\n" +
"  INTERNAL_SIZE_T  max_sbrked_mem;\n" +
"  INTERNAL_SIZE_T  max_mmapped_mem;\n" +
"  INTERNAL_SIZE_T  max_total_mem;\n" +
"};\n" +
"\n" +
"typedef struct malloc_state *mstate;\n" +
"\n" +
"/*\n" +
"   There is exactly one instance of this struct in this malloc.\n" +
"   If you are adapting this malloc in a way that does NOT use a static\n" +
"   malloc_state, you MUST explicitly zero-fill it before using. This\n" +
"   malloc relies on the property that malloc_state is initialized to\n" +
"   all zeroes (as is true of C statics).\n" +
"*/\n" +
"\n" +
"static struct malloc_state av_;  /* never directly referenced */\n" +
"\n" +
"/*\n" +
"   All uses of av_ are via get_malloc_state().\n" +
"   At most one \"call\" to get_malloc_state is made per invocation of\n" +
"   the public versions of malloc and free, but other routines\n" +
"   that in turn invoke malloc and/or free may call more than once.\n" +
"   Also, it is called in check* routines if DEBUG is set.\n" +
"*/\n" +
"\n" +
"#define get_malloc_state() (&(av_))\n" +
"\n" +
"/*\n" +
"  Initialize a malloc_state struct.\n" +
"\n" +
"  This is called only from within malloc_consolidate, which needs\n" +
"  be called in the same contexts anyway.  It is never called directly\n" +
"  outside of malloc_consolidate because some optimizing compilers try\n" +
"  to inline it at all call points, which turns out not to be an\n" +
"  optimization at all. (Inlining it in malloc_consolidate is fine though.)\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"static void malloc_init_state(mstate av)\n" +
"#else\n" +
"static void malloc_init_state(av) mstate av;\n" +
"#endif\n" +
"{\n" +
"  int     i;\n" +
"  mbinptr bin;\n" +
"\n" +
"  /* Establish circular links for normal bins */\n" +
"  for (i = 1; i < NBINS; ++i) {\n" +
"    bin = bin_at(av,i);\n" +
"    bin->fd = bin->bk = bin;\n" +
"  }\n" +
"\n" +
"  av->top_pad        = DEFAULT_TOP_PAD;\n" +
"  av->n_mmaps_max    = DEFAULT_MMAP_MAX;\n" +
"  av->mmap_threshold = DEFAULT_MMAP_THRESHOLD;\n" +
"  av->trim_threshold = DEFAULT_TRIM_THRESHOLD;\n" +
"\n" +
"#if MORECORE_CONTIGUOUS\n" +
"  set_contiguous(av);\n" +
"#else\n" +
"  set_noncontiguous(av);\n" +
"#endif\n" +
"\n" +
"\n" +
"  set_max_fast(av, DEFAULT_MXFAST);\n" +
"\n" +
"  av->top            = initial_top(av);\n" +
"  av->pagesize       = malloc_getpagesize;\n" +
"}\n" +
"\n" +
"/*\n" +
"   Other internal utilities operating on mstates\n" +
"*/\n" +
"\n") +
(
"#if __STD_C\n" +
"static Void_t*  sYSMALLOc(INTERNAL_SIZE_T, mstate);\n" +
"#ifndef MORECORE_CANNOT_TRIM\n" +
"static int      sYSTRIm(size_t, mstate);\n" +
"#endif\n" +
"static void     malloc_consolidate(mstate);\n" +
"static Void_t** iALLOc(size_t, size_t*, int, Void_t**);\n" +
"#else\n" +
"static Void_t*  sYSMALLOc();\n" +
"static int      sYSTRIm();\n" +
"static void     malloc_consolidate();\n" +
"static Void_t** iALLOc();\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  Debugging support\n" +
"\n" +
"  These routines make a number of assertions about the states\n" +
"  of data structures that should be true at all times. If any\n" +
"  are not true, it's very likely that a user program has somehow\n" +
"  trashed memory. (It's also possible that there is a coding error\n" +
"  in malloc. In which case, please report it!)\n" +
"*/\n" +
"\n" +
"#if ! DEBUG\n" +
"\n" +
"#define check_chunk(P)\n" +
"#define check_free_chunk(P)\n" +
"#define check_inuse_chunk(P)\n" +
"#define check_remalloced_chunk(P,N)\n" +
"#define check_malloced_chunk(P,N)\n" +
"#define check_malloc_state()\n" +
"\n" +
"#else\n" +
"#define check_chunk(P)              do_check_chunk(P)\n" +
"#define check_free_chunk(P)         do_check_free_chunk(P)\n" +
"#define check_inuse_chunk(P)        do_check_inuse_chunk(P)\n" +
"#define check_remalloced_chunk(P,N) do_check_remalloced_chunk(P,N)\n" +
"#define check_malloced_chunk(P,N)   do_check_malloced_chunk(P,N)\n" +
"#define check_malloc_state()        do_check_malloc_state()\n" +
"\n" +
"/*\n" +
"  Properties of all chunks\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"static void do_check_chunk(mchunkptr p)\n" +
"#else\n" +
"static void do_check_chunk(p) mchunkptr p;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"  CHUNK_SIZE_T  sz = chunksize(p);\n" +
"  /* min and max possible addresses assuming contiguous allocation */\n" +
"  char* max_address = (char*)(av->top) + chunksize(av->top);\n" +
"  char* min_address = max_address - av->sbrked_mem;\n" +
"\n" +
"  if (!chunk_is_mmapped(p)) {\n" +
"\n" +
"    /* Has legal address ... */\n" +
"    if (p != av->top) {\n" +
"      if (contiguous(av)) {\n" +
"        assert(((char*)p) >= min_address);\n" +
"        assert(((char*)p + sz) <= ((char*)(av->top)));\n" +
"      }\n" +
"    }\n" +
"    else {\n" +
"      /* top size is always at least MINSIZE */\n" +
"      assert((CHUNK_SIZE_T)(sz) >= MINSIZE);\n" +
"      /* top predecessor always marked inuse */\n" +
"      assert(prev_inuse(p));\n" +
"    }\n" +
"\n" +
"  }\n" +
"  else {\n" +
"#if HAVE_MMAP\n" +
"    /* address is outside main heap  */\n" +
"    if (contiguous(av) && av->top != initial_top(av)) {\n" +
"      assert(((char*)p) < min_address || ((char*)p) > max_address);\n" +
"    }\n" +
"    /* chunk is page-aligned */\n" +
"    assert(((p->prev_size + sz) & (av->pagesize-1)) == 0);\n" +
"    /* mem is aligned */\n" +
"    assert(aligned_OK(chunk2mem(p)));\n" +
"#else\n" +
"    /* force an appropriate assert violation if debug set */\n" +
"    assert(!chunk_is_mmapped(p));\n" +
"#endif\n" +
"  }\n" +
"}\n" +
"\n" +
"/*\n" +
"  Properties of free chunks\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"static void do_check_free_chunk(mchunkptr p)\n" +
"#else\n" +
"static void do_check_free_chunk(p) mchunkptr p;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"\n" +
"  INTERNAL_SIZE_T sz = p->size & ~PREV_INUSE;\n" +
"  mchunkptr next = chunk_at_offset(p, sz);\n" +
"\n" +
"  do_check_chunk(p);\n" +
"\n" +
"  /* Chunk must claim to be free ... */\n" +
"  assert(!inuse(p));\n" +
"  assert (!chunk_is_mmapped(p));\n" +
"\n" +
"  /* Unless a special marker, must have OK fields */\n" +
"  if ((CHUNK_SIZE_T)(sz) >= MINSIZE)\n" +
"  {\n" +
"    assert((sz & MALLOC_ALIGN_MASK) == 0);\n" +
"    assert(aligned_OK(chunk2mem(p)));\n" +
"    /* ... matching footer field */\n" +
"    assert(next->prev_size == sz);\n" +
"    /* ... and is fully consolidated */\n" +
"    assert(prev_inuse(p));\n" +
"    assert (next == av->top || inuse(next));\n" +
"\n" +
"    /* ... and has minimally sensible links */\n" +
"    assert(p->fd->bk == p);\n" +
"    assert(p->bk->fd == p);\n" +
"  }\n" +
"  else /* markers are always of size SIZE_SZ */\n" +
"    assert(sz == SIZE_SZ);\n" +
"}\n" +
"\n" +
"/*\n" +
"  Properties of inuse chunks\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"static void do_check_inuse_chunk(mchunkptr p)\n" +
"#else\n" +
"static void do_check_inuse_chunk(p) mchunkptr p;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"  mchunkptr next;\n" +
"  do_check_chunk(p);\n" +
"\n" +
"  if (chunk_is_mmapped(p))\n" +
"    return; /* mmapped chunks have no next/prev */\n" +
"\n" +
"  /* Check whether it claims to be in use ... */\n" +
"  assert(inuse(p));\n" +
"\n") +
(
"  next = next_chunk(p);\n" +
"\n" +
"  /* ... and is surrounded by OK chunks.\n" +
"    Since more things can be checked with free chunks than inuse ones,\n" +
"    if an inuse chunk borders them and debug is on, it's worth doing them.\n" +
"  */\n" +
"  if (!prev_inuse(p))  {\n" +
"    /* Note that we cannot even look at prev unless it is not inuse */\n" +
"    mchunkptr prv = prev_chunk(p);\n" +
"    assert(next_chunk(prv) == p);\n" +
"    do_check_free_chunk(prv);\n" +
"  }\n" +
"\n" +
"  if (next == av->top) {\n" +
"    assert(prev_inuse(next));\n" +
"    assert(chunksize(next) >= MINSIZE);\n" +
"  }\n" +
"  else if (!inuse(next))\n" +
"    do_check_free_chunk(next);\n" +
"}\n" +
"\n" +
"/*\n" +
"  Properties of chunks recycled from fastbins\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"static void do_check_remalloced_chunk(mchunkptr p, INTERNAL_SIZE_T s)\n" +
"#else\n" +
"static void do_check_remalloced_chunk(p, s) mchunkptr p; INTERNAL_SIZE_T s;\n" +
"#endif\n" +
"{\n" +
"  INTERNAL_SIZE_T sz = p->size & ~PREV_INUSE;\n" +
"\n" +
"  do_check_inuse_chunk(p);\n" +
"\n" +
"  /* Legal size ... */\n" +
"  assert((sz & MALLOC_ALIGN_MASK) == 0);\n" +
"  assert((CHUNK_SIZE_T)(sz) >= MINSIZE);\n" +
"  /* ... and alignment */\n" +
"  assert(aligned_OK(chunk2mem(p)));\n" +
"  /* chunk is less than MINSIZE more than request */\n" +
"  assert((long)(sz) - (long)(s) >= 0);\n" +
"  assert((long)(sz) - (long)(s + MINSIZE) < 0);\n" +
"}\n" +
"\n" +
"/*\n" +
"  Properties of nonrecycled chunks at the point they are malloced\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"static void do_check_malloced_chunk(mchunkptr p, INTERNAL_SIZE_T s)\n" +
"#else\n" +
"static void do_check_malloced_chunk(p, s) mchunkptr p; INTERNAL_SIZE_T s;\n" +
"#endif\n" +
"{\n" +
"  /* same as recycled case ... */\n" +
"  do_check_remalloced_chunk(p, s);\n" +
"\n" +
"  /*\n" +
"    ... plus,  must obey implementation invariant that prev_inuse is\n" +
"    always true of any allocated chunk; i.e., that each allocated\n" +
"    chunk borders either a previously allocated and still in-use\n" +
"    chunk, or the base of its memory arena. This is ensured\n" +
"    by making all allocations from the the `lowest' part of any found\n" +
"    chunk.  This does not necessarily hold however for chunks\n" +
"    recycled via fastbins.\n" +
"  */\n" +
"\n" +
"  assert(prev_inuse(p));\n" +
"}\n" +
"\n" +
"\n" +
"/*\n" +
"  Properties of malloc_state.\n" +
"\n" +
"  This may be useful for debugging malloc, as well as detecting user\n" +
"  programmer errors that somehow write into malloc_state.\n" +
"\n" +
"  If you are extending or experimenting with this malloc, you can\n" +
"  probably figure out how to hack this routine to print out or\n" +
"  display chunk addresses, sizes, bins, and other instrumentation.\n" +
"*/\n" +
"\n" +
"static void do_check_malloc_state()\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"  unsigned int i;\n" +
"  mchunkptr p;\n" +
"  mchunkptr q;\n" +
"  mbinptr b;\n" +
"  unsigned int binbit;\n" +
"  int empty;\n" +
"  unsigned int idx;\n" +
"  INTERNAL_SIZE_T size;\n" +
"  CHUNK_SIZE_T  total = 0;\n" +
"  int max_fast_bin;\n" +
"\n" +
"  /* internal size_t must be no wider than pointer type */\n" +
"  assert(sizeof(INTERNAL_SIZE_T) <= sizeof(char*));\n" +
"\n" +
"  /* alignment is a power of 2 */\n" +
"  assert((MALLOC_ALIGNMENT & (MALLOC_ALIGNMENT-1)) == 0);\n" +
"\n" +
"  /* cannot run remaining checks until fully initialized */\n" +
"  if (av->top == 0 || av->top == initial_top(av))\n" +
"    return;\n" +
"\n" +
"  /* pagesize is a power of 2 */\n" +
"  assert((av->pagesize & (av->pagesize-1)) == 0);\n" +
"\n" +
"  /* properties of fastbins */\n" +
"\n" +
"  /* max_fast is in allowed range */\n" +
"  assert(get_max_fast(av) <= request2size(MAX_FAST_SIZE));\n" +
"\n" +
"  max_fast_bin = fastbin_index(av->max_fast);\n" +
"\n" +
"  for (i = 0; i < NFASTBINS; ++i) {\n" +
"    p = av->fastbins[i];\n" +
"\n" +
"    /* all bins past max_fast are empty */\n" +
"    if (i > max_fast_bin)\n" +
"      assert(p == 0);\n" +
"\n" +
"    while (p != 0) {\n" +
"      /* each chunk claims to be inuse */\n" +
"      do_check_inuse_chunk(p);\n" +
"      total += chunksize(p);\n" +
"      /* chunk belongs in this bin */\n" +
"      assert(fastbin_index(chunksize(p)) == i);\n" +
"      p = p->fd;\n" +
"    }\n" +
"  }\n" +
"\n" +
"  if (total != 0)\n" +
"    assert(have_fastchunks(av));\n" +
"  else if (!have_fastchunks(av))\n" +
"    assert(total == 0);\n" +
"\n" +
"  /* check normal bins */\n" +
"  for (i = 1; i < NBINS; ++i) {\n" +
"    b = bin_at(av,i);\n" +
"\n" +
"    /* binmap is accurate (except for bin 1 == unsorted_chunks) */\n" +
"    if (i >= 2) {\n" +
"      binbit = get_binmap(av,i);\n" +
"      empty = last(b) == b;\n" +
"      if (!binbit)\n" +
"        assert(empty);\n" +
"      else if (!empty)\n" +
"        assert(binbit);\n" +
"    }\n" +
"\n") +
(
"    for (p = last(b); p != b; p = p->bk) {\n" +
"      /* each chunk claims to be free */\n" +
"      do_check_free_chunk(p);\n" +
"      size = chunksize(p);\n" +
"      total += size;\n" +
"      if (i >= 2) {\n" +
"        /* chunk belongs in bin */\n" +
"        idx = bin_index(size);\n" +
"        assert(idx == i);\n" +
"        /* lists are sorted */\n" +
"        if ((CHUNK_SIZE_T) size >= (CHUNK_SIZE_T)(FIRST_SORTED_BIN_SIZE)) {\n" +
"          assert(p->bk == b ||\n" +
"                 (CHUNK_SIZE_T)chunksize(p->bk) >=\n" +
"                 (CHUNK_SIZE_T)chunksize(p));\n" +
"        }\n" +
"      }\n" +
"      /* chunk is followed by a legal chain of inuse chunks */\n" +
"      for (q = next_chunk(p);\n" +
"           (q != av->top && inuse(q) &&\n" +
"             (CHUNK_SIZE_T)(chunksize(q)) >= MINSIZE);\n" +
"           q = next_chunk(q))\n" +
"        do_check_inuse_chunk(q);\n" +
"    }\n" +
"  }\n" +
"\n" +
"  /* top chunk is OK */\n" +
"  check_chunk(av->top);\n" +
"\n" +
"  /* sanity checks for statistics */\n" +
"\n" +
"  assert(total <= (CHUNK_SIZE_T)(av->max_total_mem));\n" +
"  assert(av->n_mmaps >= 0);\n" +
"  assert(av->n_mmaps <= av->max_n_mmaps);\n" +
"\n" +
"  assert((CHUNK_SIZE_T)(av->sbrked_mem) <=\n" +
"         (CHUNK_SIZE_T)(av->max_sbrked_mem));\n" +
"\n" +
"  assert((CHUNK_SIZE_T)(av->mmapped_mem) <=\n" +
"         (CHUNK_SIZE_T)(av->max_mmapped_mem));\n" +
"\n" +
"  assert((CHUNK_SIZE_T)(av->max_total_mem) >=\n" +
"         (CHUNK_SIZE_T)(av->mmapped_mem) + (CHUNK_SIZE_T)(av->sbrked_mem));\n" +
"}\n" +
"#endif\n" +
"\n" +
"\n" +
"/* ----------- Routines dealing with system allocation -------------- */\n" +
"\n" +
"/*\n" +
"  sysmalloc handles malloc cases requiring more memory from the system.\n" +
"  On entry, it is assumed that av->top does not have enough\n" +
"  space to service request for nb bytes, thus requiring that av->top\n" +
"  be extended or replaced.\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"static Void_t* sYSMALLOc(INTERNAL_SIZE_T nb, mstate av)\n" +
"#else\n" +
"static Void_t* sYSMALLOc(nb, av) INTERNAL_SIZE_T nb; mstate av;\n" +
"#endif\n" +
"{\n" +
"  mchunkptr       old_top;        /* incoming value of av->top */\n" +
"  INTERNAL_SIZE_T old_size;       /* its size */\n" +
"  char*           old_end;        /* its end address */\n" +
"\n" +
"  long            size;           /* arg to first MORECORE or mmap call */\n" +
"  char*           brk;            /* return value from MORECORE */\n" +
"\n" +
"  long            correction;     /* arg to 2nd MORECORE call */\n" +
"  char*           snd_brk;        /* 2nd return val */\n" +
"\n" +
"  INTERNAL_SIZE_T front_misalign; /* unusable bytes at front of new space */\n" +
"  INTERNAL_SIZE_T end_misalign;   /* partial page left at end of new space */\n" +
"  char*           aligned_brk;    /* aligned offset into brk */\n" +
"\n" +
"  mchunkptr       p;              /* the allocated/returned chunk */\n" +
"  mchunkptr       remainder;      /* remainder from allocation */\n" +
"  CHUNK_SIZE_T    remainder_size; /* its size */\n" +
"\n" +
"  CHUNK_SIZE_T    sum;            /* for updating stats */\n" +
"\n" +
"  size_t          pagemask  = av->pagesize - 1;\n" +
"\n" +
"  /*\n" +
"    If there is space available in fastbins, consolidate and retry\n" +
"    malloc from scratch rather than getting memory from system.  This\n" +
"    can occur only if nb is in smallbin range so we didn't consolidate\n" +
"    upon entry to malloc. It is much easier to handle this case here\n" +
"    than in malloc proper.\n" +
"  */\n" +
"\n" +
"  if (have_fastchunks(av)) {\n" +
"    assert(in_smallbin_range(nb));\n" +
"    malloc_consolidate(av);\n" +
"    return mALLOc(nb - MALLOC_ALIGN_MASK);\n" +
"  }\n" +
"\n" +
"\n" +
"#if HAVE_MMAP\n" +
"\n" +
"  /*\n" +
"    If have mmap, and the request size meets the mmap threshold, and\n" +
"    the system supports mmap, and there are few enough currently\n" +
"    allocated mmapped regions, try to directly map this request\n" +
"    rather than expanding top.\n" +
"  */\n" +
"\n" +
"  if ((CHUNK_SIZE_T)(nb) >= (CHUNK_SIZE_T)(av->mmap_threshold) &&\n" +
"      (av->n_mmaps < av->n_mmaps_max)) {\n" +
"\n" +
"    char* mm;             /* return value from mmap call*/\n" +
"\n" +
"    /*\n" +
"      Round up size to nearest page.  For mmapped chunks, the overhead\n" +
"      is one SIZE_SZ unit larger than for normal chunks, because there\n" +
"      is no following chunk whose prev_size field could be used.\n" +
"    */\n" +
"    size = (nb + SIZE_SZ + MALLOC_ALIGN_MASK + pagemask) & ~pagemask;\n" +
"\n" +
"    /* Don't try if size wraps around 0 */\n" +
"    if ((CHUNK_SIZE_T)(size) > (CHUNK_SIZE_T)(nb)) {\n" +
"\n" +
"      mm = (char*)(MMAP(0, size, PROT_READ|PROT_WRITE, MAP_PRIVATE));\n" +
"\n" +
"      if (mm != (char*)(MORECORE_FAILURE)) {\n" +
"\n" +
"        /*\n" +
"          The offset to the start of the mmapped region is stored\n" +
"          in the prev_size field of the chunk. This allows us to adjust\n" +
"          returned start address to meet alignment requirements here\n" +
"          and in memalign(), and still be able to compute proper\n" +
"          address argument for later munmap in free() and realloc().\n" +
"        */\n" +
"\n" +
"        front_misalign = (INTERNAL_SIZE_T)chunk2mem(mm) & MALLOC_ALIGN_MASK;\n" +
"        if (front_misalign > 0) {\n" +
"          correction = MALLOC_ALIGNMENT - front_misalign;\n" +
"          p = (mchunkptr)(mm + correction);\n" +
"          p->prev_size = correction;\n" +
"          set_head(p, (size - correction) |IS_MMAPPED);\n" +
"        }\n" +
"        else {\n" +
"          p = (mchunkptr)mm;\n" +
"          p->prev_size = 0;\n" +
"          set_head(p, size|IS_MMAPPED);\n" +
"        }\n" +
"\n" +
"        /* update statistics */\n" +
"\n" +
"        if (++av->n_mmaps > av->max_n_mmaps)\n" +
"          av->max_n_mmaps = av->n_mmaps;\n" +
"\n") +
(
"        sum = av->mmapped_mem += size;\n" +
"        if (sum > (CHUNK_SIZE_T)(av->max_mmapped_mem))\n" +
"          av->max_mmapped_mem = sum;\n" +
"        sum += av->sbrked_mem;\n" +
"        if (sum > (CHUNK_SIZE_T)(av->max_total_mem))\n" +
"          av->max_total_mem = sum;\n" +
"\n" +
"        check_chunk(p);\n" +
"\n" +
"        return chunk2mem(p);\n" +
"      }\n" +
"    }\n" +
"  }\n" +
"#endif\n" +
"\n" +
"  /* Record incoming configuration of top */\n" +
"\n" +
"  old_top  = av->top;\n" +
"  old_size = chunksize(old_top);\n" +
"  old_end  = (char*)(chunk_at_offset(old_top, old_size));\n" +
"\n" +
"  brk = snd_brk = (char*)(MORECORE_FAILURE);\n" +
"\n" +
"  /*\n" +
"     If not the first time through, we require old_size to be\n" +
"     at least MINSIZE and to have prev_inuse set.\n" +
"  */\n" +
"\n" +
"  assert((old_top == initial_top(av) && old_size == 0) ||\n" +
"         ((CHUNK_SIZE_T) (old_size) >= MINSIZE &&\n" +
"          prev_inuse(old_top)));\n" +
"\n" +
"  /* Precondition: not enough current space to satisfy nb request */\n" +
"  assert((CHUNK_SIZE_T)(old_size) < (CHUNK_SIZE_T)(nb + MINSIZE));\n" +
"\n" +
"  /* Precondition: all fastbins are consolidated */\n" +
"  assert(!have_fastchunks(av));\n" +
"\n" +
"\n" +
"  /* Request enough space for nb + pad + overhead */\n" +
"\n" +
"  size = nb + av->top_pad + MINSIZE;\n" +
"\n" +
"  /*\n" +
"    If contiguous, we can subtract out existing space that we hope to\n" +
"    combine with new space. We add it back later only if\n" +
"    we don't actually get contiguous space.\n" +
"  */\n" +
"\n" +
"  if (contiguous(av))\n" +
"    size -= old_size;\n" +
"\n" +
"  /*\n" +
"    Round to a multiple of page size.\n" +
"    If MORECORE is not contiguous, this ensures that we only call it\n" +
"    with whole-page arguments.  And if MORECORE is contiguous and\n" +
"    this is not first time through, this preserves page-alignment of\n" +
"    previous calls. Otherwise, we correct to page-align below.\n" +
"  */\n" +
"\n" +
"  size = (size + pagemask) & ~pagemask;\n" +
"\n" +
"  /*\n" +
"    Don't try to call MORECORE if argument is so big as to appear\n" +
"    negative. Note that since mmap takes size_t arg, it may succeed\n" +
"    below even if we cannot call MORECORE.\n" +
"  */\n" +
"\n" +
"  if (size > 0)\n" +
"    brk = (char*)(MORECORE(size));\n" +
"\n" +
"  /*\n" +
"    If have mmap, try using it as a backup when MORECORE fails or\n" +
"    cannot be used. This is worth doing on systems that have \"holes\" in\n" +
"    address space, so sbrk cannot extend to give contiguous space, but\n" +
"    space is available elsewhere.  Note that we ignore mmap max count\n" +
"    and threshold limits, since the space will not be used as a\n" +
"    segregated mmap region.\n" +
"  */\n" +
"\n" +
"#if HAVE_MMAP\n" +
"  if (brk == (char*)(MORECORE_FAILURE)) {\n" +
"\n" +
"    /* Cannot merge with old top, so add its size back in */\n" +
"    if (contiguous(av))\n" +
"      size = (size + old_size + pagemask) & ~pagemask;\n" +
"\n" +
"    /* If we are relying on mmap as backup, then use larger units */\n" +
"    if ((CHUNK_SIZE_T)(size) < (CHUNK_SIZE_T)(MMAP_AS_MORECORE_SIZE))\n" +
"      size = MMAP_AS_MORECORE_SIZE;\n" +
"\n" +
"    /* Don't try if size wraps around 0 */\n" +
"    if ((CHUNK_SIZE_T)(size) > (CHUNK_SIZE_T)(nb)) {\n" +
"\n" +
"      brk = (char*)(MMAP(0, size, PROT_READ|PROT_WRITE, MAP_PRIVATE));\n" +
"\n" +
"      if (brk != (char*)(MORECORE_FAILURE)) {\n" +
"\n" +
"        /* We do not need, and cannot use, another sbrk call to find end */\n" +
"        snd_brk = brk + size;\n" +
"\n" +
"        /*\n" +
"           Record that we no longer have a contiguous sbrk region.\n" +
"           After the first time mmap is used as backup, we do not\n" +
"           ever rely on contiguous space since this could incorrectly\n" +
"           bridge regions.\n" +
"        */\n" +
"        set_noncontiguous(av);\n" +
"      }\n" +
"    }\n" +
"  }\n" +
"#endif\n" +
"\n" +
"  if (brk != (char*)(MORECORE_FAILURE)) {\n" +
"    av->sbrked_mem += size;\n" +
"\n" +
"    /*\n" +
"      If MORECORE extends previous space, we can likewise extend top size.\n" +
"    */\n" +
"\n" +
"    if (brk == old_end && snd_brk == (char*)(MORECORE_FAILURE)) {\n" +
"      set_head(old_top, (size + old_size) | PREV_INUSE);\n" +
"    }\n" +
"\n" +
"    /*\n" +
"      Otherwise, make adjustments:\n" +
"\n" +
"      * If the first time through or noncontiguous, we need to call sbrk\n" +
"        just to find out where the end of memory lies.\n" +
"\n" +
"      * We need to ensure that all returned chunks from malloc will meet\n" +
"        MALLOC_ALIGNMENT\n" +
"\n" +
"      * If there was an intervening foreign sbrk, we need to adjust sbrk\n" +
"        request size to account for fact that we will not be able to\n" +
"        combine new space with existing space in old_top.\n" +
"\n" +
"      * Almost all systems internally allocate whole pages at a time, in\n" +
"        which case we might as well use the whole last page of request.\n" +
"        So we allocate enough more memory to hit a page boundary now,\n" +
"        which in turn causes future contiguous calls to page-align.\n" +
"    */\n" +
"\n" +
"    else {\n" +
"      front_misalign = 0;\n" +
"      end_misalign = 0;\n" +
"      correction = 0;\n" +
"      aligned_brk = brk;\n" +
"\n") +
(
"      /*\n" +
"        If MORECORE returns an address lower than we have seen before,\n" +
"        we know it isn't really contiguous.  This and some subsequent\n" +
"        checks help cope with non-conforming MORECORE functions and\n" +
"        the presence of \"foreign\" calls to MORECORE from outside of\n" +
"        malloc or by other threads.  We cannot guarantee to detect\n" +
"        these in all cases, but cope with the ones we do detect.\n" +
"      */\n" +
"      if (contiguous(av) && old_size != 0 && brk < old_end) {\n" +
"        set_noncontiguous(av);\n" +
"      }\n" +
"\n" +
"      /* handle contiguous cases */\n" +
"      if (contiguous(av)) {\n" +
"\n" +
"        /*\n" +
"           We can tolerate forward non-contiguities here (usually due\n" +
"           to foreign calls) but treat them as part of our space for\n" +
"           stats reporting.\n" +
"        */\n" +
"        if (old_size != 0)\n" +
"          av->sbrked_mem += brk - old_end;\n" +
"\n" +
"        /* Guarantee alignment of first new chunk made from this space */\n" +
"\n" +
"        front_misalign = (INTERNAL_SIZE_T)chunk2mem(brk) & MALLOC_ALIGN_MASK;\n" +
"        if (front_misalign > 0) {\n" +
"\n" +
"          /*\n" +
"            Skip over some bytes to arrive at an aligned position.\n" +
"            We don't need to specially mark these wasted front bytes.\n" +
"            They will never be accessed anyway because\n" +
"            prev_inuse of av->top (and any chunk created from its start)\n" +
"            is always true after initialization.\n" +
"          */\n" +
"\n" +
"          correction = MALLOC_ALIGNMENT - front_misalign;\n" +
"          aligned_brk += correction;\n" +
"        }\n" +
"\n" +
"        /*\n" +
"          If this isn't adjacent to existing space, then we will not\n" +
"          be able to merge with old_top space, so must add to 2nd request.\n" +
"        */\n" +
"\n" +
"        correction += old_size;\n" +
"\n" +
"        /* Extend the end address to hit a page boundary */\n" +
"        end_misalign = (INTERNAL_SIZE_T)(brk + size + correction);\n" +
"        correction += ((end_misalign + pagemask) & ~pagemask) - end_misalign;\n" +
"\n" +
"        assert(correction >= 0);\n" +
"        snd_brk = (char*)(MORECORE(correction));\n" +
"\n" +
"        if (snd_brk == (char*)(MORECORE_FAILURE)) {\n" +
"          /*\n" +
"            If can't allocate correction, try to at least find out current\n" +
"            brk.  It might be enough to proceed without failing.\n" +
"          */\n" +
"          correction = 0;\n" +
"          snd_brk = (char*)(MORECORE(0));\n" +
"        }\n" +
"        else if (snd_brk < brk) {\n" +
"          /*\n" +
"            If the second call gives noncontiguous space even though\n" +
"            it says it won't, the only course of action is to ignore\n" +
"            results of second call, and conservatively estimate where\n" +
"            the first call left us. Also set noncontiguous, so this\n" +
"            won't happen again, leaving at most one hole.\n" +
"\n" +
"            Note that this check is intrinsically incomplete.  Because\n" +
"            MORECORE is allowed to give more space than we ask for,\n" +
"            there is no reliable way to detect a noncontiguity\n" +
"            producing a forward gap for the second call.\n" +
"          */\n" +
"          snd_brk = brk + size;\n" +
"          correction = 0;\n" +
"          set_noncontiguous(av);\n" +
"        }\n" +
"\n" +
"      }\n" +
"\n" +
"      /* handle non-contiguous cases */\n" +
"      else {\n" +
"        /* MORECORE/mmap must correctly align */\n" +
"        assert(aligned_OK(chunk2mem(brk)));\n" +
"\n" +
"        /* Find out current end of memory */\n" +
"        if (snd_brk == (char*)(MORECORE_FAILURE)) {\n" +
"          snd_brk = (char*)(MORECORE(0));\n" +
"          av->sbrked_mem += snd_brk - brk - size;\n" +
"        }\n" +
"      }\n" +
"\n" +
"      /* Adjust top based on results of second sbrk */\n" +
"      if (snd_brk != (char*)(MORECORE_FAILURE)) {\n" +
"        av->top = (mchunkptr)aligned_brk;\n" +
"        set_head(av->top, (snd_brk - aligned_brk + correction) | PREV_INUSE);\n" +
"        av->sbrked_mem += correction;\n" +
"\n" +
"        /*\n" +
"          If not the first time through, we either have a\n" +
"          gap due to foreign sbrk or a non-contiguous region.  Insert a\n" +
"          double fencepost at old_top to prevent consolidation with space\n" +
"          we don't own. These fenceposts are artificial chunks that are\n" +
"          marked as inuse and are in any case too small to use.  We need\n" +
"          two to make sizes and alignments work out.\n" +
"        */\n" +
"\n" +
"        if (old_size != 0) {\n" +
"          /*\n" +
"             Shrink old_top to insert fenceposts, keeping size a\n" +
"             multiple of MALLOC_ALIGNMENT. We know there is at least\n" +
"             enough space in old_top to do this.\n" +
"          */\n" +
"          old_size = (old_size - 3*SIZE_SZ) & ~MALLOC_ALIGN_MASK;\n" +
"          set_head(old_top, old_size | PREV_INUSE);\n" +
"\n" +
"          /*\n" +
"            Note that the following assignments completely overwrite\n" +
"            old_top when old_size was previously MINSIZE.  This is\n" +
"            intentional. We need the fencepost, even if old_top otherwise gets\n" +
"            lost.\n" +
"          */\n" +
"          chunk_at_offset(old_top, old_size          )->size =\n" +
"            SIZE_SZ|PREV_INUSE;\n" +
"\n" +
"          chunk_at_offset(old_top, old_size + SIZE_SZ)->size =\n" +
"            SIZE_SZ|PREV_INUSE;\n" +
"\n" +
"          /*\n" +
"             If possible, release the rest, suppressing trimming.\n" +
"          */\n" +
"          if (old_size >= MINSIZE) {\n" +
"            INTERNAL_SIZE_T tt = av->trim_threshold;\n" +
"            av->trim_threshold = (INTERNAL_SIZE_T)(-1);\n" +
"            fREe(chunk2mem(old_top));\n" +
"            av->trim_threshold = tt;\n" +
"          }\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"\n" +
"    /* Update statistics */\n" +
"    sum = av->sbrked_mem;\n" +
"    if (sum > (CHUNK_SIZE_T)(av->max_sbrked_mem))\n" +
"      av->max_sbrked_mem = sum;\n" +
"\n") +
(
"    sum += av->mmapped_mem;\n" +
"    if (sum > (CHUNK_SIZE_T)(av->max_total_mem))\n" +
"      av->max_total_mem = sum;\n" +
"\n" +
"    check_malloc_state();\n" +
"\n" +
"    /* finally, do the allocation */\n" +
"\n" +
"    p = av->top;\n" +
"    size = chunksize(p);\n" +
"\n" +
"    /* check that one of the above allocation paths succeeded */\n" +
"    if ((CHUNK_SIZE_T)(size) >= (CHUNK_SIZE_T)(nb + MINSIZE)) {\n" +
"      remainder_size = size - nb;\n" +
"      remainder = chunk_at_offset(p, nb);\n" +
"      av->top = remainder;\n" +
"      set_head(p, nb | PREV_INUSE);\n" +
"      set_head(remainder, remainder_size | PREV_INUSE);\n" +
"      check_malloced_chunk(p, nb);\n" +
"      return chunk2mem(p);\n" +
"    }\n" +
"\n" +
"  }\n" +
"\n" +
"  /* catch all failure paths */\n" +
"  MALLOC_FAILURE_ACTION;\n" +
"  return 0;\n" +
"}\n" +
"\n" +
"\n" +
"\n" +
"\n" +
"/*\n" +
"  sYSTRIm is an inverse of sorts to sYSMALLOc.  It gives memory back\n" +
"  to the system (via negative arguments to sbrk) if there is unused\n" +
"  memory at the `high' end of the malloc pool. It is called\n" +
"  automatically by free() when top space exceeds the trim\n" +
"  threshold. It is also called by the public malloc_trim routine.  It\n" +
"  returns 1 if it actually released any memory, else 0.\n" +
"*/\n" +
"\n" +
"#ifndef MORECORE_CANNOT_TRIM\n" +
"\n" +
"#if __STD_C\n" +
"static int sYSTRIm(size_t pad, mstate av)\n" +
"#else\n" +
"static int sYSTRIm(pad, av) size_t pad; mstate av;\n" +
"#endif\n" +
"{\n" +
"  long  top_size;        /* Amount of top-most memory */\n" +
"  long  extra;           /* Amount to release */\n" +
"  long  released;        /* Amount actually released */\n" +
"  char* current_brk;     /* address returned by pre-check sbrk call */\n" +
"  char* new_brk;         /* address returned by post-check sbrk call */\n" +
"  size_t pagesz;\n" +
"\n" +
"  pagesz = av->pagesize;\n" +
"  top_size = chunksize(av->top);\n" +
"\n" +
"  /* Release in pagesize units, keeping at least one page */\n" +
"  extra = ((top_size - pad - MINSIZE + (pagesz-1)) / pagesz - 1) * pagesz;\n" +
"\n" +
"  if (extra > 0) {\n" +
"\n" +
"    /*\n" +
"      Only proceed if end of memory is where we last set it.\n" +
"      This avoids problems if there were foreign sbrk calls.\n" +
"    */\n" +
"    current_brk = (char*)(MORECORE(0));\n" +
"    if (current_brk == (char*)(av->top) + top_size) {\n" +
"\n" +
"      /*\n" +
"        Attempt to release memory. We ignore MORECORE return value,\n" +
"        and instead call again to find out where new end of memory is.\n" +
"        This avoids problems if first call releases less than we asked,\n" +
"        of if failure somehow altered brk value. (We could still\n" +
"        encounter problems if it altered brk in some very bad way,\n" +
"        but the only thing we can do is adjust anyway, which will cause\n" +
"        some downstream failure.)\n" +
"      */\n" +
"\n" +
"      MORECORE(-extra);\n" +
"      new_brk = (char*)(MORECORE(0));\n" +
"\n" +
"      if (new_brk != (char*)MORECORE_FAILURE) {\n" +
"        released = (long)(current_brk - new_brk);\n" +
"\n" +
"        if (released != 0) {\n" +
"          /* Success. Adjust top. */\n" +
"          av->sbrked_mem -= released;\n" +
"          set_head(av->top, (top_size - released) | PREV_INUSE);\n" +
"          check_malloc_state();\n" +
"          return 1;\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"  }\n" +
"  return 0;\n" +
"}\n" +
"\n" +
"#endif\n" +
"\n" +
"/*\n" +
"  ------------------------------ malloc ------------------------------\n" +
"*/\n" +
"\n" +
"\n" +
"#if __STD_C\n" +
"Void_t* mALLOc(size_t bytes)\n" +
"#else\n" +
"  Void_t* mALLOc(bytes) size_t bytes;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"\n" +
"  INTERNAL_SIZE_T nb;               /* normalized request size */\n" +
"  unsigned int    idx;              /* associated bin index */\n" +
"  mbinptr         bin;              /* associated bin */\n" +
"  mfastbinptr*    fb;               /* associated fastbin */\n" +
"\n" +
"  mchunkptr       victim;           /* inspected/selected chunk */\n" +
"  INTERNAL_SIZE_T size;             /* its size */\n" +
"  int             victim_index;     /* its bin index */\n" +
"\n" +
"  mchunkptr       remainder;        /* remainder from a split */\n" +
"  CHUNK_SIZE_T    remainder_size;   /* its size */\n" +
"\n" +
"  unsigned int    block;            /* bit map traverser */\n" +
"  unsigned int    bit;              /* bit map traverser */\n" +
"  unsigned int    map;              /* current word of binmap */\n" +
"\n" +
"  mchunkptr       fwd;              /* misc temp for linking */\n" +
"  mchunkptr       bck;              /* misc temp for linking */\n" +
"\n" +
"  /*\n" +
"    Convert request size to internal form by adding SIZE_SZ bytes\n" +
"    overhead plus possibly more to obtain necessary alignment and/or\n" +
"    to obtain a size of at least MINSIZE, the smallest allocatable\n" +
"    size. Also, checked_request2size traps (returning 0) request sizes\n" +
"    that are so large that they wrap around zero when padded and\n" +
"    aligned.\n" +
"  */\n" +
"\n" +
"  checked_request2size(bytes, nb);\n" +
"\n" +
"  /*\n" +
"    Bypass search if no frees yet\n" +
"   */\n" +
"  if (!have_anychunks(av)) {\n" +
"    if (av->max_fast == 0) /* initialization check */\n" +
"      malloc_consolidate(av);\n" +
"    goto use_top;\n" +
"  }\n" +
"\n") +
(
"  /*\n" +
"    If the size qualifies as a fastbin, first check corresponding bin.\n" +
"  */\n" +
"\n" +
"  if ((CHUNK_SIZE_T)(nb) <= (CHUNK_SIZE_T)(av->max_fast)) {\n" +
"    fb = &(av->fastbins[(fastbin_index(nb))]);\n" +
"    if ( (victim = *fb) != 0) {\n" +
"      *fb = victim->fd;\n" +
"      check_remalloced_chunk(victim, nb);\n" +
"      return chunk2mem(victim);\n" +
"    }\n" +
"  }\n" +
"\n" +
"  /*\n" +
"    If a small request, check regular bin.  Since these \"smallbins\"\n" +
"    hold one size each, no searching within bins is necessary.\n" +
"    (For a large request, we need to wait until unsorted chunks are\n" +
"    processed to find best fit. But for small ones, fits are exact\n" +
"    anyway, so we can check now, which is faster.)\n" +
"  */\n" +
"\n" +
"  if (in_smallbin_range(nb)) {\n" +
"    idx = smallbin_index(nb);\n" +
"    bin = bin_at(av,idx);\n" +
"\n" +
"    if ( (victim = last(bin)) != bin) {\n" +
"      bck = victim->bk;\n" +
"      set_inuse_bit_at_offset(victim, nb);\n" +
"      bin->bk = bck;\n" +
"      bck->fd = bin;\n" +
"\n" +
"      check_malloced_chunk(victim, nb);\n" +
"      return chunk2mem(victim);\n" +
"    }\n" +
"  }\n" +
"\n" +
"  /*\n" +
"     If this is a large request, consolidate fastbins before continuing.\n" +
"     While it might look excessive to kill all fastbins before\n" +
"     even seeing if there is space available, this avoids\n" +
"     fragmentation problems normally associated with fastbins.\n" +
"     Also, in practice, programs tend to have runs of either small or\n" +
"     large requests, but less often mixtures, so consolidation is not\n" +
"     invoked all that often in most programs. And the programs that\n" +
"     it is called frequently in otherwise tend to fragment.\n" +
"  */\n" +
"\n" +
"  else {\n" +
"    idx = largebin_index(nb);\n" +
"    if (have_fastchunks(av))\n" +
"      malloc_consolidate(av);\n" +
"  }\n" +
"\n" +
"  /*\n" +
"    Process recently freed or remaindered chunks, taking one only if\n" +
"    it is exact fit, or, if this a small request, the chunk is remainder from\n" +
"    the most recent non-exact fit.  Place other traversed chunks in\n" +
"    bins.  Note that this step is the only place in any routine where\n" +
"    chunks are placed in bins.\n" +
"  */\n" +
"\n" +
"  while ( (victim = unsorted_chunks(av)->bk) != unsorted_chunks(av)) {\n" +
"    bck = victim->bk;\n" +
"    size = chunksize(victim);\n" +
"\n" +
"    /*\n" +
"       If a small request, try to use last remainder if it is the\n" +
"       only chunk in unsorted bin.  This helps promote locality for\n" +
"       runs of consecutive small requests. This is the only\n" +
"       exception to best-fit, and applies only when there is\n" +
"       no exact fit for a small chunk.\n" +
"    */\n" +
"\n" +
"    if (in_smallbin_range(nb) &&\n" +
"        bck == unsorted_chunks(av) &&\n" +
"        victim == av->last_remainder &&\n" +
"        (CHUNK_SIZE_T)(size) > (CHUNK_SIZE_T)(nb + MINSIZE)) {\n" +
"\n" +
"      /* split and reattach remainder */\n" +
"      remainder_size = size - nb;\n" +
"      remainder = chunk_at_offset(victim, nb);\n" +
"      unsorted_chunks(av)->bk = unsorted_chunks(av)->fd = remainder;\n" +
"      av->last_remainder = remainder;\n" +
"      remainder->bk = remainder->fd = unsorted_chunks(av);\n" +
"\n" +
"      set_head(victim, nb | PREV_INUSE);\n" +
"      set_head(remainder, remainder_size | PREV_INUSE);\n" +
"      set_foot(remainder, remainder_size);\n" +
"\n" +
"      check_malloced_chunk(victim, nb);\n" +
"      return chunk2mem(victim);\n" +
"    }\n" +
"\n" +
"    /* remove from unsorted list */\n" +
"    unsorted_chunks(av)->bk = bck;\n" +
"    bck->fd = unsorted_chunks(av);\n" +
"\n" +
"    /* Take now instead of binning if exact fit */\n" +
"\n" +
"    if (size == nb) {\n" +
"      set_inuse_bit_at_offset(victim, size);\n" +
"      check_malloced_chunk(victim, nb);\n" +
"      return chunk2mem(victim);\n" +
"    }\n" +
"\n" +
"    /* place chunk in bin */\n" +
"\n" +
"    if (in_smallbin_range(size)) {\n" +
"      victim_index = smallbin_index(size);\n" +
"      bck = bin_at(av, victim_index);\n" +
"      fwd = bck->fd;\n" +
"    }\n" +
"    else {\n" +
"      victim_index = largebin_index(size);\n" +
"      bck = bin_at(av, victim_index);\n" +
"      fwd = bck->fd;\n" +
"\n" +
"      if (fwd != bck) {\n" +
"        /* if smaller than smallest, place first */\n" +
"        if ((CHUNK_SIZE_T)(size) < (CHUNK_SIZE_T)(bck->bk->size)) {\n" +
"          fwd = bck;\n" +
"          bck = bck->bk;\n" +
"        }\n" +
"        else if ((CHUNK_SIZE_T)(size) >=\n" +
"                 (CHUNK_SIZE_T)(FIRST_SORTED_BIN_SIZE)) {\n" +
"\n" +
"          /* maintain large bins in sorted order */\n" +
"          size |= PREV_INUSE; /* Or with inuse bit to speed comparisons */\n" +
"          while ((CHUNK_SIZE_T)(size) < (CHUNK_SIZE_T)(fwd->size))\n" +
"            fwd = fwd->fd;\n" +
"          bck = fwd->bk;\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"\n" +
"    mark_bin(av, victim_index);\n" +
"    victim->bk = bck;\n" +
"    victim->fd = fwd;\n" +
"    fwd->bk = victim;\n" +
"    bck->fd = victim;\n" +
"  }\n" +
"\n" +
"  /*\n" +
"    If a large request, scan through the chunks of current bin to\n" +
"    find one that fits.  (This will be the smallest that fits unless\n" +
"    FIRST_SORTED_BIN_SIZE has been changed from default.)  This is\n" +
"    the only step where an unbounded number of chunks might be\n" +
"    scanned without doing anything useful with them. However the\n" +
"    lists tend to be short.\n" +
"  */\n" +
"\n") +
(
"  if (!in_smallbin_range(nb)) {\n" +
"    bin = bin_at(av, idx);\n" +
"\n" +
"    for (victim = last(bin); victim != bin; victim = victim->bk) {\n" +
"      size = chunksize(victim);\n" +
"\n" +
"      if ((CHUNK_SIZE_T)(size) >= (CHUNK_SIZE_T)(nb)) {\n" +
"        remainder_size = size - nb;\n" +
"        unlink(victim, bck, fwd);\n" +
"\n" +
"        /* Exhaust */\n" +
"        if (remainder_size < MINSIZE)  {\n" +
"          set_inuse_bit_at_offset(victim, size);\n" +
"          check_malloced_chunk(victim, nb);\n" +
"          return chunk2mem(victim);\n" +
"        }\n" +
"        /* Split */\n" +
"        else {\n" +
"          remainder = chunk_at_offset(victim, nb);\n" +
"          unsorted_chunks(av)->bk = unsorted_chunks(av)->fd = remainder;\n" +
"          remainder->bk = remainder->fd = unsorted_chunks(av);\n" +
"          set_head(victim, nb | PREV_INUSE);\n" +
"          set_head(remainder, remainder_size | PREV_INUSE);\n" +
"          set_foot(remainder, remainder_size);\n" +
"          check_malloced_chunk(victim, nb);\n" +
"          return chunk2mem(victim);\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"  }\n" +
"\n" +
"  /*\n" +
"    Search for a chunk by scanning bins, starting with next largest\n" +
"    bin. This search is strictly by best-fit; i.e., the smallest\n" +
"    (with ties going to approximately the least recently used) chunk\n" +
"    that fits is selected.\n" +
"\n" +
"    The bitmap avoids needing to check that most blocks are nonempty.\n" +
"  */\n" +
"\n" +
"  ++idx;\n" +
"  bin = bin_at(av,idx);\n" +
"  block = idx2block(idx);\n" +
"  map = av->binmap[block];\n" +
"  bit = idx2bit(idx);\n" +
"\n" +
"  for (;;) {\n" +
"\n" +
"    /* Skip rest of block if there are no more set bits in this block.  */\n" +
"    if (bit > map || bit == 0) {\n" +
"      do {\n" +
"        if (++block >= BINMAPSIZE)  /* out of bins */\n" +
"          goto use_top;\n" +
"      } while ( (map = av->binmap[block]) == 0);\n" +
"\n" +
"      bin = bin_at(av, (block << BINMAPSHIFT));\n" +
"      bit = 1;\n" +
"    }\n" +
"\n" +
"    /* Advance to bin with set bit. There must be one. */\n" +
"    while ((bit & map) == 0) {\n" +
"      bin = next_bin(bin);\n" +
"      bit <<= 1;\n" +
"      assert(bit != 0);\n" +
"    }\n" +
"\n" +
"    /* Inspect the bin. It is likely to be non-empty */\n" +
"    victim = last(bin);\n" +
"\n" +
"    /*  If a false alarm (empty bin), clear the bit. */\n" +
"    if (victim == bin) {\n" +
"      av->binmap[block] = map &= ~bit; /* Write through */\n" +
"      bin = next_bin(bin);\n" +
"      bit <<= 1;\n" +
"    }\n" +
"\n" +
"    else {\n" +
"      size = chunksize(victim);\n" +
"\n" +
"      /*  We know the first chunk in this bin is big enough to use. */\n" +
"      assert((CHUNK_SIZE_T)(size) >= (CHUNK_SIZE_T)(nb));\n" +
"\n" +
"      remainder_size = size - nb;\n" +
"\n" +
"      /* unlink */\n" +
"      bck = victim->bk;\n" +
"      bin->bk = bck;\n" +
"      bck->fd = bin;\n" +
"\n" +
"      /* Exhaust */\n" +
"      if (remainder_size < MINSIZE) {\n" +
"        set_inuse_bit_at_offset(victim, size);\n" +
"        check_malloced_chunk(victim, nb);\n" +
"        return chunk2mem(victim);\n" +
"      }\n" +
"\n" +
"      /* Split */\n" +
"      else {\n" +
"        remainder = chunk_at_offset(victim, nb);\n" +
"\n" +
"        unsorted_chunks(av)->bk = unsorted_chunks(av)->fd = remainder;\n" +
"        remainder->bk = remainder->fd = unsorted_chunks(av);\n" +
"        /* advertise as last remainder */\n" +
"        if (in_smallbin_range(nb))\n" +
"          av->last_remainder = remainder;\n" +
"\n" +
"        set_head(victim, nb | PREV_INUSE);\n" +
"        set_head(remainder, remainder_size | PREV_INUSE);\n" +
"        set_foot(remainder, remainder_size);\n" +
"        check_malloced_chunk(victim, nb);\n" +
"        return chunk2mem(victim);\n" +
"      }\n" +
"    }\n" +
"  }\n" +
"\n" +
"  use_top:\n" +
"  /*\n" +
"    If large enough, split off the chunk bordering the end of memory\n" +
"    (held in av->top). Note that this is in accord with the best-fit\n" +
"    search rule.  In effect, av->top is treated as larger (and thus\n" +
"    less well fitting) than any other available chunk since it can\n" +
"    be extended to be as large as necessary (up to system\n" +
"    limitations).\n" +
"\n" +
"    We require that av->top always exists (i.e., has size >=\n" +
"    MINSIZE) after initialization, so if it would otherwise be\n" +
"    exhuasted by current request, it is replenished. (The main\n" +
"    reason for ensuring it exists is that we may need MINSIZE space\n" +
"    to put in fenceposts in sysmalloc.)\n" +
"  */\n" +
"\n" +
"  victim = av->top;\n" +
"  size = chunksize(victim);\n" +
"\n" +
"  if ((CHUNK_SIZE_T)(size) >= (CHUNK_SIZE_T)(nb + MINSIZE)) {\n" +
"    remainder_size = size - nb;\n" +
"    remainder = chunk_at_offset(victim, nb);\n" +
"    av->top = remainder;\n" +
"    set_head(victim, nb | PREV_INUSE);\n" +
"    set_head(remainder, remainder_size | PREV_INUSE);\n" +
"\n" +
"    check_malloced_chunk(victim, nb);\n" +
"    return chunk2mem(victim);\n" +
"  }\n" +
"\n" +
"  /*\n" +
"     If no space in top, relay to handle system-dependent cases\n" +
"  */\n" +
"  return sYSMALLOc(nb, av);\n" +
"}\n" +
"\n") +
(
"/*\n" +
"  ------------------------------ free ------------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"void fREe(Void_t* mem)\n" +
"#else\n" +
"void fREe(mem) Void_t* mem;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"\n" +
"  mchunkptr       p;           /* chunk corresponding to mem */\n" +
"  INTERNAL_SIZE_T size;        /* its size */\n" +
"  mfastbinptr*    fb;          /* associated fastbin */\n" +
"  mchunkptr       nextchunk;   /* next contiguous chunk */\n" +
"  INTERNAL_SIZE_T nextsize;    /* its size */\n" +
"  int             nextinuse;   /* true if nextchunk is used */\n" +
"  INTERNAL_SIZE_T prevsize;    /* size of previous contiguous chunk */\n" +
"  mchunkptr       bck;         /* misc temp for linking */\n" +
"  mchunkptr       fwd;         /* misc temp for linking */\n" +
"\n" +
"  /* free(0) has no effect */\n" +
"  if (mem != 0) {\n" +
"    p = mem2chunk(mem);\n" +
"    size = chunksize(p);\n" +
"\n" +
"    check_inuse_chunk(p);\n" +
"\n" +
"    /*\n" +
"      If eligible, place chunk on a fastbin so it can be found\n" +
"      and used quickly in malloc.\n" +
"    */\n" +
"\n" +
"    if ((CHUNK_SIZE_T)(size) <= (CHUNK_SIZE_T)(av->max_fast)\n" +
"\n" +
"#if TRIM_FASTBINS\n" +
"        /*\n" +
"           If TRIM_FASTBINS set, don't place chunks\n" +
"           bordering top into fastbins\n" +
"        */\n" +
"        && (chunk_at_offset(p, size) != av->top)\n" +
"#endif\n" +
"        ) {\n" +
"\n" +
"      set_fastchunks(av);\n" +
"      fb = &(av->fastbins[fastbin_index(size)]);\n" +
"      p->fd = *fb;\n" +
"      *fb = p;\n" +
"    }\n" +
"\n" +
"    /*\n" +
"       Consolidate other non-mmapped chunks as they arrive.\n" +
"    */\n" +
"\n" +
"    else if (!chunk_is_mmapped(p)) {\n" +
"      set_anychunks(av);\n" +
"\n" +
"      nextchunk = chunk_at_offset(p, size);\n" +
"      nextsize = chunksize(nextchunk);\n" +
"\n" +
"      /* consolidate backward */\n" +
"      if (!prev_inuse(p)) {\n" +
"        prevsize = p->prev_size;\n" +
"        size += prevsize;\n" +
"        p = chunk_at_offset(p, -((long) prevsize));\n" +
"        unlink(p, bck, fwd);\n" +
"      }\n" +
"\n" +
"      if (nextchunk != av->top) {\n" +
"        /* get and clear inuse bit */\n" +
"        nextinuse = inuse_bit_at_offset(nextchunk, nextsize);\n" +
"        set_head(nextchunk, nextsize);\n" +
"\n" +
"        /* consolidate forward */\n" +
"        if (!nextinuse) {\n" +
"          unlink(nextchunk, bck, fwd);\n" +
"          size += nextsize;\n" +
"        }\n" +
"\n" +
"        /*\n" +
"          Place the chunk in unsorted chunk list. Chunks are\n" +
"          not placed into regular bins until after they have\n" +
"          been given one chance to be used in malloc.\n" +
"        */\n" +
"\n" +
"        bck = unsorted_chunks(av);\n" +
"        fwd = bck->fd;\n" +
"        p->bk = bck;\n" +
"        p->fd = fwd;\n" +
"        bck->fd = p;\n" +
"        fwd->bk = p;\n" +
"\n" +
"        set_head(p, size | PREV_INUSE);\n" +
"        set_foot(p, size);\n" +
"\n" +
"        check_free_chunk(p);\n" +
"      }\n" +
"\n" +
"      /*\n" +
"         If the chunk borders the current high end of memory,\n" +
"         consolidate into top\n" +
"      */\n" +
"\n" +
"      else {\n" +
"        size += nextsize;\n" +
"        set_head(p, size | PREV_INUSE);\n" +
"        av->top = p;\n" +
"        check_chunk(p);\n" +
"      }\n" +
"\n" +
"      /*\n" +
"        If freeing a large space, consolidate possibly-surrounding\n" +
"        chunks. Then, if the total unused topmost memory exceeds trim\n" +
"        threshold, ask malloc_trim to reduce top.\n" +
"\n" +
"        Unless max_fast is 0, we don't know if there are fastbins\n" +
"        bordering top, so we cannot tell for sure whether threshold\n" +
"        has been reached unless fastbins are consolidated.  But we\n" +
"        don't want to consolidate on each free.  As a compromise,\n" +
"        consolidation is performed if FASTBIN_CONSOLIDATION_THRESHOLD\n" +
"        is reached.\n" +
"      */\n" +
"\n" +
"      if ((CHUNK_SIZE_T)(size) >= FASTBIN_CONSOLIDATION_THRESHOLD) {\n" +
"        if (have_fastchunks(av))\n" +
"          malloc_consolidate(av);\n" +
"\n" +
"#ifndef MORECORE_CANNOT_TRIM\n" +
"        if ((CHUNK_SIZE_T)(chunksize(av->top)) >=\n" +
"            (CHUNK_SIZE_T)(av->trim_threshold))\n" +
"          sYSTRIm(av->top_pad, av);\n" +
"#endif\n" +
"      }\n" +
"\n" +
"    }\n" +
"    /*\n" +
"      If the chunk was allocated via mmap, release via munmap()\n" +
"      Note that if HAVE_MMAP is false but chunk_is_mmapped is\n" +
"      true, then user must have overwritten memory. There's nothing\n" +
"      we can do to catch this error unless DEBUG is set, in which case\n" +
"      check_inuse_chunk (above) will have triggered error.\n" +
"    */\n" +
"\n" +
"    else {\n" +
"#if HAVE_MMAP\n" +
"      int ret;\n" +
"      INTERNAL_SIZE_T offset = p->prev_size;\n" +
"      av->n_mmaps--;\n" +
"      av->mmapped_mem -= (size + offset);\n" +
"      ret = munmap((char*)p - offset, size + offset);\n" +
"      /* munmap returns non-zero on failure */\n" +
"      assert(ret == 0);\n" +
"#endif\n" +
"    }\n" +
"  }\n" +
"}\n" +
"\n") +
(
"/*\n" +
"  ------------------------- malloc_consolidate -------------------------\n" +
"\n" +
"  malloc_consolidate is a specialized version of free() that tears\n" +
"  down chunks held in fastbins.  Free itself cannot be used for this\n" +
"  purpose since, among other things, it might place chunks back onto\n" +
"  fastbins.  So, instead, we need to use a minor variant of the same\n" +
"  code.\n" +
"\n" +
"  Also, because this routine needs to be called the first time through\n" +
"  malloc anyway, it turns out to be the perfect place to trigger\n" +
"  initialization code.\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"static void malloc_consolidate(mstate av)\n" +
"#else\n" +
"static void malloc_consolidate(av) mstate av;\n" +
"#endif\n" +
"{\n" +
"  mfastbinptr*    fb;                 /* current fastbin being consolidated */\n" +
"  mfastbinptr*    maxfb;              /* last fastbin (for loop control) */\n" +
"  mchunkptr       p;                  /* current chunk being consolidated */\n" +
"  mchunkptr       nextp;              /* next chunk to consolidate */\n" +
"  mchunkptr       unsorted_bin;       /* bin header */\n" +
"  mchunkptr       first_unsorted;     /* chunk to link to */\n" +
"\n" +
"  /* These have same use as in free() */\n" +
"  mchunkptr       nextchunk;\n" +
"  INTERNAL_SIZE_T size;\n" +
"  INTERNAL_SIZE_T nextsize;\n" +
"  INTERNAL_SIZE_T prevsize;\n" +
"  int             nextinuse;\n" +
"  mchunkptr       bck;\n" +
"  mchunkptr       fwd;\n" +
"\n" +
"  /*\n" +
"    If max_fast is 0, we know that av hasn't\n" +
"    yet been initialized, in which case do so below\n" +
"  */\n" +
"\n" +
"  if (av->max_fast != 0) {\n" +
"    clear_fastchunks(av);\n" +
"\n" +
"    unsorted_bin = unsorted_chunks(av);\n" +
"\n" +
"    /*\n" +
"      Remove each chunk from fast bin and consolidate it, placing it\n" +
"      then in unsorted bin. Among other reasons for doing this,\n" +
"      placing in unsorted bin avoids needing to calculate actual bins\n" +
"      until malloc is sure that chunks aren't immediately going to be\n" +
"      reused anyway.\n" +
"    */\n" +
"\n" +
"    maxfb = &(av->fastbins[fastbin_index(av->max_fast)]);\n" +
"    fb = &(av->fastbins[0]);\n" +
"    do {\n" +
"      if ( (p = *fb) != 0) {\n" +
"        *fb = 0;\n" +
"\n" +
"        do {\n" +
"          check_inuse_chunk(p);\n" +
"          nextp = p->fd;\n" +
"\n" +
"          /* Slightly streamlined version of consolidation code in free() */\n" +
"          size = p->size & ~PREV_INUSE;\n" +
"          nextchunk = chunk_at_offset(p, size);\n" +
"          nextsize = chunksize(nextchunk);\n" +
"\n" +
"          if (!prev_inuse(p)) {\n" +
"            prevsize = p->prev_size;\n" +
"            size += prevsize;\n" +
"            p = chunk_at_offset(p, -((long) prevsize));\n" +
"            unlink(p, bck, fwd);\n" +
"          }\n" +
"\n" +
"          if (nextchunk != av->top) {\n" +
"            nextinuse = inuse_bit_at_offset(nextchunk, nextsize);\n" +
"            set_head(nextchunk, nextsize);\n" +
"\n" +
"            if (!nextinuse) {\n" +
"              size += nextsize;\n" +
"              unlink(nextchunk, bck, fwd);\n" +
"            }\n" +
"\n" +
"            first_unsorted = unsorted_bin->fd;\n" +
"            unsorted_bin->fd = p;\n" +
"            first_unsorted->bk = p;\n" +
"\n" +
"            set_head(p, size | PREV_INUSE);\n" +
"            p->bk = unsorted_bin;\n" +
"            p->fd = first_unsorted;\n" +
"            set_foot(p, size);\n" +
"          }\n" +
"\n" +
"          else {\n" +
"            size += nextsize;\n" +
"            set_head(p, size | PREV_INUSE);\n" +
"            av->top = p;\n" +
"          }\n" +
"\n" +
"        } while ( (p = nextp) != 0);\n" +
"\n" +
"      }\n" +
"    } while (fb++ != maxfb);\n" +
"  }\n" +
"  else {\n" +
"    malloc_init_state(av);\n" +
"    check_malloc_state();\n" +
"  }\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------------ realloc ------------------------------\n" +
"*/\n" +
"\n" +
"\n" +
"#if __STD_C\n" +
"Void_t* rEALLOc(Void_t* oldmem, size_t bytes)\n" +
"#else\n" +
"Void_t* rEALLOc(oldmem, bytes) Void_t* oldmem; size_t bytes;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"\n" +
"  INTERNAL_SIZE_T  nb;              /* padded request size */\n" +
"\n" +
"  mchunkptr        oldp;            /* chunk corresponding to oldmem */\n" +
"  INTERNAL_SIZE_T  oldsize;         /* its size */\n" +
"\n" +
"  mchunkptr        newp;            /* chunk to return */\n" +
"  INTERNAL_SIZE_T  newsize;         /* its size */\n" +
"  Void_t*          newmem;          /* corresponding user mem */\n" +
"\n" +
"  mchunkptr        next;            /* next contiguous chunk after oldp */\n" +
"\n" +
"  mchunkptr        remainder;       /* extra space at end of newp */\n" +
"  CHUNK_SIZE_T     remainder_size;  /* its size */\n" +
"\n" +
"  mchunkptr        bck;             /* misc temp for linking */\n" +
"  mchunkptr        fwd;             /* misc temp for linking */\n" +
"\n" +
"  CHUNK_SIZE_T     copysize;        /* bytes to copy */\n" +
"  unsigned int     ncopies;         /* INTERNAL_SIZE_T words to copy */\n" +
"  INTERNAL_SIZE_T* s;               /* copy source */\n" +
"  INTERNAL_SIZE_T* d;               /* copy destination */\n" +
"\n" +
"\n" +
"#ifdef REALLOC_ZERO_BYTES_FREES\n" +
"  if (bytes == 0) {\n" +
"    fREe(oldmem);\n" +
"    return 0;\n" +
"  }\n" +
"#endif\n" +
"\n") +
(
"  /* realloc of null is supposed to be same as malloc */\n" +
"  if (oldmem == 0) return mALLOc(bytes);\n" +
"\n" +
"  checked_request2size(bytes, nb);\n" +
"\n" +
"  oldp    = mem2chunk(oldmem);\n" +
"  oldsize = chunksize(oldp);\n" +
"\n" +
"  check_inuse_chunk(oldp);\n" +
"\n" +
"  if (!chunk_is_mmapped(oldp)) {\n" +
"\n" +
"    if ((CHUNK_SIZE_T)(oldsize) >= (CHUNK_SIZE_T)(nb)) {\n" +
"      /* already big enough; split below */\n" +
"      newp = oldp;\n" +
"      newsize = oldsize;\n" +
"    }\n" +
"\n" +
"    else {\n" +
"      next = chunk_at_offset(oldp, oldsize);\n" +
"\n" +
"      /* Try to expand forward into top */\n" +
"      if (next == av->top &&\n" +
"          (CHUNK_SIZE_T)(newsize = oldsize + chunksize(next)) >=\n" +
"          (CHUNK_SIZE_T)(nb + MINSIZE)) {\n" +
"        set_head_size(oldp, nb);\n" +
"        av->top = chunk_at_offset(oldp, nb);\n" +
"        set_head(av->top, (newsize - nb) | PREV_INUSE);\n" +
"        return chunk2mem(oldp);\n" +
"      }\n" +
"\n" +
"      /* Try to expand forward into next chunk;  split off remainder below */\n" +
"      else if (next != av->top &&\n" +
"               !inuse(next) &&\n" +
"               (CHUNK_SIZE_T)(newsize = oldsize + chunksize(next)) >=\n" +
"               (CHUNK_SIZE_T)(nb)) {\n" +
"        newp = oldp;\n" +
"        unlink(next, bck, fwd);\n" +
"      }\n" +
"\n" +
"      /* allocate, copy, free */\n" +
"      else {\n" +
"        newmem = mALLOc(nb - MALLOC_ALIGN_MASK);\n" +
"        if (newmem == 0)\n" +
"          return 0; /* propagate failure */\n" +
"\n" +
"        newp = mem2chunk(newmem);\n" +
"        newsize = chunksize(newp);\n" +
"\n" +
"        /*\n" +
"          Avoid copy if newp is next chunk after oldp.\n" +
"        */\n" +
"        if (newp == next) {\n" +
"          newsize += oldsize;\n" +
"          newp = oldp;\n" +
"        }\n" +
"        else {\n" +
"          /*\n" +
"            Unroll copy of <= 36 bytes (72 if 8byte sizes)\n" +
"            We know that contents have an odd number of\n" +
"            INTERNAL_SIZE_T-sized words; minimally 3.\n" +
"          */\n" +
"\n" +
"          copysize = oldsize - SIZE_SZ;\n" +
"          s = (INTERNAL_SIZE_T*)(oldmem);\n" +
"          d = (INTERNAL_SIZE_T*)(newmem);\n" +
"          ncopies = copysize / sizeof(INTERNAL_SIZE_T);\n" +
"          assert(ncopies >= 3);\n" +
"\n" +
"          if (ncopies > 9)\n" +
"            MALLOC_COPY(d, s, copysize);\n" +
"\n" +
"          else {\n" +
"            *(d+0) = *(s+0);\n" +
"            *(d+1) = *(s+1);\n" +
"            *(d+2) = *(s+2);\n" +
"            if (ncopies > 4) {\n" +
"              *(d+3) = *(s+3);\n" +
"              *(d+4) = *(s+4);\n" +
"              if (ncopies > 6) {\n" +
"                *(d+5) = *(s+5);\n" +
"                *(d+6) = *(s+6);\n" +
"                if (ncopies > 8) {\n" +
"                  *(d+7) = *(s+7);\n" +
"                  *(d+8) = *(s+8);\n" +
"                }\n" +
"              }\n" +
"            }\n" +
"          }\n" +
"\n" +
"          fREe(oldmem);\n" +
"          check_inuse_chunk(newp);\n" +
"          return chunk2mem(newp);\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"\n" +
"    /* If possible, free extra space in old or extended chunk */\n" +
"\n" +
"    assert((CHUNK_SIZE_T)(newsize) >= (CHUNK_SIZE_T)(nb));\n" +
"\n" +
"    remainder_size = newsize - nb;\n" +
"\n" +
"    if (remainder_size < MINSIZE) { /* not enough extra to split off */\n" +
"      set_head_size(newp, newsize);\n" +
"      set_inuse_bit_at_offset(newp, newsize);\n" +
"    }\n" +
"    else { /* split remainder */\n" +
"      remainder = chunk_at_offset(newp, nb);\n" +
"      set_head_size(newp, nb);\n" +
"      set_head(remainder, remainder_size | PREV_INUSE);\n" +
"      /* Mark remainder as inuse so free() won't complain */\n" +
"      set_inuse_bit_at_offset(remainder, remainder_size);\n" +
"      fREe(chunk2mem(remainder));\n" +
"    }\n" +
"\n" +
"    check_inuse_chunk(newp);\n" +
"    return chunk2mem(newp);\n" +
"  }\n" +
"\n" +
"  /*\n" +
"    Handle mmap cases\n" +
"  */\n" +
"\n" +
"  else {\n" +
"#if HAVE_MMAP\n" +
"\n" +
"#if HAVE_MREMAP\n" +
"    INTERNAL_SIZE_T offset = oldp->prev_size;\n" +
"    size_t pagemask = av->pagesize - 1;\n" +
"    char *cp;\n" +
"    CHUNK_SIZE_T  sum;\n" +
"\n" +
"    /* Note the extra SIZE_SZ overhead */\n" +
"    newsize = (nb + offset + SIZE_SZ + pagemask) & ~pagemask;\n" +
"\n" +
"    /* don't need to remap if still within same page */\n" +
"    if (oldsize == newsize - offset)\n" +
"      return oldmem;\n" +
"\n" +
"    cp = (char*)mremap((char*)oldp - offset, oldsize + offset, newsize, 1);\n" +
"\n" +
"    if (cp != (char*)MORECORE_FAILURE) {\n" +
"\n" +
"      newp = (mchunkptr)(cp + offset);\n" +
"      set_head(newp, (newsize - offset)|IS_MMAPPED);\n" +
"\n" +
"      assert(aligned_OK(chunk2mem(newp)));\n" +
"      assert((newp->prev_size == offset));\n" +
"\n") +
(
"      /* update statistics */\n" +
"      sum = av->mmapped_mem += newsize - oldsize;\n" +
"      if (sum > (CHUNK_SIZE_T)(av->max_mmapped_mem))\n" +
"        av->max_mmapped_mem = sum;\n" +
"      sum += av->sbrked_mem;\n" +
"      if (sum > (CHUNK_SIZE_T)(av->max_total_mem))\n" +
"        av->max_total_mem = sum;\n" +
"\n" +
"      return chunk2mem(newp);\n" +
"    }\n" +
"#endif\n" +
"\n" +
"    /* Note the extra SIZE_SZ overhead. */\n" +
"    if ((CHUNK_SIZE_T)(oldsize) >= (CHUNK_SIZE_T)(nb + SIZE_SZ))\n" +
"      newmem = oldmem; /* do nothing */\n" +
"    else {\n" +
"      /* Must alloc, copy, free. */\n" +
"      newmem = mALLOc(nb - MALLOC_ALIGN_MASK);\n" +
"      if (newmem != 0) {\n" +
"        MALLOC_COPY(newmem, oldmem, oldsize - 2*SIZE_SZ);\n" +
"        fREe(oldmem);\n" +
"      }\n" +
"    }\n" +
"    return newmem;\n" +
"\n" +
"#else\n" +
"    /* If !HAVE_MMAP, but chunk_is_mmapped, user must have overwritten mem */\n" +
"    check_malloc_state();\n" +
"    MALLOC_FAILURE_ACTION;\n" +
"    return 0;\n" +
"#endif\n" +
"  }\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------------ memalign ------------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"Void_t* mEMALIGn(size_t alignment, size_t bytes)\n" +
"#else\n" +
"Void_t* mEMALIGn(alignment, bytes) size_t alignment; size_t bytes;\n" +
"#endif\n" +
"{\n" +
"  INTERNAL_SIZE_T nb;             /* padded  request size */\n" +
"  char*           m;              /* memory returned by malloc call */\n" +
"  mchunkptr       p;              /* corresponding chunk */\n" +
"  char*           brk;            /* alignment point within p */\n" +
"  mchunkptr       newp;           /* chunk to return */\n" +
"  INTERNAL_SIZE_T newsize;        /* its size */\n" +
"  INTERNAL_SIZE_T leadsize;       /* leading space before alignment point */\n" +
"  mchunkptr       remainder;      /* spare room at end to split off */\n" +
"  CHUNK_SIZE_T    remainder_size; /* its size */\n" +
"  INTERNAL_SIZE_T size;\n" +
"\n" +
"  /* If need less alignment than we give anyway, just relay to malloc */\n" +
"\n" +
"  if (alignment <= MALLOC_ALIGNMENT) return mALLOc(bytes);\n" +
"\n" +
"  /* Otherwise, ensure that it is at least a minimum chunk size */\n" +
"\n" +
"  if (alignment <  MINSIZE) alignment = MINSIZE;\n" +
"\n" +
"  /* Make sure alignment is power of 2 (in case MINSIZE is not).  */\n" +
"  if ((alignment & (alignment - 1)) != 0) {\n" +
"    size_t a = MALLOC_ALIGNMENT * 2;\n" +
"    while ((CHUNK_SIZE_T)a < (CHUNK_SIZE_T)alignment) a <<= 1;\n" +
"    alignment = a;\n" +
"  }\n" +
"\n" +
"  checked_request2size(bytes, nb);\n" +
"\n" +
"  /*\n" +
"    Strategy: find a spot within that chunk that meets the alignment\n" +
"    request, and then possibly free the leading and trailing space.\n" +
"  */\n" +
"\n" +
"\n" +
"  /* Call malloc with worst case padding to hit alignment. */\n" +
"\n" +
"  m  = (char*)(mALLOc(nb + alignment + MINSIZE));\n" +
"\n" +
"  if (m == 0) return 0; /* propagate failure */\n" +
"\n" +
"  p = mem2chunk(m);\n" +
"\n" +
"  if ((((PTR_UINT)(m)) % alignment) != 0) { /* misaligned */\n" +
"\n" +
"    /*\n" +
"      Find an aligned spot inside chunk.  Since we need to give back\n" +
"      leading space in a chunk of at least MINSIZE, if the first\n" +
"      calculation places us at a spot with less than MINSIZE leader,\n" +
"      we can move to the next aligned spot -- we've allocated enough\n" +
"      total room so that this is always possible.\n" +
"    */\n" +
"\n" +
"    brk = (char*)mem2chunk((PTR_UINT)(((PTR_UINT)(m + alignment - 1)) &\n" +
"                           -((signed long) alignment)));\n" +
"    if ((CHUNK_SIZE_T)(brk - (char*)(p)) < MINSIZE)\n" +
"      brk += alignment;\n" +
"\n" +
"    newp = (mchunkptr)brk;\n" +
"    leadsize = brk - (char*)(p);\n" +
"    newsize = chunksize(p) - leadsize;\n" +
"\n" +
"    /* For mmapped chunks, just adjust offset */\n" +
"    if (chunk_is_mmapped(p)) {\n" +
"      newp->prev_size = p->prev_size + leadsize;\n" +
"      set_head(newp, newsize|IS_MMAPPED);\n" +
"      return chunk2mem(newp);\n" +
"    }\n" +
"\n" +
"    /* Otherwise, give back leader, use the rest */\n" +
"    set_head(newp, newsize | PREV_INUSE);\n" +
"    set_inuse_bit_at_offset(newp, newsize);\n" +
"    set_head_size(p, leadsize);\n" +
"    fREe(chunk2mem(p));\n" +
"    p = newp;\n" +
"\n" +
"    assert (newsize >= nb &&\n" +
"            (((PTR_UINT)(chunk2mem(p))) % alignment) == 0);\n" +
"  }\n" +
"\n" +
"  /* Also give back spare room at the end */\n" +
"  if (!chunk_is_mmapped(p)) {\n" +
"    size = chunksize(p);\n" +
"    if ((CHUNK_SIZE_T)(size) > (CHUNK_SIZE_T)(nb + MINSIZE)) {\n" +
"      remainder_size = size - nb;\n" +
"      remainder = chunk_at_offset(p, nb);\n" +
"      set_head(remainder, remainder_size | PREV_INUSE);\n" +
"      set_head_size(p, nb);\n" +
"      fREe(chunk2mem(remainder));\n" +
"    }\n" +
"  }\n" +
"\n" +
"  check_inuse_chunk(p);\n" +
"  return chunk2mem(p);\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------------ calloc ------------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"Void_t* cALLOc(size_t n_elements, size_t elem_size)\n" +
"#else\n" +
"Void_t* cALLOc(n_elements, elem_size) size_t n_elements; size_t elem_size;\n" +
"#endif\n" +
"{\n" +
"  mchunkptr p;\n" +
"  CHUNK_SIZE_T  clearsize;\n" +
"  CHUNK_SIZE_T  nclears;\n" +
"  INTERNAL_SIZE_T* d;\n" +
"\n") +
(
"  Void_t* mem = mALLOc(n_elements * elem_size);\n" +
"\n" +
"  if (mem != 0) {\n" +
"    p = mem2chunk(mem);\n" +
"\n" +
"    if (!chunk_is_mmapped(p))\n" +
"    {\n" +
"      /*\n" +
"        Unroll clear of <= 36 bytes (72 if 8byte sizes)\n" +
"        We know that contents have an odd number of\n" +
"        INTERNAL_SIZE_T-sized words; minimally 3.\n" +
"      */\n" +
"\n" +
"      d = (INTERNAL_SIZE_T*)mem;\n" +
"      clearsize = chunksize(p) - SIZE_SZ;\n" +
"      nclears = clearsize / sizeof(INTERNAL_SIZE_T);\n" +
"      assert(nclears >= 3);\n" +
"\n" +
"      if (nclears > 9)\n" +
"        MALLOC_ZERO(d, clearsize);\n" +
"\n" +
"      else {\n" +
"        *(d+0) = 0;\n" +
"        *(d+1) = 0;\n" +
"        *(d+2) = 0;\n" +
"        if (nclears > 4) {\n" +
"          *(d+3) = 0;\n" +
"          *(d+4) = 0;\n" +
"          if (nclears > 6) {\n" +
"            *(d+5) = 0;\n" +
"            *(d+6) = 0;\n" +
"            if (nclears > 8) {\n" +
"              *(d+7) = 0;\n" +
"              *(d+8) = 0;\n" +
"            }\n" +
"          }\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"#if ! MMAP_CLEARS\n" +
"    else\n" +
"    {\n" +
"      d = (INTERNAL_SIZE_T*)mem;\n" +
"      /*\n" +
"        Note the additional SIZE_SZ\n" +
"      */\n" +
"      clearsize = chunksize(p) - 2*SIZE_SZ;\n" +
"      MALLOC_ZERO(d, clearsize);\n" +
"    }\n" +
"#endif\n" +
"  }\n" +
"  return mem;\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------------ cfree ------------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"void cFREe(Void_t *mem)\n" +
"#else\n" +
"void cFREe(mem) Void_t *mem;\n" +
"#endif\n" +
"{\n" +
"  fREe(mem);\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------- independent_calloc -------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"Void_t** iCALLOc(size_t n_elements, size_t elem_size, Void_t* chunks[])\n" +
"#else\n" +
"Void_t** iCALLOc(n_elements, elem_size, chunks) size_t n_elements; size_t elem_size; Void_t* chunks[];\n" +
"#endif\n" +
"{\n" +
"  size_t sz = elem_size; /* serves as 1-element array */\n" +
"  /* opts arg of 3 means all elements are same size, and should be cleared */\n" +
"  return iALLOc(n_elements, &sz, 3, chunks);\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------- independent_comalloc -------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"Void_t** iCOMALLOc(size_t n_elements, size_t sizes[], Void_t* chunks[])\n" +
"#else\n" +
"Void_t** iCOMALLOc(n_elements, sizes, chunks) size_t n_elements; size_t sizes[]; Void_t* chunks[];\n" +
"#endif\n" +
"{\n" +
"  return iALLOc(n_elements, sizes, 0, chunks);\n" +
"}\n" +
"\n" +
"\n" +
"/*\n" +
"  ------------------------------ ialloc ------------------------------\n" +
"  ialloc provides common support for independent_X routines, handling all of\n" +
"  the combinations that can result.\n" +
"\n" +
"  The opts arg has:\n" +
"    bit 0 set if all elements are same size (using sizes[0])\n" +
"    bit 1 set if elements should be zeroed\n" +
"*/\n" +
"\n" +
"\n" +
"#if __STD_C\n" +
"static Void_t** iALLOc(size_t n_elements,\n" +
"                       size_t* sizes,\n" +
"                       int opts,\n" +
"                       Void_t* chunks[])\n" +
"#else\n" +
"static Void_t** iALLOc(n_elements, sizes, opts, chunks) size_t n_elements; size_t* sizes; int opts; Void_t* chunks[];\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"  INTERNAL_SIZE_T element_size;   /* chunksize of each element, if all same */\n" +
"  INTERNAL_SIZE_T contents_size;  /* total size of elements */\n" +
"  INTERNAL_SIZE_T array_size;     /* request size of pointer array */\n" +
"  Void_t*         mem;            /* malloced aggregate space */\n" +
"  mchunkptr       p;              /* corresponding chunk */\n" +
"  INTERNAL_SIZE_T remainder_size; /* remaining bytes while splitting */\n" +
"  Void_t**        marray;         /* either \"chunks\" or malloced ptr array */\n" +
"  mchunkptr       array_chunk;    /* chunk for malloced ptr array */\n" +
"  int             mmx;            /* to disable mmap */\n" +
"  INTERNAL_SIZE_T size;\n" +
"  size_t          i;\n" +
"\n" +
"  /* Ensure initialization */\n" +
"  if (av->max_fast == 0) malloc_consolidate(av);\n" +
"\n" +
"  /* compute array length, if needed */\n" +
"  if (chunks != 0) {\n" +
"    if (n_elements == 0)\n" +
"      return chunks; /* nothing to do */\n" +
"    marray = chunks;\n" +
"    array_size = 0;\n" +
"  }\n" +
"  else {\n" +
"    /* if empty req, must still return chunk representing empty array */\n" +
"    if (n_elements == 0)\n" +
"      return (Void_t**) mALLOc(0);\n" +
"    marray = 0;\n" +
"    array_size = request2size(n_elements * (sizeof(Void_t*)));\n" +
"  }\n" +
"\n" +
"  /* compute total element size */\n" +
"  if (opts & 0x1) { /* all-same-size */\n" +
"    element_size = request2size(*sizes);\n" +
"    contents_size = n_elements * element_size;\n" +
"  }\n" +
"  else { /* add up all the sizes */\n" +
"    element_size = 0;\n" +
"    contents_size = 0;\n" +
"    for (i = 0; i != n_elements; ++i)\n" +
"      contents_size += request2size(sizes[i]);\n" +
"  }\n" +
"\n") +
(
"  /* subtract out alignment bytes from total to minimize overallocation */\n" +
"  size = contents_size + array_size - MALLOC_ALIGN_MASK;\n" +
"\n" +
"  /*\n" +
"     Allocate the aggregate chunk.\n" +
"     But first disable mmap so malloc won't use it, since\n" +
"     we would not be able to later free/realloc space internal\n" +
"     to a segregated mmap region.\n" +
" */\n" +
"  mmx = av->n_mmaps_max;   /* disable mmap */\n" +
"  av->n_mmaps_max = 0;\n" +
"  mem = mALLOc(size);\n" +
"  av->n_mmaps_max = mmx;   /* reset mmap */\n" +
"  if (mem == 0)\n" +
"    return 0;\n" +
"\n" +
"  p = mem2chunk(mem);\n" +
"  assert(!chunk_is_mmapped(p));\n" +
"  remainder_size = chunksize(p);\n" +
"\n" +
"  if (opts & 0x2) {       /* optionally clear the elements */\n" +
"    MALLOC_ZERO(mem, remainder_size - SIZE_SZ - array_size);\n" +
"  }\n" +
"\n" +
"  /* If not provided, allocate the pointer array as final part of chunk */\n" +
"  if (marray == 0) {\n" +
"    array_chunk = chunk_at_offset(p, contents_size);\n" +
"    marray = (Void_t**) (chunk2mem(array_chunk));\n" +
"    set_head(array_chunk, (remainder_size - contents_size) | PREV_INUSE);\n" +
"    remainder_size = contents_size;\n" +
"  }\n" +
"\n" +
"  /* split out elements */\n" +
"  for (i = 0; ; ++i) {\n" +
"    marray[i] = chunk2mem(p);\n" +
"    if (i != n_elements-1) {\n" +
"      if (element_size != 0)\n" +
"        size = element_size;\n" +
"      else\n" +
"        size = request2size(sizes[i]);\n" +
"      remainder_size -= size;\n" +
"      set_head(p, size | PREV_INUSE);\n" +
"      p = chunk_at_offset(p, size);\n" +
"    }\n" +
"    else { /* the final element absorbs any overallocation slop */\n" +
"      set_head(p, remainder_size | PREV_INUSE);\n" +
"      break;\n" +
"    }\n" +
"  }\n" +
"\n" +
"#if DEBUG\n" +
"  if (marray != chunks) {\n" +
"    /* final element must have exactly exhausted chunk */\n" +
"    if (element_size != 0)\n" +
"      assert(remainder_size == element_size);\n" +
"    else\n" +
"      assert(remainder_size == request2size(sizes[i]));\n" +
"    check_inuse_chunk(mem2chunk(marray));\n" +
"  }\n" +
"\n" +
"  for (i = 0; i != n_elements; ++i)\n" +
"    check_inuse_chunk(mem2chunk(marray[i]));\n" +
"#endif\n" +
"\n" +
"  return marray;\n" +
"}\n" +
"\n" +
"\n" +
"/*\n" +
"  ------------------------------ valloc ------------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"Void_t* vALLOc(size_t bytes)\n" +
"#else\n" +
"Void_t* vALLOc(bytes) size_t bytes;\n" +
"#endif\n" +
"{\n" +
"  /* Ensure initialization */\n" +
"  mstate av = get_malloc_state();\n" +
"  if (av->max_fast == 0) malloc_consolidate(av);\n" +
"  return mEMALIGn(av->pagesize, bytes);\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------------ pvalloc ------------------------------\n" +
"*/\n" +
"\n" +
"\n" +
"#if __STD_C\n" +
"Void_t* pVALLOc(size_t bytes)\n" +
"#else\n" +
"Void_t* pVALLOc(bytes) size_t bytes;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"  size_t pagesz;\n" +
"\n" +
"  /* Ensure initialization */\n" +
"  if (av->max_fast == 0) malloc_consolidate(av);\n" +
"  pagesz = av->pagesize;\n" +
"  return mEMALIGn(pagesz, (bytes + pagesz - 1) & ~(pagesz - 1));\n" +
"}\n" +
"\n" +
"\n" +
"/*\n" +
"  ------------------------------ malloc_trim ------------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"int mTRIm(size_t pad)\n" +
"#else\n" +
"int mTRIm(pad) size_t pad;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"  /* Ensure initialization/consolidation */\n" +
"  malloc_consolidate(av);\n" +
"\n" +
"#ifndef MORECORE_CANNOT_TRIM\n" +
"  return sYSTRIm(pad, av);\n" +
"#else\n" +
"  return 0;\n" +
"#endif\n" +
"}\n" +
"\n" +
"\n" +
"/*\n" +
"  ------------------------- malloc_usable_size -------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"size_t mUSABLe(Void_t* mem)\n" +
"#else\n" +
"size_t mUSABLe(mem) Void_t* mem;\n" +
"#endif\n" +
"{\n" +
"  mchunkptr p;\n" +
"  if (mem != 0) {\n" +
"    p = mem2chunk(mem);\n" +
"    if (chunk_is_mmapped(p))\n" +
"      return chunksize(p) - 2*SIZE_SZ;\n" +
"    else if (inuse(p))\n" +
"      return chunksize(p) - SIZE_SZ;\n" +
"  }\n" +
"  return 0;\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------------ mallinfo ------------------------------\n" +
"*/\n" +
"\n") +
(
"struct mallinfo mALLINFo()\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"  struct mallinfo mi;\n" +
"  unsigned int i;\n" +
"  mbinptr b;\n" +
"  mchunkptr p;\n" +
"  INTERNAL_SIZE_T avail;\n" +
"  INTERNAL_SIZE_T fastavail;\n" +
"  int nblocks;\n" +
"  int nfastblocks;\n" +
"\n" +
"  /* Ensure initialization */\n" +
"  if (av->top == 0)  malloc_consolidate(av);\n" +
"\n" +
"  check_malloc_state();\n" +
"\n" +
"  /* Account for top */\n" +
"  avail = chunksize(av->top);\n" +
"  nblocks = 1;  /* top always exists */\n" +
"\n" +
"  /* traverse fastbins */\n" +
"  nfastblocks = 0;\n" +
"  fastavail = 0;\n" +
"\n" +
"  for (i = 0; i < NFASTBINS; ++i) {\n" +
"    for (p = av->fastbins[i]; p != 0; p = p->fd) {\n" +
"      ++nfastblocks;\n" +
"      fastavail += chunksize(p);\n" +
"    }\n" +
"  }\n" +
"\n" +
"  avail += fastavail;\n" +
"\n" +
"  /* traverse regular bins */\n" +
"  for (i = 1; i < NBINS; ++i) {\n" +
"    b = bin_at(av, i);\n" +
"    for (p = last(b); p != b; p = p->bk) {\n" +
"      ++nblocks;\n" +
"      avail += chunksize(p);\n" +
"    }\n" +
"  }\n" +
"\n" +
"  mi.smblks = nfastblocks;\n" +
"  mi.ordblks = nblocks;\n" +
"  mi.fordblks = avail;\n" +
"  mi.uordblks = av->sbrked_mem - avail;\n" +
"  mi.arena = av->sbrked_mem;\n" +
"  mi.hblks = av->n_mmaps;\n" +
"  mi.hblkhd = av->mmapped_mem;\n" +
"  mi.fsmblks = fastavail;\n" +
"  mi.keepcost = chunksize(av->top);\n" +
"  mi.usmblks = av->max_total_mem;\n" +
"  return mi;\n" +
"}\n" +
"\n" +
"/*\n" +
"  ------------------------------ malloc_stats ------------------------------\n" +
"*/\n" +
"\n" +
"void mSTATs()\n" +
"{\n" +
"  struct mallinfo mi = mALLINFo();\n" +
"\n" +
"#ifdef WIN32\n" +
"  {\n" +
"    CHUNK_SIZE_T  free, reserved, committed;\n" +
"    vminfo (&free, &reserved, &committed);\n" +
"    fprintf(stderr, \"free bytes       = %10lu\\n\",\n" +
"            free);\n" +
"    fprintf(stderr, \"reserved bytes   = %10lu\\n\",\n" +
"            reserved);\n" +
"    fprintf(stderr, \"committed bytes  = %10lu\\n\",\n" +
"            committed);\n" +
"  }\n" +
"#endif\n" +
"\n" +
"\n" +
"  fprintf(stderr, \"max system bytes = %10lu\\n\",\n" +
"          (CHUNK_SIZE_T)(mi.usmblks));\n" +
"  fprintf(stderr, \"system bytes     = %10lu\\n\",\n" +
"          (CHUNK_SIZE_T)(mi.arena + mi.hblkhd));\n" +
"  fprintf(stderr, \"in use bytes     = %10lu\\n\",\n" +
"          (CHUNK_SIZE_T)(mi.uordblks + mi.hblkhd));\n" +
"\n" +
"#ifdef WIN32\n" +
"  {\n" +
"    CHUNK_SIZE_T  kernel, user;\n" +
"    if (cpuinfo (TRUE, &kernel, &user)) {\n" +
"      fprintf(stderr, \"kernel ms        = %10lu\\n\",\n" +
"              kernel);\n" +
"      fprintf(stderr, \"user ms          = %10lu\\n\",\n" +
"              user);\n" +
"    }\n" +
"  }\n" +
"#endif\n" +
"}\n" +
"\n" +
"\n" +
"/*\n" +
"  ------------------------------ mallopt ------------------------------\n" +
"*/\n" +
"\n" +
"#if __STD_C\n" +
"int mALLOPt(int param_number, int value)\n" +
"#else\n" +
"int mALLOPt(param_number, value) int param_number; int value;\n" +
"#endif\n" +
"{\n" +
"  mstate av = get_malloc_state();\n" +
"  /* Ensure initialization/consolidation */\n" +
"  malloc_consolidate(av);\n" +
"\n" +
"  switch(param_number) {\n" +
"  case M_MXFAST:\n" +
"    if (value >= 0 && value <= MAX_FAST_SIZE) {\n" +
"      set_max_fast(av, value);\n" +
"      return 1;\n" +
"    }\n" +
"    else\n" +
"      return 0;\n" +
"\n" +
"  case M_TRIM_THRESHOLD:\n" +
"    av->trim_threshold = value;\n" +
"    return 1;\n" +
"\n" +
"  case M_TOP_PAD:\n" +
"    av->top_pad = value;\n" +
"    return 1;\n" +
"\n" +
"  case M_MMAP_THRESHOLD:\n" +
"    av->mmap_threshold = value;\n" +
"    return 1;\n" +
"\n" +
"  case M_MMAP_MAX:\n" +
"#if !HAVE_MMAP\n" +
"    if (value != 0)\n" +
"      return 0;\n" +
"#endif\n" +
"    av->n_mmaps_max = value;\n" +
"    return 1;\n" +
"\n" +
"  default:\n" +
"    return 0;\n" +
"  }\n" +
"}\n" +
"\n" +
"\n" +
"/*\n" +
"  -------------------- Alternative MORECORE functions --------------------\n" +
"*/\n" +
"\n") +
(
"\n" +
"/*\n" +
"  General Requirements for MORECORE.\n" +
"\n" +
"  The MORECORE function must have the following properties:\n" +
"\n" +
"  If MORECORE_CONTIGUOUS is false:\n" +
"\n" +
"    * MORECORE must allocate in multiples of pagesize. It will\n" +
"      only be called with arguments that are multiples of pagesize.\n" +
"\n" +
"    * MORECORE(0) must return an address that is at least\n" +
"      MALLOC_ALIGNMENT aligned. (Page-aligning always suffices.)\n" +
"\n" +
"  else (i.e. If MORECORE_CONTIGUOUS is true):\n" +
"\n" +
"    * Consecutive calls to MORECORE with positive arguments\n" +
"      return increasing addresses, indicating that space has been\n" +
"      contiguously extended.\n" +
"\n" +
"    * MORECORE need not allocate in multiples of pagesize.\n" +
"      Calls to MORECORE need not have args of multiples of pagesize.\n" +
"\n" +
"    * MORECORE need not page-align.\n" +
"\n" +
"  In either case:\n" +
"\n" +
"    * MORECORE may allocate more memory than requested. (Or even less,\n" +
"      but this will generally result in a malloc failure.)\n" +
"\n" +
"    * MORECORE must not allocate memory when given argument zero, but\n" +
"      instead return one past the end address of memory from previous\n" +
"      nonzero call. This malloc does NOT call MORECORE(0)\n" +
"      until at least one call with positive arguments is made, so\n" +
"      the initial value returned is not important.\n" +
"\n" +
"    * Even though consecutive calls to MORECORE need not return contiguous\n" +
"      addresses, it must be OK for malloc'ed chunks to span multiple\n" +
"      regions in those cases where they do happen to be contiguous.\n" +
"\n" +
"    * MORECORE need not handle negative arguments -- it may instead\n" +
"      just return MORECORE_FAILURE when given negative arguments.\n" +
"      Negative arguments are always multiples of pagesize. MORECORE\n" +
"      must not misinterpret negative args as large positive unsigned\n" +
"      args. You can suppress all such calls from even occurring by defining\n" +
"      MORECORE_CANNOT_TRIM,\n" +
"\n" +
"  There is some variation across systems about the type of the\n" +
"  argument to sbrk/MORECORE. If size_t is unsigned, then it cannot\n" +
"  actually be size_t, because sbrk supports negative args, so it is\n" +
"  normally the signed type of the same width as size_t (sometimes\n" +
"  declared as \"intptr_t\", and sometimes \"ptrdiff_t\").  It doesn't much\n" +
"  matter though. Internally, we use \"long\" as arguments, which should\n" +
"  work across all reasonable possibilities.\n" +
"\n" +
"  Additionally, if MORECORE ever returns failure for a positive\n" +
"  request, and HAVE_MMAP is true, then mmap is used as a noncontiguous\n" +
"  system allocator. This is a useful backup strategy for systems with\n" +
"  holes in address spaces -- in this case sbrk cannot contiguously\n" +
"  expand the heap, but mmap may be able to map noncontiguous space.\n" +
"\n" +
"  If you'd like mmap to ALWAYS be used, you can define MORECORE to be\n" +
"  a function that always returns MORECORE_FAILURE.\n" +
"\n" +
"  Malloc only has limited ability to detect failures of MORECORE\n" +
"  to supply contiguous space when it says it can. In particular,\n" +
"  multithreaded programs that do not use locks may result in\n" +
"  rece conditions across calls to MORECORE that result in gaps\n" +
"  that cannot be detected as such, and subsequent corruption.\n" +
"\n" +
"  If you are using this malloc with something other than sbrk (or its\n" +
"  emulation) to supply memory regions, you probably want to set\n" +
"  MORECORE_CONTIGUOUS as false.  As an example, here is a custom\n" +
"  allocator kindly contributed for pre-OSX macOS.  It uses virtually\n" +
"  but not necessarily physically contiguous non-paged memory (locked\n" +
"  in, present and won't get swapped out).  You can use it by\n" +
"  uncommenting this section, adding some #includes, and setting up the\n" +
"  appropriate defines above:\n" +
"\n" +
"      #define MORECORE osMoreCore\n" +
"      #define MORECORE_CONTIGUOUS 0\n" +
"\n" +
"  There is also a shutdown routine that should somehow be called for\n" +
"  cleanup upon program exit.\n" +
"\n" +
"  #define MAX_POOL_ENTRIES 100\n" +
"  #define MINIMUM_MORECORE_SIZE  (64 * 1024)\n" +
"  static int next_os_pool;\n" +
"  void *our_os_pools[MAX_POOL_ENTRIES];\n" +
"\n" +
"  void *osMoreCore(int size)\n" +
"  {\n" +
"    void *ptr = 0;\n" +
"    static void *sbrk_top = 0;\n" +
"\n" +
"    if (size > 0)\n" +
"    {\n" +
"      if (size < MINIMUM_MORECORE_SIZE)\n" +
"         size = MINIMUM_MORECORE_SIZE;\n" +
"      if (CurrentExecutionLevel() == kTaskLevel)\n" +
"         ptr = PoolAllocateResident(size + RM_PAGE_SIZE, 0);\n" +
"      if (ptr == 0)\n" +
"      {\n" +
"        return (void *) MORECORE_FAILURE;\n" +
"      }\n" +
"      // save ptrs so they can be freed during cleanup\n" +
"      our_os_pools[next_os_pool] = ptr;\n" +
"      next_os_pool++;\n" +
"      ptr = (void *) ((((CHUNK_SIZE_T) ptr) + RM_PAGE_MASK) & ~RM_PAGE_MASK);\n" +
"      sbrk_top = (char *) ptr + size;\n" +
"      return ptr;\n" +
"    }\n" +
"    else if (size < 0)\n" +
"    {\n" +
"      // we don't currently support shrink behavior\n" +
"      return (void *) MORECORE_FAILURE;\n" +
"    }\n" +
"    else\n" +
"    {\n" +
"      return sbrk_top;\n" +
"    }\n" +
"  }\n" +
"\n" +
"  // cleanup any allocated memory pools\n" +
"  // called as last thing before shutting down driver\n" +
"\n" +
"  void osCleanupMem(void)\n" +
"  {\n" +
"    void **ptr;\n" +
"\n" +
"    for (ptr = our_os_pools; ptr < &our_os_pools[MAX_POOL_ENTRIES]; ptr++)\n" +
"      if (*ptr)\n" +
"      {\n" +
"         PoolDeallocate(*ptr);\n" +
"         *ptr = 0;\n" +
"      }\n" +
"  }\n" +
"\n" +
"*/\n" +
"\n" +
"\n" +
"/*\n" +
"  --------------------------------------------------------------\n" +
"\n" +
"  Emulation of sbrk for win32.\n" +
"  Donated by J. Walter <Walter@GeNeSys-e.de>.\n" +
"  For additional information about this code, and malloc on Win32, see\n" +
"     http://www.genesys-e.de/jwalter/\n" +
"*/\n" +
"\n" +
"\n") +
(
"#ifdef WIN32\n" +
"\n" +
"#ifdef _DEBUG\n" +
"/* #define TRACE */\n" +
"#endif\n" +
"\n" +
"/* Support for USE_MALLOC_LOCK */\n" +
"#ifdef USE_MALLOC_LOCK\n" +
"\n" +
"/* Wait for spin lock */\n" +
"static int slwait (int *sl) {\n" +
"    while (InterlockedCompareExchange ((void **) sl, (void *) 1, (void *) 0) != 0)\n" +
"        Sleep (0);\n" +
"    return 0;\n" +
"}\n" +
"\n" +
"/* Release spin lock */\n" +
"static int slrelease (int *sl) {\n" +
"    InterlockedExchange (sl, 0);\n" +
"    return 0;\n" +
"}\n" +
"\n" +
"#ifdef NEEDED\n" +
"/* Spin lock for emulation code */\n" +
"static int g_sl;\n" +
"#endif\n" +
"\n" +
"#endif /* USE_MALLOC_LOCK */\n" +
"\n" +
"/* getpagesize for windows */\n" +
"static long getpagesize (void) {\n" +
"    static long g_pagesize = 0;\n" +
"    if (! g_pagesize) {\n" +
"        SYSTEM_INFO system_info;\n" +
"        GetSystemInfo (&system_info);\n" +
"        g_pagesize = system_info.dwPageSize;\n" +
"    }\n" +
"    return g_pagesize;\n" +
"}\n" +
"static long getregionsize (void) {\n" +
"    static long g_regionsize = 0;\n" +
"    if (! g_regionsize) {\n" +
"        SYSTEM_INFO system_info;\n" +
"        GetSystemInfo (&system_info);\n" +
"        g_regionsize = system_info.dwAllocationGranularity;\n" +
"    }\n" +
"    return g_regionsize;\n" +
"}\n" +
"\n" +
"/* A region list entry */\n" +
"typedef struct _region_list_entry {\n" +
"    void *top_allocated;\n" +
"    void *top_committed;\n" +
"    void *top_reserved;\n" +
"    long reserve_size;\n" +
"    struct _region_list_entry *previous;\n" +
"} region_list_entry;\n" +
"\n" +
"/* Allocate and link a region entry in the region list */\n" +
"static int region_list_append (region_list_entry **last, void *base_reserved, long reserve_size) {\n" +
"    region_list_entry *next = HeapAlloc (GetProcessHeap (), 0, sizeof (region_list_entry));\n" +
"    if (! next)\n" +
"        return FALSE;\n" +
"    next->top_allocated = (char *) base_reserved;\n" +
"    next->top_committed = (char *) base_reserved;\n" +
"    next->top_reserved = (char *) base_reserved + reserve_size;\n" +
"    next->reserve_size = reserve_size;\n" +
"    next->previous = *last;\n" +
"    *last = next;\n" +
"    return TRUE;\n" +
"}\n" +
"/* Free and unlink the last region entry from the region list */\n" +
"static int region_list_remove (region_list_entry **last) {\n" +
"    region_list_entry *previous = (*last)->previous;\n" +
"    if (! HeapFree (GetProcessHeap (), sizeof (region_list_entry), *last))\n" +
"        return FALSE;\n" +
"    *last = previous;\n" +
"    return TRUE;\n" +
"}\n" +
"\n" +
"#define CEIL(size,to)   (((size)+(to)-1)&~((to)-1))\n" +
"#define FLOOR(size,to)  ((size)&~((to)-1))\n" +
"\n" +
"#define SBRK_SCALE  0\n" +
"/* #define SBRK_SCALE  1 */\n" +
"/* #define SBRK_SCALE  2 */\n" +
"/* #define SBRK_SCALE  4  */\n" +
"\n" +
"/* sbrk for windows */\n" +
"static void *sbrk (long size) {\n" +
"    static long g_pagesize, g_my_pagesize;\n" +
"    static long g_regionsize, g_my_regionsize;\n" +
"    static region_list_entry *g_last;\n" +
"    void *result = (void *) MORECORE_FAILURE;\n" +
"#ifdef TRACE\n" +
"    printf (\"sbrk %d\\n\", size);\n" +
"#endif\n" +
"#if defined (USE_MALLOC_LOCK) && defined (NEEDED)\n" +
"    /* Wait for spin lock */\n" +
"    slwait (&g_sl);\n" +
"#endif\n" +
"    /* First time initialization */\n" +
"    if (! g_pagesize) {\n" +
"        g_pagesize = getpagesize ();\n" +
"        g_my_pagesize = g_pagesize << SBRK_SCALE;\n" +
"    }\n" +
"    if (! g_regionsize) {\n" +
"        g_regionsize = getregionsize ();\n" +
"        g_my_regionsize = g_regionsize << SBRK_SCALE;\n" +
"    }\n" +
"    if (! g_last) {\n" +
"        if (! region_list_append (&g_last, 0, 0))\n" +
"           goto sbrk_exit;\n" +
"    }\n" +
"    /* Assert invariants */\n" +
"    assert (g_last);\n" +
"    assert ((char *) g_last->top_reserved - g_last->reserve_size <= (char *) g_last->top_allocated &&\n" +
"            g_last->top_allocated <= g_last->top_committed);\n" +
"    assert ((char *) g_last->top_reserved - g_last->reserve_size <= (char *) g_last->top_committed &&\n" +
"            g_last->top_committed <= g_last->top_reserved &&\n" +
"            (unsigned) g_last->top_committed % g_pagesize == 0);\n" +
"    assert ((unsigned) g_last->top_reserved % g_regionsize == 0);\n" +
"    assert ((unsigned) g_last->reserve_size % g_regionsize == 0);\n" +
"    /* Allocation requested? */\n" +
"    if (size >= 0) {\n" +
"        /* Allocation size is the requested size */\n" +
"        long allocate_size = size;\n" +
"        /* Compute the size to commit */\n" +
"        long to_commit = (char *) g_last->top_allocated + allocate_size - (char *) g_last->top_committed;\n" +
"        /* Do we reach the commit limit? */\n" +
"        if (to_commit > 0) {\n" +
"            /* Round size to commit */\n" +
"            long commit_size = CEIL (to_commit, g_my_pagesize);\n" +
"            /* Compute the size to reserve */\n" +
"            long to_reserve = (char *) g_last->top_committed + commit_size - (char *) g_last->top_reserved;\n" +
"            /* Do we reach the reserve limit? */\n" +
"            if (to_reserve > 0) {\n" +
"                /* Compute the remaining size to commit in the current region */\n" +
"                long remaining_commit_size = (char *) g_last->top_reserved - (char *) g_last->top_committed;\n" +
"                if (remaining_commit_size > 0) {\n" +
"                    /* Assert preconditions */\n" +
"                    assert ((unsigned) g_last->top_committed % g_pagesize == 0);\n" +
"                    assert (0 < remaining_commit_size && remaining_commit_size % g_pagesize == 0); {\n" +
"                        /* Commit this */\n" +
"                        void *base_committed = VirtualAlloc (g_last->top_committed, remaining_commit_size,\n" +
"                                                             MEM_COMMIT, PAGE_READWRITE);\n" +
"                        /* Check returned pointer for consistency */\n" +
"                        if (base_committed != g_last->top_committed)\n" +
"                            goto sbrk_exit;\n") +
(
"                        /* Assert postconditions */\n" +
"                        assert ((unsigned) base_committed % g_pagesize == 0);\n" +
"#ifdef TRACE\n" +
"                        printf (\"Commit %p %d\\n\", base_committed, remaining_commit_size);\n" +
"#endif\n" +
"                        /* Adjust the regions commit top */\n" +
"                        g_last->top_committed = (char *) base_committed + remaining_commit_size;\n" +
"                    }\n" +
"                } {\n" +
"                    /* Now we are going to search and reserve. */\n" +
"                    int contiguous = -1;\n" +
"                    int found = FALSE;\n" +
"                    MEMORY_BASIC_INFORMATION memory_info;\n" +
"                    void *base_reserved;\n" +
"                    long reserve_size;\n" +
"                    do {\n" +
"                        /* Assume contiguous memory */\n" +
"                        contiguous = TRUE;\n" +
"                        /* Round size to reserve */\n" +
"                        reserve_size = CEIL (to_reserve, g_my_regionsize);\n" +
"                        /* Start with the current region's top */\n" +
"                        memory_info.BaseAddress = g_last->top_reserved;\n" +
"                        /* Assert preconditions */\n" +
"                        assert ((unsigned) memory_info.BaseAddress % g_pagesize == 0);\n" +
"                        assert (0 < reserve_size && reserve_size % g_regionsize == 0);\n" +
"                        while (VirtualQuery (memory_info.BaseAddress, &memory_info, sizeof (memory_info))) {\n" +
"                            /* Assert postconditions */\n" +
"                            assert ((unsigned) memory_info.BaseAddress % g_pagesize == 0);\n" +
"#ifdef TRACE\n" +
"                            printf (\"Query %p %d %s\\n\", memory_info.BaseAddress, memory_info.RegionSize,\n" +
"                                    memory_info.State == MEM_FREE ? \"FREE\":\n" +
"                                    (memory_info.State == MEM_RESERVE ? \"RESERVED\":\n" +
"                                     (memory_info.State == MEM_COMMIT ? \"COMMITTED\": \"?\")));\n" +
"#endif\n" +
"                            /* Region is free, well aligned and big enough: we are done */\n" +
"                            if (memory_info.State == MEM_FREE &&\n" +
"                                (unsigned) memory_info.BaseAddress % g_regionsize == 0 &&\n" +
"                                memory_info.RegionSize >= (unsigned) reserve_size) {\n" +
"                                found = TRUE;\n" +
"                                break;\n" +
"                            }\n" +
"                            /* From now on we can't get contiguous memory! */\n" +
"                            contiguous = FALSE;\n" +
"                            /* Recompute size to reserve */\n" +
"                            reserve_size = CEIL (allocate_size, g_my_regionsize);\n" +
"                            memory_info.BaseAddress = (char *) memory_info.BaseAddress + memory_info.RegionSize;\n" +
"                            /* Assert preconditions */\n" +
"                            assert ((unsigned) memory_info.BaseAddress % g_pagesize == 0);\n" +
"                            assert (0 < reserve_size && reserve_size % g_regionsize == 0);\n" +
"                        }\n" +
"                        /* Search failed? */\n" +
"                        if (! found)\n" +
"                            goto sbrk_exit;\n" +
"                        /* Assert preconditions */\n" +
"                        assert ((unsigned) memory_info.BaseAddress % g_regionsize == 0);\n" +
"                        assert (0 < reserve_size && reserve_size % g_regionsize == 0);\n" +
"                        /* Try to reserve this */\n" +
"                        base_reserved = VirtualAlloc (memory_info.BaseAddress, reserve_size,\n" +
"                                                      MEM_RESERVE, PAGE_NOACCESS);\n" +
"                        if (! base_reserved) {\n" +
"                            int rc = GetLastError ();\n" +
"                            if (rc != ERROR_INVALID_ADDRESS)\n" +
"                                goto sbrk_exit;\n" +
"                        }\n" +
"                        /* A null pointer signals (hopefully) a race condition with another thread. */\n" +
"                        /* In this case, we try again. */\n" +
"                    } while (! base_reserved);\n" +
"                    /* Check returned pointer for consistency */\n" +
"                    if (memory_info.BaseAddress && base_reserved != memory_info.BaseAddress)\n" +
"                        goto sbrk_exit;\n" +
"                    /* Assert postconditions */\n" +
"                    assert ((unsigned) base_reserved % g_regionsize == 0);\n" +
"#ifdef TRACE\n" +
"                    printf (\"Reserve %p %d\\n\", base_reserved, reserve_size);\n" +
"#endif\n" +
"                    /* Did we get contiguous memory? */\n" +
"                    if (contiguous) {\n" +
"                        long start_size = (char *) g_last->top_committed - (char *) g_last->top_allocated;\n" +
"                        /* Adjust allocation size */\n" +
"                        allocate_size -= start_size;\n" +
"                        /* Adjust the regions allocation top */\n" +
"                        g_last->top_allocated = g_last->top_committed;\n" +
"                        /* Recompute the size to commit */\n" +
"                        to_commit = (char *) g_last->top_allocated + allocate_size - (char *) g_last->top_committed;\n" +
"                        /* Round size to commit */\n" +
"                        commit_size = CEIL (to_commit, g_my_pagesize);\n" +
"                    }\n" +
"                    /* Append the new region to the list */\n" +
"                    if (! region_list_append (&g_last, base_reserved, reserve_size))\n" +
"                        goto sbrk_exit;\n" +
"                    /* Didn't we get contiguous memory? */\n" +
"                    if (! contiguous) {\n" +
"                        /* Recompute the size to commit */\n" +
"                        to_commit = (char *) g_last->top_allocated + allocate_size - (char *) g_last->top_committed;\n" +
"                        /* Round size to commit */\n" +
"                        commit_size = CEIL (to_commit, g_my_pagesize);\n" +
"                    }\n" +
"                }\n" +
"            }\n" +
"            /* Assert preconditions */\n" +
"            assert ((unsigned) g_last->top_committed % g_pagesize == 0);\n" +
"            assert (0 < commit_size && commit_size % g_pagesize == 0); {\n" +
"                /* Commit this */\n" +
"                void *base_committed = VirtualAlloc (g_last->top_committed, commit_size,\n" +
"                                                     MEM_COMMIT, PAGE_READWRITE);\n" +
"                /* Check returned pointer for consistency */\n" +
"                if (base_committed != g_last->top_committed)\n" +
"                    goto sbrk_exit;\n" +
"                /* Assert postconditions */\n" +
"                assert ((unsigned) base_committed % g_pagesize == 0);\n" +
"#ifdef TRACE\n" +
"                printf (\"Commit %p %d\\n\", base_committed, commit_size);\n" +
"#endif\n" +
"                /* Adjust the regions commit top */\n" +
"                g_last->top_committed = (char *) base_committed + commit_size;\n" +
"            }\n" +
"        }\n" +
"        /* Adjust the regions allocation top */\n" +
"        g_last->top_allocated = (char *) g_last->top_allocated + allocate_size;\n" +
"        result = (char *) g_last->top_allocated - size;\n" +
"    /* Deallocation requested? */\n" +
"    } else if (size < 0) {\n" +
"        long deallocate_size = - size;\n" +
"        /* As long as we have a region to release */\n" +
"        while ((char *) g_last->top_allocated - deallocate_size < (char *) g_last->top_reserved - g_last->reserve_size) {\n" +
"            /* Get the size to release */\n" +
"            long release_size = g_last->reserve_size;\n" +
"            /* Get the base address */\n" +
"            void *base_reserved = (char *) g_last->top_reserved - release_size;\n" +
"            /* Assert preconditions */\n" +
"            assert ((unsigned) base_reserved % g_regionsize == 0);\n" +
"            assert (0 < release_size && release_size % g_regionsize == 0); {\n" +
"                /* Release this */\n" +
"                int rc = VirtualFree (base_reserved, 0,\n" +
"                                      MEM_RELEASE);\n" +
"                /* Check returned code for consistency */\n" +
"                if (! rc)\n" +
"                    goto sbrk_exit;\n" +
"#ifdef TRACE\n" +
"                printf (\"Release %p %d\\n\", base_reserved, release_size);\n" +
"#endif\n" +
"            }\n" +
"            /* Adjust deallocation size */\n" +
"            deallocate_size -= (char *) g_last->top_allocated - (char *) base_reserved;\n" +
"            /* Remove the old region from the list */\n" +
"            if (! region_list_remove (&g_last))\n" +
"                goto sbrk_exit;\n" +
"        } {\n") +
(
"            /* Compute the size to decommit */\n" +
"            long to_decommit = (char *) g_last->top_committed - ((char *) g_last->top_allocated - deallocate_size);\n" +
"            if (to_decommit >= g_my_pagesize) {\n" +
"                /* Compute the size to decommit */\n" +
"                long decommit_size = FLOOR (to_decommit, g_my_pagesize);\n" +
"                /*  Compute the base address */\n" +
"                void *base_committed = (char *) g_last->top_committed - decommit_size;\n" +
"                /* Assert preconditions */\n" +
"                assert ((unsigned) base_committed % g_pagesize == 0);\n" +
"                assert (0 < decommit_size && decommit_size % g_pagesize == 0); {\n" +
"                    /* Decommit this */\n" +
"                    int rc = VirtualFree ((char *) base_committed, decommit_size,\n" +
"                                          MEM_DECOMMIT);\n" +
"                    /* Check returned code for consistency */\n" +
"                    if (! rc)\n" +
"                        goto sbrk_exit;\n" +
"#ifdef TRACE\n" +
"                    printf (\"Decommit %p %d\\n\", base_committed, decommit_size);\n" +
"#endif\n" +
"                }\n" +
"                /* Adjust deallocation size and regions commit and allocate top */\n" +
"                deallocate_size -= (char *) g_last->top_allocated - (char *) base_committed;\n" +
"                g_last->top_committed = base_committed;\n" +
"                g_last->top_allocated = base_committed;\n" +
"            }\n" +
"        }\n" +
"        /* Adjust regions allocate top */\n" +
"        g_last->top_allocated = (char *) g_last->top_allocated - deallocate_size;\n" +
"        /* Check for underflow */\n" +
"        if ((char *) g_last->top_reserved - g_last->reserve_size > (char *) g_last->top_allocated ||\n" +
"            g_last->top_allocated > g_last->top_committed) {\n" +
"            /* Adjust regions allocate top */\n" +
"            g_last->top_allocated = (char *) g_last->top_reserved - g_last->reserve_size;\n" +
"            goto sbrk_exit;\n" +
"        }\n" +
"        result = g_last->top_allocated;\n" +
"    }\n" +
"    /* Assert invariants */\n" +
"    assert (g_last);\n" +
"    assert ((char *) g_last->top_reserved - g_last->reserve_size <= (char *) g_last->top_allocated &&\n" +
"            g_last->top_allocated <= g_last->top_committed);\n" +
"    assert ((char *) g_last->top_reserved - g_last->reserve_size <= (char *) g_last->top_committed &&\n" +
"            g_last->top_committed <= g_last->top_reserved &&\n" +
"            (unsigned) g_last->top_committed % g_pagesize == 0);\n" +
"    assert ((unsigned) g_last->top_reserved % g_regionsize == 0);\n" +
"    assert ((unsigned) g_last->reserve_size % g_regionsize == 0);\n" +
"\n" +
"sbrk_exit:\n" +
"#if defined (USE_MALLOC_LOCK) && defined (NEEDED)\n" +
"    /* Release spin lock */\n" +
"    slrelease (&g_sl);\n" +
"#endif\n" +
"    return result;\n" +
"}\n" +
"\n" +
"/* mmap for windows */\n" +
"static void *mmap (void *ptr, long size, long prot, long type, long handle, long arg) {\n" +
"    static long g_pagesize;\n" +
"    static long g_regionsize;\n" +
"#ifdef TRACE\n" +
"    printf (\"mmap %d\\n\", size);\n" +
"#endif\n" +
"#if defined (USE_MALLOC_LOCK) && defined (NEEDED)\n" +
"    /* Wait for spin lock */\n" +
"    slwait (&g_sl);\n" +
"#endif\n" +
"    /* First time initialization */\n" +
"    if (! g_pagesize)\n" +
"        g_pagesize = getpagesize ();\n" +
"    if (! g_regionsize)\n" +
"        g_regionsize = getregionsize ();\n" +
"    /* Assert preconditions */\n" +
"    assert ((unsigned) ptr % g_regionsize == 0);\n" +
"    assert (size % g_pagesize == 0);\n" +
"    /* Allocate this */\n" +
"    ptr = VirtualAlloc (ptr, size,\n" +
"                        MEM_RESERVE | MEM_COMMIT | MEM_TOP_DOWN, PAGE_READWRITE);\n" +
"    if (! ptr) {\n" +
"        ptr = (void *) MORECORE_FAILURE;\n" +
"        goto mmap_exit;\n" +
"    }\n" +
"    /* Assert postconditions */\n" +
"    assert ((unsigned) ptr % g_regionsize == 0);\n" +
"#ifdef TRACE\n" +
"    printf (\"Commit %p %d\\n\", ptr, size);\n" +
"#endif\n" +
"mmap_exit:\n" +
"#if defined (USE_MALLOC_LOCK) && defined (NEEDED)\n" +
"    /* Release spin lock */\n" +
"    slrelease (&g_sl);\n" +
"#endif\n" +
"    return ptr;\n" +
"}\n" +
"\n" +
"/* munmap for windows */\n" +
"static long munmap (void *ptr, long size) {\n" +
"    static long g_pagesize;\n" +
"    static long g_regionsize;\n" +
"    int rc = MUNMAP_FAILURE;\n" +
"#ifdef TRACE\n" +
"    printf (\"munmap %p %d\\n\", ptr, size);\n" +
"#endif\n" +
"#if defined (USE_MALLOC_LOCK) && defined (NEEDED)\n" +
"    /* Wait for spin lock */\n" +
"    slwait (&g_sl);\n" +
"#endif\n" +
"    /* First time initialization */\n" +
"    if (! g_pagesize)\n" +
"        g_pagesize = getpagesize ();\n" +
"    if (! g_regionsize)\n" +
"        g_regionsize = getregionsize ();\n" +
"    /* Assert preconditions */\n" +
"    assert ((unsigned) ptr % g_regionsize == 0);\n" +
"    assert (size % g_pagesize == 0);\n" +
"    /* Free this */\n" +
"    if (! VirtualFree (ptr, 0,\n" +
"                       MEM_RELEASE))\n" +
"        goto munmap_exit;\n" +
"    rc = 0;\n" +
"#ifdef TRACE\n" +
"    printf (\"Release %p %d\\n\", ptr, size);\n" +
"#endif\n" +
"munmap_exit:\n" +
"#if defined (USE_MALLOC_LOCK) && defined (NEEDED)\n" +
"    /* Release spin lock */\n" +
"    slrelease (&g_sl);\n" +
"#endif\n" +
"    return rc;\n" +
"}\n" +
"\n" +
"static void vminfo (CHUNK_SIZE_T  *free, CHUNK_SIZE_T  *reserved, CHUNK_SIZE_T  *committed) {\n" +
"    MEMORY_BASIC_INFORMATION memory_info;\n" +
"    memory_info.BaseAddress = 0;\n" +
"    *free = *reserved = *committed = 0;\n" +
"    while (VirtualQuery (memory_info.BaseAddress, &memory_info, sizeof (memory_info))) {\n" +
"        switch (memory_info.State) {\n" +
"        case MEM_FREE:\n" +
"            *free += memory_info.RegionSize;\n" +
"            break;\n" +
"        case MEM_RESERVE:\n" +
"            *reserved += memory_info.RegionSize;\n" +
"            break;\n" +
"        case MEM_COMMIT:\n" +
"            *committed += memory_info.RegionSize;\n" +
"            break;\n" +
"        }\n" +
"        memory_info.BaseAddress = (char *) memory_info.BaseAddress + memory_info.RegionSize;\n" +
"    }\n" +
"}\n" +
"\n") +
(
"static int cpuinfo (int whole, CHUNK_SIZE_T  *kernel, CHUNK_SIZE_T  *user) {\n" +
"    if (whole) {\n" +
"        __int64 creation64, exit64, kernel64, user64;\n" +
"        int rc = GetProcessTimes (GetCurrentProcess (),\n" +
"                                  (FILETIME *) &creation64,\n" +
"                                  (FILETIME *) &exit64,\n" +
"                                  (FILETIME *) &kernel64,\n" +
"                                  (FILETIME *) &user64);\n" +
"        if (! rc) {\n" +
"            *kernel = 0;\n" +
"            *user = 0;\n" +
"            return FALSE;\n" +
"        }\n" +
"        *kernel = (CHUNK_SIZE_T) (kernel64 / 10000);\n" +
"        *user = (CHUNK_SIZE_T) (user64 / 10000);\n" +
"        return TRUE;\n" +
"    } else {\n" +
"        __int64 creation64, exit64, kernel64, user64;\n" +
"        int rc = GetThreadTimes (GetCurrentThread (),\n" +
"                                 (FILETIME *) &creation64,\n" +
"                                 (FILETIME *) &exit64,\n" +
"                                 (FILETIME *) &kernel64,\n" +
"                                 (FILETIME *) &user64);\n" +
"        if (! rc) {\n" +
"            *kernel = 0;\n" +
"            *user = 0;\n" +
"            return FALSE;\n" +
"        }\n" +
"        *kernel = (CHUNK_SIZE_T) (kernel64 / 10000);\n" +
"        *user = (CHUNK_SIZE_T) (user64 / 10000);\n" +
"        return TRUE;\n" +
"    }\n" +
"}\n" +
"\n" +
"#endif /* WIN32 */\n" +
"\n" +
"#endif // NDEBUG\n" +
"\n" +
"};  /* end of namespace KJS */\n");


var thai =
"ประเทศไทย\n" +
"จากวิกิพีเดีย สารานุกรมเสรี\n" +
"ไปที่: ป้ายบอกทาง, ค้นหา\n" +
"	\n" +
"\n" +
"เนื่องจากบทความนี้ถูกล็อกเนื่องจาก ถูกก่อกวนหลายครั้งติดต่อกัน การแก้ไขจากผู้ที่ไม่ได้ลงทะเบียน หรือผู้ใช้ใหม่ไม่สามารถทำได้ขณะนี้\n" +
"คุณสามารถแสดงความเห็น เสนอข้อความ หรือขอให้ยกเลิกการป้องกันได้ในหน้าอภิปราย หรือลงทะเบียนโดยสร้างชื่อผู้ใช้\n" +
"   \n" +
"วิกิพีเดีย:บทความคัดสรร\n" +
"\n" +
"    \"ไทย\" เปลี่ยนทางมาที่นี่ สำหรับความหมายอื่น ดูที่ ไทย (แก้ความกำกวม)\n" +
"\n" +
"ราชอาณาจักรไทย\n" +
"ธงชาติไทย 	ตราแผ่นดินของไทย\n" +
"ธงชาติ 	ตราแผ่นดิน\n" +
"คำขวัญ: ชาติ ศาสนา พระมหากษัตริย์\n" +
"เพลงชาติ: เพลงชาติไทย\n" +
"แผนที่แสดงที่ตั้งของประเทศไทย\n" +
"เมืองหลวง 	กรุงเทพมหานคร\n" +
"13°44′N 100°30′E\n" +
"เมืองใหญ่สุด 	กรุงเทพมหานคร\n" +
"ภาษาราชการ 	ภาษาไทย\n" +
"รัฐบาล 	เผด็จการทหาร\n" +
" - ประมุขแห่งรัฐ 	พระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดช\n" +
" - นายกรัฐมนตรี 	พลเอกสุรยุทธ์ จุลานนท์\n" +
" - ประธานคณะมนตรีความมั่นคงแห่งชาติ 	พลอากาศเอก ชลิต พุกผาสุข (รักษาการ)\n" +
"สถาปนาเป็น\n" +
"• สุโขทัย\n" +
"• กรุงศรีอยุธยา\n" +
"• กรุงธนบุรี\n" +
"• กรุงรัตนโกสินทร์ 	\n" +
"พ.ศ. 1781–1911\n" +
"1893–2310\n" +
"2310–6 เมษายน 2325\n" +
"6 เมษายน 2325–ปัจจุบัน\n" +
"เนื้อที่\n" +
" - ทั้งหมด\n" +
" \n" +
" - พื้นน้ำ (%) 	 \n" +
"514,000 กม.² (อันดับที่ 49)\n" +
"198,457 ไมล์² \n" +
"0.4%\n" +
"ประชากร\n" +
" - 2548 ประมาณ\n" +
" - 2543\n" +
" - ความหนาแน่น 	 \n" +
"62,418,054 (อันดับที่ 19)\n" +
"60,916,441\n" +
"122/กม² (อันดับที่ 59)\n" +
"{{{population_densitymi²}}}/ไมล์² \n" +
"GDP (PPP)\n" +
" - รวม\n" +
" - ต่อประชากร 	2548 ค่าประมาณ\n" +
"$559.5 billion (อันดับที่ 21)\n" +
"$8,542 (อันดับที่ 72)\n" +
"HDI (2546) 	0.778 (อันดับที่ 73) – ปานกลาง\n" +
"สกุลเงิน 	บาท (฿) (THB)\n" +
"เขตเวลา 	(UTC+7)\n" +
"รหัสอินเทอร์เน็ต 	.th\n" +
"รหัสโทรศัพท์ 	+66\n" +
"\n" +
"ประเทศไทย หรือ ราชอาณาจักรไทย ตั้งอยู่ในเอเชียตะวันออกเฉียงใต้ มีพรมแดนทางทิศตะวันออกติดลาวและกัมพูชา ทิศใต้ติดอ่าวไทยและมาเลเซีย ทิศตะวันตกติดทะเลอันดามันและพม่า และทิศเหนือติดพม่าและลาว โดยมีแม่น้ำโขงกั้นเป็นบางช่วง\n" +
"\n" +
"ประเทศไทยเป็นสมาชิกของสหประชาชาติ เอเปค และ อาเซียน มีศูนย์รวมการปกครองอยู่ที่ กรุงเทพมหานคร ซึ่งเป็นเมืองหลวงของประเทศ\n" +
"\n" +
"พระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดช ทรงเป็นพระมหากษัตริย์ที่ครองราชย์ ในฐานะประมุขแห่งรัฐ ยาวนานที่สุดในโลกถึง 60 ปี\n" +
"\n" +
"\n" +
"เนื้อหา\n" +
"[ซ่อน]\n" +
"\n" +
"    * 1 ประวัติศาสตร์\n" +
"          o 1.1 ชื่อประเทศไทย\n" +
"    * 2 การเมืองการปกครอง\n" +
"          o 2.1 เขตการปกครอง\n" +
"          o 2.2 เมืองใหญ่ / จังหวัดใหญ่\n" +
"    * 3 ภูมิอากาศและภูมิประเทศ\n" +
"          o 3.1 ภูมิประเทศ\n" +
"          o 3.2 ภูมิอากาศ\n" +
"    * 4 เศรษฐกิจ\n" +
"          o 4.1 เศรษฐกิจหลักของประเทศ\n" +
"          o 4.2 การคมนาคม\n" +
"          o 4.3 การสื่อสาร\n" +
"    * 5 สังคม\n" +
"          o 5.1 ชนชาติ\n" +
"          o 5.2 ศาสนา\n" +
"          o 5.3 การศึกษา\n" +
"          o 5.4 ภาษา\n" +
"          o 5.5 ศิลปะและวัฒนธรรม\n" +
"          o 5.6 กีฬา\n" +
"          o 5.7 วันสำคัญ\n" +
"    * 6 ลำดับที่สำคัญ\n" +
"    * 7 อ้างอิง\n" +
"    * 8 แหล่งข้อมูลอื่น\n" +
"\n" +
"ประวัติศาสตร์\n" +
"\n" +
"    ดูบทความหลักที่ ประวัติศาสตร์ไทย\n" +
"\n" +
"ประเทศไทยมีประวัติศาสตร์ยาวนานมากนับเริ่มแต่การล่มสลายของราชอาณาจักรขอม-จักรวรรดินครวัต นครธม เมื่อต้นๆ คริสต์ศตวรรษที่ 13 [1]โดยมีความสืบเนื่องและคาบเกี่ยวระหว่างอาณาจักรโบราณหลายแห่ง เช่น อาณาจักรทวารวดี ศรีวิชัย ละโว้ เขมร ฯลฯ โดยเริ่มมีความชัดเจนในอาณาจักรสุโขทัยตั้งแต่ปี พ.ศ. 1781 อาณาจักรล้านนาทางภาคเหนือ กระทั่งเสื่อมอำนาจลงในช่วงต้นพุทธศตวรรษที่ 19 แล้วความรุ่งเรืองได้ปรากฏขึ้นในอาณาจักรทางใต้ ณ กรุงศรีอยุธยา โดยยังมีอาณาเขตที่ไม่แน่ชัด ครั้นเมื่อเสียกรุงศรีอยุธยาเป็นครั้งที่สองในปี พ.ศ. 2310 พระเจ้าตากสินจึงได้ย้ายราชธานีมาอยู่ที่กรุงธนบุรี\n" +
"\n" +
"ภายหลังสิ้นสุดอำนาจและมีการสถาปนากรุงรัตนโกสินทร์เมื่อ พ.ศ. 2325 อาณาจักรสยามเริ่มมีความเป็นปึกแผ่น มีการผนวกดินแดนบางส่วนของอาณาจักรล้านช้าง ครั้นในรัชกาลที่ 5 ได้ผนวกดินแดนของเมืองเชียงใหม่ หรืออาณาจักรล้านนาส่วนล่าง (ส่วนบนอยู่บริเวณเชียงตุง) เป็นการรวบรวมดินแดนครั้งใหญ่ครั้งสุดท้าย วันที่ 24 มิถุนายน พ.ศ. 2475 ได้เปลี่ยนแปลงการปกครองมาเป็นระบอบประชาธิปไตยแต่ก็ต้องรออีกถึง 41 ปี กว่าจะได้นายกรัฐมนตรีที่มาจากการเลือกตั้งครั้งแรกเมื่อ พ.ศ. 2516 หลังจากเหตุการณ์ 14 ตุลา หลังจากนั้นมีเหตุการณ์เรียกร้องประชาธิปไตยอีกสองครั้งคือ เหตุการณ์ 6 ตุลา และ เหตุการณ์พฤษภาทมิฬ ล่าสุดได้เกิดรัฐประหารขึ้นอีกครั้งในเดือนกันยายน พ.ศ. 2549 ซึ่งเป็นการยึดอำนาจจากรัฐบาลรักษาการ หลังจากได้มีการยุบสภาผู้แทนราษฎรเมื่อเดือนกุมภาพันธ์ 2549\n" +
"\n" +
"ชื่อประเทศไทย\n" +
"\n" +
"คำว่า ไทย มีความหมายในภาษาไทยว่า อิสรภาพ เสรีภาพ หรืออีกความหมายคือ ใหญ่ ยิ่งใหญ่ เพราะการจะเป็นอิสระได้จะต้องมีกำลังที่มากกว่า แข็งแกร่งกว่า เพื่อป้องกันการรุกรานจากข้าศึก เดิมประเทศไทยใช้ชื่อ สยาม (Siam) แต่ได้เปลี่ยนมาเป็นชื่อปัจจุบัน เมื่อปี พ.ศ. 2482 ตามประกาศรัฐนิยม ฉบับที่ 1 ของรัฐบาลจอมพล ป. พิบูลสงคราม ให้ใช้ชื่อ ประเทศ ประชาชน และสัญชาติว่า \"ไทย\" โดยในช่วงต่อมาได้เปลี่ยนกลับเป็นสยามเมื่อปี พ.ศ. 2488 ในช่วงเปลี่ยนนายกรัฐมนตรี แต่ในที่สุดได้เปลี่ยนกลับมาชื่อไทยอีกครั้งในปี พ.ศ. 2491 ซึ่งเป็นช่วงที่จอมพล ป. พิบูลสงครามเป็นนายกรัฐมนตรีในสมัยต่อมา ช่วงแรกเปลี่ยนเฉพาะชื่อภาษาไทยเท่านั้น ชื่อภาษาฝรั่งเศส[2]และอังกฤษคงยังเป็น \"Siam\" อยู่จนกระทั่งเดือนเมษายน พ.ศ. 2491 จึงได้เปลี่ยนชื่อภาษาฝรั่งเศสเป็น \"Thaïlande\" และภาษาอังกฤษเป็น \"Thailand\" อย่างในปัจจุบัน อย่างไรก็ตาม ชื่อ สยาม ยังเป็นที่รู้จักแพร่หลายทั้งในและต่างประเทศ.\n" +
"\n" +
"การเมืองการปกครอง\n" +
"\n" +
"เดิมประเทศไทยมีการปกครองระบอบสมบูรณาญาสิทธิราชย์ จนกระทั่งวันที่ 24 มิถุนายน พ.ศ. 2475 คณะราษฎรได้ทำการเปลี่ยนแปลงการปกครองเป็นราชาธิปไตยภายใต้รัฐธรรมนูญ โดยแบ่งอำนาจเป็นสามฝ่าย ได้แก่ ฝ่ายบริหาร ฝ่ายนิติบัญญัติและฝ่ายตุลาการ โดยฝ่ายบริหารจะมีนายกรัฐมนตรีเป็นหัวหน้ารัฐบาลซึ่งมากจากการแต่งตั้ง ฝ่ายนิติบัญญัติ ได้แก่ สภานิติบัญญัติแห่งชาติ และฝ่ายตุลาการ คือ ศาลยุติธรรม ศาลรัฐธรรมนูญ และศาลปกครอง\n" +
"\n" +
"ปัจจุบัน ประเทศไทยอยู่ภายใต้การปกครองระบอบเผด็จการทหาร โดยมีรัฐบาลชั่วคราวซึ่งแต่งตั้งโดยคณะมนตรีความมั่นคงแห่งชาติ หลังเกิดเหตุการณ์รัฐประหารเมื่อคืนวันที่ 19 กันยายน พ.ศ. 2549\n" +
"\n" +
"เขตการปกครอง\n" +
"\n" +
"ประเทศไทยแบ่งเขตการบริหารออกเป็น การบริหารราชการส่วนภูมิภาค ได้แก่จังหวัด 75 จังหวัด นอกจากนั้นยังมีการปกครองส่วนท้องถิ่น ได้แก่ กรุงเทพมหานคร เมืองพัทยา องค์การบริหารส่วนจังหวัด เทศบาล และองค์การบริหารส่วนตำบล ส่วน'สุขาภิบาล'นั้นถูกยกฐานะไปเป็นเทศบาลทั้งหมดในปี พ.ศ. 2542\n" +
"\n" +
"    รายชื่อจังหวัดทั้งหมดดูเพิ่มเติมที่ จังหวัดในประเทศไทย\n" +
"\n" +
"เมืองใหญ่ / จังหวัดใหญ่\n" +
"ประเทศไทย จังหวัดในประเทศไทย\n" +
"ประเทศไทย จังหวัดในประเทศไทย\n" +
"กรุงเทพมหานครริมแม่น้ำเจ้าพระยา\n" +
"กรุงเทพมหานครริมแม่น้ำเจ้าพระยา\n" +
"\n" +
"นอกจากกรุงเทพมหานครแล้ว มีหลายเมืองที่มีประชากรอยู่เป็นจำนวนมาก (ข้อมูลเดือนตุลาคม พ.ศ. 2549 ของ กรมการปกครอง กระทรวงมหาดไทย ) โดยเรียงลำดับตามตารางด้านล่าง โดยดูจากจำนวนประชากรในเขตเทศบาลและกรุงเทพมหานคร ซึ่งจะแสดงประชากรในเขตเมืองได้อย่างแท้จริง\n" +
"อันดับ 	เมือง / เทศบาล 	จำนวนประชากร 	จังหวัด\n" +
"1 	กรุงเทพมหานคร 	6,121,672 	กรุงเทพมหานคร\n" +
"2 	นนทบุรี 	266,941 	นนทบุรี\n" +
"3 	ปากเกร็ด 	167,138 	นนทบุรี\n" +
"4 	หาดใหญ่ 	157,678 	สงขลา\n" +
"5 	เชียงใหม่ 	150,805 	เชียงใหม่\n" +
"6 	นครราชสีมา 	149,938 	นครราชสีมา\n" +
"7 	อุดรธานี 	142,670 	อุดรธานี\n" +
"8 	สุราษฎร์ธานี 	124,665 	สุราษฎร์ธานี\n" +
"9 	ขอนแก่น 	121,283 	ขอนแก่น\n" +
"10 	นครศรีธรรมราช 	106,293 	นครศรีธรรมราช\n" +
"\n" +
"นอกจากนี้ยังมีการเรียงลำดับประชากรตามจังหวัดได้ดังต่อไปนี้\n" +
"อันดับ 	จังหวัด 	จำนวนประชากร 	ภาค\n" +
"1 	กรุงเทพมหานคร 	6,121,672 	ภาคกลาง\n" +
"2 	นครราชสีมา 	2,546,763 	ภาคตะวันออกเฉียงเหนือ\n" +
"3 	อุบลราชธานี 	1,774,808 	ภาคตะวันออกเฉียงเหนือ\n" +
"4 	ขอนแก่น 	1,747,542 	ภาคตะวันออกเฉียงเหนือ\n" +
"5 	เชียงใหม่ 	1,650,009 	ภาคเหนือ\n" +
"6 	บุรีรัมย์ 	1,531,430 	ภาคตะวันออกเฉียงเหนือ\n" +
"7 	อุดรธานี 	1,523,802 	ภาคตะวันออกเฉียงเหนือ\n" +
"8 	นครศรีธรรมราช 	1,504,420 	ภาคใต้\n" +
"9 	ศรีสะเกษ 	1,443,975 	ภาคตะวันออกเฉียงเหนือ\n" +
"10 	สุรินทร์ 	1,374,700 	ภาคตะวันออกเฉียงเหนือ\n" +
"\n" +
"    ดูข้อมูลทั้งหมดที่ เมืองใหญ่ของประเทศไทยเรียงตามจำนวนประชากร และ จังหวัดในประเทศไทยเรียงตามจำนวนประชากร\n" +
"\n" +
"ภูมิอากาศและภูมิประเทศ\n" +
"\n" +
"ภูมิประเทศ\n" +
"ประเทศไทย สภาพทางภูมิศาสตร์\n" +
"ประเทศไทย สภาพทางภูมิศาสตร์\n" +
"\n" +
"ประเทศไทยมีสภาพทางภูมิศาสตร์ที่หลากหลาย ภาคเหนือประกอบด้วยเทือกเขาจำนวนมาก จุดที่สูงที่สุด คือ ดอยอินทนนท์ (2,576 เมตร) ในจังหวัดเชียงใหม่ ภาคตะวันออกเฉียงเหนือเป็นที่ราบสูงโคราชติดกับแม่น้ำโขงทางด้านตะวันออก ภาคกลางเป็นที่ราบลุ่มแม่น้ำเจ้าพระยา ซึ่งสายน้ำไหลลงสู่อ่าวไทย ภาคใต้มีจุดที่แคบลง ณ คอคอดกระแล้วขยายใหญ่เป็นคาบสมุทรมลายู\n" +
"\n" +
"    * เมื่อเปรียบเทียบพื้นที่ของประเทศไทย กับ ประเทศอื่น จะได้ดังนี้\n" +
"          o ประเทศพม่า ใหญ่กว่าประเทศไทยประมาณ 1.3 เท่า\n" +
"          o ประเทศอินโดนีเซีย ใหญ่กว่าประมาณ 3.7 เท่า\n" +
"          o ประเทศอินเดีย ใหญ่กว่าประมาณ 6.4 เท่า\n" +
"          o ประเทศจีน และ สหรัฐอเมริกา ใหญ่กว่าประมาณ 19 เท่า\n" +
"          o ประเทศรัสเซีย ใหญ่กว่าประมาณ 33 เท่า\n" +
"          o ขนาดใกล้เคียงกับ ประเทศฝรั่งเศส ประเทศสวีเดน และ ประเทศสเปน\n" +
"\n" +
"วันที่ 26 ธันวาคม พ.ศ. 2547 ได้มีเหตุการณ์คลื่นสึนามิเกิดขึ้นก่อความเสียหายในเขตภาคใต้ของประเทศไทย\n" +
"\n" +
"ภูมิอากาศ\n" +
"\n" +
"ภูมิอากาศของไทยเป็นแบบเขตร้อน อากาศร้อนที่สุดในเดือนเมษายน-พฤษภาคม โดยจะมีฝนตกและเมฆมากจากลมมรสุมตะวันตกเฉียงใต้ในช่วงกลางเดือนพฤษภาคม-เดือนตุลาคม ส่วนในเดือนพฤศจิกายนถึงกลางเดือนมีนาคม อากาศแห้ง และหนาวเย็นจากลมมรสุมตะวันออกเฉียงเหนือ ยกเว้นภาคใต้ที่มีอากาศร้อนชื้นตลอดทั้งปี\n" +
"\n" +
"เศรษฐกิจ\n" +
"\n" +
"เศรษฐกิจหลักของประเทศ\n" +
"\n" +
"เกษตรกรรม อุตสาหกรรม การท่องเที่ยว การบริการ และ ทรัพยากรธรรมชาติ ถือเป็นเศรษฐกิจหลักที่ทำรายได้ให้กับคนในประเทศ โดยภาพรวมทางเศรษฐกิจอ้างอิงเมื่อ พ.ศ. 2546 มี GDP 5,930.4 พันล้านบาท ส่งออกมูลค่า 78.1 พันล้านเหรียญสหรัฐ ในขณะที่นำเข้า 74.3 พันล้านเหรียญสหรัฐ[3]\n" +
"ภาพพันธุ์ข้าวจากกรมวิชาการเกษตร\n" +
"ภาพพันธุ์ข้าวจากกรมวิชาการเกษตร\n" +
"ภาพยางพาราจากกรมวิชาการเกษตร\n" +
"ภาพยางพาราจากกรมวิชาการเกษตร\n" +
"\n" +
"ในด้านเกษตรกรรม ข้าว ถือเป็นผลผลิตที่สำคัญที่สุด เป็นผู้ผลิตและส่งออกข้าว เป็นอันดับหนึ่งของโลก ด้วยสัดส่วนการส่งออก ร้อยละ 36 รองลงมาคือ เวียดนาม ร้อยละ 20 อินเดีย ร้อยละ 18 สหรัฐอเมริกา ร้อยละ14 ปากีสถาน ร้อยละ 12 ตามลำดับ [4] พืชผลทางการเกษตรอื่นๆ ได้แก่ ยางพารา ผักและผลไม้ต่างๆ มีการเพาะเลี้ยงปศุสัตว์เช่น วัว สุกร เป็ด ไก่ สัตว์น้ำทั้งปลาน้ำจืด ปลาน้ำเค็มในกระชัง นากุ้ง เลี้ยงหอย รวมถึงการประมงทางทะเล ปี 2549 ไทยมีการส่งออกกุ้งไปสหรัฐฯ 177,717.29 ตัน มูลค่า 45,434.57 ล้านบาท [5]\n" +
"\n" +
"อุตสาหกรรมที่สำคัญ ได้แก่ อุตสาหกรรมแปรรูปทางการเกษตร สิ่งทอ อิเล็กทรอนิกส์ รถยนต์ ส่วนทรัพยากรธรรมชาติที่สำคัญเช่น ดีบุก ก๊าซธรรมชาติ จากข้อมูลปี พ.ศ. 2547 มีการผลิตสิ่งทอมูลค่า 211.4 พันล้านบาท แผงวงจรรวม 196.4 พันล้านบาท อาหารทะเลกระป๋อง 36.5 พันล้านบาท สับปะรดกระป๋อง 11.1 พันล้านบาท รถยนต์ส่วนบุคคล 2.99 แสนคัน รถบรรทุก รถกระบะ และอื่นๆ รวม 6.28 แสนคัน จักรยานยนต์ 2.28 ล้านคัน ดีบุก 694 ตัน ก๊าซธรรมชาติ 789 พันล้านลูกบาศก์ฟุต น้ำมันดิบ]] 31.1 ล้านบาร์เรล [6]\n" +
"เกาะพีพี สถานท่องเที่ยวที่สำคัญแห่งหนึ่งของประเทศ\n" +
"เกาะพีพี สถานท่องเที่ยวที่สำคัญแห่งหนึ่งของประเทศ\n" +
"\n" +
"ส่วนด้านการท่องเที่ยว การบริการและโรงแรม ในปี พ.ศ. 2547 มีนักท่องเที่ยวรวม 11.65 ล้านคน 56.52% มาจากเอเชียตะวันออกและอาเซียน (โดยเฉพาะมาเลเซียคิดเป็น 11.97% ญี่ปุ่น 10.33%) ยุโรป 24.29% ทวีปอเมริกาเหนือและใต้รวมกัน 7.02% [7] สถานที่ท่องเที่ยวที่สำคัญได้แก่ กรุงเทพมหานคร พัทยา ภาคใต้ฝั่งทะเลอันดามัน จังหวัดเชียงใหม่\n" +
"\n" +
"การคมนาคม\n" +
"\n" +
"ดูบทความหลัก การคมนาคมในประเทศไทย\n" +
"\n" +
"การคมนาคมในประเทศไทย ส่วนใหญ่ประกอบด้วย การเดินทางโดยรถยนต์ และ จักรยานยนต์ ทางหลวงสายหลักในประเทศไทย ได้แก่ ถนนพหลโยธิน (ทางหลวงหมายเลข 1) ถนนมิตรภาพ (ทางหลวงหมายเลข 2) ถนนสุขุมวิท (ทางหลวงหมายเลข 3) และถนนเพชรเกษม (ทางหลวงหมายเลข 4) และยังมีทางหลวงพิเศษระหว่างเมือง (มอเตอร์เวย์) ใน 2 เส้นทางคือ มอเตอร์เวย์กรุงเทพฯ-ชลบุรี (ทางหลวงหมายเลข 7) และถนนกาญจนาภิเษก (วงแหวนรอบนอกกรุงเทพมหานคร - ทางหลวงหมายเลข 9) นอกจากนี้ระบบขนส่งมวลชนจะมีการบริการตามเมืองใหญ่ต่างๆ ได้แก่ระบบรถเมล์ และรถไฟ รวมถึงระบบที่เริ่มมีการใช้งาน รถไฟลอยฟ้า และรถไฟใต้ดิน และในหลายพื้นที่จะมีการบริการรถสองแถว รวมถึงรถรับจ้างต่างๆ ได้แก่ แท็กซี่ เมลเครื่อง มอเตอร์ไซค์รับจ้าง และ รถตุ๊กตุ๊ก ในบางพื้นที่ ที่อยู่ริมน้ำจะมีเรือรับจ้าง และแพข้ามฟาก บริการ\n" +
"รถไฟฟ้าบีทีเอส สถานีอโศก\n" +
"รถไฟฟ้าบีทีเอส สถานีอโศก\n" +
"\n" +
"สำหรับการคมนาคมทางอากาศนั้น ปัจจุบันประเทศไทยได้เปิดใช้ท่าอากาศยานสุวรรณภูมิ ซึ่งเป็นท่าอากาศยานที่มีขนาดตัวอาคารที่ใหญ่ที่สุดในโลก และมีหอบังคับการบินที่สูงที่สุดในโลก ด้วยความสูง 132.2 เมตร ซึ่งรองรับผู้โดยสารได้ 45 ล้านคนต่อปี โดยเปิดอย่างเป็นทางการตั้งแต่วันที่ 29 กันยายน พ.ศ. 2549 ทดแทนท่าอากาศยานนานาชาติกรุงเทพ (ดอนเมือง) ที่เปิดใช้งานมานานถึง 92 ปี\n" +
"\n" +
"ส่วนการคมนาคมทางน้ำ ประเทศไทยมีท่าเรือหลักๆ คือ ท่าเรือกรุงเทพ(คลองเตย) และท่าเรือแหลมฉบัง\n" +
"\n" +
"การสื่อสาร\n" +
"\n" +
"    * ระบบโทรศัพท์ในประเทศไทยมีโทรศัพท์พื้นฐาน 7.035 ล้านหมายเลข (2548) และโทรศัพท์มือถือ 27.4 ล้านหมายเลข (2548) [8]\n" +
"    * สถานีวิทยุ: คลื่นเอฟเอ็ม 334 สถานี , คลื่นเอเอ็ม 204 สถานี และ คลื่นสั้น 6 สถานี (2542) โดยมีจำนวนผู้ใช้วิทยุ 13.96 ล้านคน (2540) [8]\n" +
"    * สถานีโทรทัศน์ มี 6 ช่องสถานี (โดยทุกช่องสถานีแม่ข่ายอยู่ในกรุงเทพ) มีสถานีเครือข่ายทั้งหมด 111 สถานี และจำนวนผู้ใช้โทรทัศน์ 15.19 ล้านคน (2540) [8]\n" +
"    * รหัสโดเมนอินเทอร์เน็ตใช้รหัส th\n" +
"\n" +
"สังคม\n" +
"วัดพระศรีรัตนศาสดาราม กรุงเทพมหานคร\n" +
"วัดพระศรีรัตนศาสดาราม กรุงเทพมหานคร\n" +
"\n" +
"ชนชาติ\n" +
"\n" +
"ในประเทศไทย ถือได้ว่า มีความหลากหลายทางเชื้อชาติ มีทั้ง ชาวไทย ชาวไทยเชื้อสายลาว ชาวไทยเชื้อสายมอญ ชาวไทยเชื้อสายเขมร รวมไปถึงกลุ่มชาวไทยเชื้อสายจีน ชาวไทยเชื้อสายมลายู ชาวชวา(แขกแพ) ชาวจาม(แขกจาม) ชาวเวียด ไปจนถึงชาวพม่า และชาวไทยภูเขาเผ่าต่างๆ เช่น ชาวกะเหรี่ยง ชาวลีซอ ชาวอ่าข่า ชาวอีก้อ ชาวม้ง ชาวเย้า รวมไปจนถึงชาวส่วย ชาวกูบ ชาวกวย ชาวจะราย ชาวระแดว์ ชาวข่า ชาวขมุ ซึ่งมีในปัจจุบันก็มีความสำคัญมาก ต่อวิถีชีวิต และวัฒนธรรมไทยในปัจจุบัน\n" +
"\n" +
"ประชากรชาวไทย 75% ชาวไทยเชื้อสายจีน 14% และอื่นๆ 11% [8]\n" +
"\n" +
"    ดูเพิ่มที่ ชาวไทย\n" +
"\n" +
"ศาสนา\n" +
"พระพุทธชินราช วัดพระศรีรัตนมหาธาตุวรมหาวิหาร จังหวัดพิษณุโลก\n" +
"พระพุทธชินราช วัดพระศรีรัตนมหาธาตุวรมหาวิหาร จังหวัดพิษณุโลก\n" +
"\n" +
"ประมาณร้อยละ 95 ของประชากรไทยนับถือศาสนาพุทธซึ่งเป็นศาสนาประจำชาติ(โดยพฤตินัย) นิกายเถรวาท ศาสนาอิสลามประมาณร้อยละ 4 (ส่วนใหญ่เป็นชาวไทยทางภาคใต้ตอนล่าง) ศาสนาคริสต์และศาสนาอื่นประมาณร้อยละ 1\n" +
"\n" +
"    ดูเพิ่มที่ พระพุทธศาสนาในประเทศไทย\n" +
"\n" +
"การศึกษา\n" +
"\n" +
"ในทางกฎหมาย รัฐบาลจะต้องจัดการศึกษาให้ขั้นพื้นฐานสิบสองปี แต่การศึกษาขั้นบังคับของประเทศไทยในปัจจุบันคือเก้าปี บุคคลทั่วไปจะเริ่มจากระดับชั้นอนุบาล เป็นการเตรียมความพร้อมก่อนการเรียนตามหลักสูตรพื้นฐาน ต่อเนื่องด้วยระดับประถมศึกษาและมัธยมศึกษาตอนต้น หลังจากจบการศึกษาระดับมัธยมต้น สามารถเลือกได้ระหว่างศึกษาต่อสายสามัญ ระดับมัธยมศึกษาตอนปลายเพื่อศึกษาต่อในระดับมหาวิทยาลัย หรือเลือกศึกษาต่อสายวิชาชีพ ในวิทยาลัยเทคนิค หรือพาณิชยการ หรือเลือกศึกษาต่อในสถาบันทางทหารหรือตำรวจ\n" +
"\n" +
"โรงเรียนและมหาวิทยาลัยในประเทศไทย แบ่งออกเป็น 2 ประเภทหลักได้แก่ โรงเรียนรัฐบาล และโรงเรียนเอกชน และ มหาวิทยาลัยรัฐบาล และมหาวิทยาลัยเอกชน โดยโรงเรียนรัฐบาลและมหาวิทยาลัยรัฐบาล จะเสียค่าเล่าเรียนน้อยกว่า โรงเรียนเอกชนและมหาวิทยาลัยเอกชน\n" +
"\n" +
"    ดูเพิ่มที่ รายชื่อสถาบันอุดมศึกษาในประเทศไทย\n" +
"\n" +
"ภาษา\n" +
"\n" +
"    ดูบทความหลักที่ ภาษาในประเทศไทย\n" +
"\n" +
"ภาษาไทย ประเทศไทยมีภาษาไทยเป็นภาษาราชการ ภาษาพูดของคนไทยมีมาแต่เมื่อไรยังไม่เป็นที่ทราบแน่ชัด แต่จากการสันนิฐานน่าจะมีมากว่า 4,000 ปีแล้ว ส่วนตัวอักษรนั้นเพิ่งมีการประดิษฐ์ขึ้นอย่างเป็นทางการในสมัยสุโขทัยโดย พ่อขุนรามคำแหงมหาราช ส่วนภาษาอื่นที่มีการใช้อยู่บ้าง เช่น ภาษาอังกฤษ ภาษาจีน เป็นต้น\n" +
"\n" +
"ศิลปะและวัฒนธรรม\n" +
"พระที่นั่งไอศวรรย์ทิพย์อาสน์ พระราชวังบางปะอิน จังหวัดพระนครศรีอยุธยา\n" +
"พระที่นั่งไอศวรรย์ทิพย์อาสน์ พระราชวังบางปะอิน จังหวัดพระนครศรีอยุธยา\n" +
"\n" +
"ศิลปะไทยมีลักษณะเฉพาะตัวค่อนข้างสูง โดยมีความกลมกลืนและคล้ายคลึงกับศิลปวัฒนธรรมเพื่อนบ้านอยู่บ้าง แต่ด้วยการสืบทอดและการสร้างสรรค์ใหม่ ทำให้ศิลปะไทยมีเอกลักษณ์สูง\n" +
"\n" +
"    * จิตรกรรม งานจิตรกรรมไทยนับว่าเป็นงานศิลปะชั้นสูง ได้รับการสืบทอดมาช้านาน มักปรากฏในงานจิตรกรรมฝาผนัง ตามวัดวาอาราม รวมทั้งในสมุดข่อยโบราณ งานจิตรกรรมไทยยังเกี่ยวข้องกับงานศิลปะแขนงอื่นๆ เช่น งานลงรักปิดทอง ภาพวาดพระบฏ เป็นต้น\n" +
"    * ประติมากรรม เดิมนั้นช่างไทยทำงานประติมากรรมเฉพาะสิ่งศักดิ์สิทธิ์ เช่น พระพุทธรูป เทวรูป โดยมีสกุลช่างต่างๆ นับตั้งแต่ก่อนสมัยสุโขทัย เรียกว่า สกุลช่างเชียงแสน สกุลช่างสุโขทัย อยุธยา และกระทั่งรัตนโกสินทร์ โดยใช้ทองสำริดเป็นวัสดุหลักในงานประติมากรรม เนื่องจากสามารถแกะแบบด้วยขี้ผึ้งและตกแต่งได้ แล้วจึงนำไปหล่อโลหะ เมื่อเทียบกับประติมากรรมศิลาในยุคก่อนนั้น งานสำริดนับว่าอ่อนช้อยงดงามกว่ามาก\n" +
"    * สถาปัตยกรรม สถาปัตยกรรมไทยมีปรากฏให้เห็นในชั้นหลัง เนื่องจากงานสถาปัตยกรรมส่วนใหญ่ชำรุดทรุดโทรมได้ง่าย โดยเฉพาะงานไม้ ไม่ปรากฏร่องรอยสมัยโบราณเลย สถาปัตยกรรมไทยมีให้เห็นอยู่ในรูปของบ้านเรือนไทย โบสถ์ วัด และปราสาทราชวัง ซึ่งล้วนแต่สร้างขึ้นให้เหมาะสมกับสภาพอากาศและการใช้สอยจริง\n" +
"\n" +
"    ดูเพิ่มที่ ศิลปะไทย\n" +
"\n" +
"กีฬา\n" +
"ราชมังคลากีฬาสถาน การกีฬาแห่งประเทศไทย\n" +
"ราชมังคลากีฬาสถาน การกีฬาแห่งประเทศไทย\n" +
"\n" +
"กีฬาที่นิยมมากที่สุดในประเทศไทยได้แก่ ฟุตบอล โดยในการแข่งขันระหว่างประเทศ ทีมชาติไทยได้เข้าเล่นและได้อันดับสูงสุดในเอเชียนคัพ ได้อันดับ 3 ใน เอเชียนคัพ 1972 กีฬาอื่นที่นิยมเล่นได้แก่ บาสเกตบอล มวย และแบดมินตัน โดยในประเทศไทยมีการจัดฟุตบอลอาชีพ โดยแบ่งแยกตามทีมประจำจังหวัด สำหรับกีฬาไทย ได้แก่ มวยไทย และ ตะกร้อ แม้จะมีความนิยมไม่เท่ากีฬาทั่วไป แต่ยังมีการเล่นโดยทั่วไปรวมถึงการเปิดสอนในโรงเรียน\n" +
"\n" +
"ประเทศไทยเป็นตัวแทนจัดงานเอเชียนเกมส์ 4 ครั้ง และซีเกมส์ ทั้งหมด 5 ครั้ง โดยจัดครั้งแรกที่ประเทศไทย\n" +
"\n" +
"นักกีฬาไทยที่มีชื่อเสียงมาก ได้แก่\n" +
"\n" +
"    * นักมวย - เขาทราย แกแล็คซี่, สด จิตรลดา, สามารถ พยัคฆ์อรุณ, สมรักษ์ คำสิงห์\n" +
"    * นักเทนนิส - ภราดร ศรีชาพันธุ์, แทมมารีน ธนสุกาญจน์, ดนัย อุดมโชค\n" +
"    * นักว่ายน้ำ - รัฐพงษ์ ศิริสานนท์(ฉลามนุ้ก), ต่อวัย เสฎฐโสธร, ต่อลาภ เสฎฐโสธร\n" +
"    * นักฟุตบอล - ปิยะพงษ์ ผิวอ่อน, เกียรติศักดิ์ เสนาเมือง\n" +
"    * นักสนุกเกอร์ - ต๋อง ศิษย์ฉ่อย\n" +
"    * นักกรีฑา - เรวดี ศรีท้าว\n" +
"    * นักเทควันโด - เยาวภา บุรพลชัย\n" +
"    * นักยกน้ำหนัก - อุดมพร พลศักดิ์, ปวีณา ทองสุก\n" +
"    * นักกอล์ฟ - ธงชัย ใจดี\n" +
"\n" +
"วันสำคัญ\n" +
"\n" +
"วันสำคัญในประเทศไทยจะมีจำนวนมากโดยเฉพาะวันที่ไม่ใช่วันหยุดราชการ ซึ่งจะตั้งขึ้นหลังจากมีเหตุการณ์สำคัญเกิดขึ้น โดยวันชาติของประเทศไทยตรงกับวันที่ 5 ธันวาคม เป็น ตามวันพระราชสมภพ ของพระบาทสมเด็จพระเจ้าอยู่หัว ภูมิพลอดุลยเดช\n" +
"\n" +
"    ดูบทความหลักที่ วันสำคัญในประเทศไทย\n" +
"\n" +
"ลำดับที่สำคัญ\n" +
"\n" +
"    * พระมหากษัตริย์ไทยพระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดช เป็นพระมหากษัตริย์ที่ครองราชย์ในฐานะประมุขแห่งรัฐที่นานที่สุดในโลก\n" +
"    * กรุงเทพฯ เป็นเมืองหลวงที่มีชื่อยาวที่สุดในโลก (169 ตัวอักษร)\n" +
"    * ดัชนีเศรษฐกิจของประเทศไทย อยู่อันดับที่ 71 จาก 155 เขตเศรษฐกิจ ตาม Index of Economic Freedom\n" +
"    * จังหวัดหนองคายได้รับการจัดอันดับจากนิตยสาร Modern Maturity ของสหรัฐเมื่อ พ.ศ. 2544 ว่าเป็นเมืองที่น่าอยู่สำหรับผู้สูงอายุชาวอเมริกันอันดับที่ 7 ของโลก [9]\n" +
"    * Growth Competitiveness Index Ranking พ.ศ. 2546 อยู่อันดับที่ 34 จาก 104 [10]\n" +
"    * ตึกใบหยก 2 เป็นตึกที่สูงที่สุดในประเทศไทย และสูงเป็นอันดับ 30 ของโลก พ.ศ. 2549\n" +
"\n" +
"อ้างอิง\n" +
"\n" +
"   1. ↑ 4th edition \"ANKOR an introduction to the temples\" Dawn Rooney ISBN: 962-217-683-6\n" +
"   2. ↑ ในสมัยก่อนนั้น (ตั้งแต่คริสต์ศตวรรษที่ 17 ในยุโรป) ภาษาสากลในการติดต่อระหว่างประเทศ (lingua franca) คือ ภาษาฝรั่งเศส เอกสารระหว่างประเทศจะใช้ภาษาฝรั่งเศสเป็นหลัก รวมถึงหนังสือเดินทางไทยรุ่นแรกๆ ด้วย\n" +
"   3. ↑ ดัชนีเศรษฐกิจประเทศไทย จากเว็บไซต์ธนาคารแห่งประเทศไทย\n" +
"   4. ↑ ข้าวไทย ย่างก้าวพัฒนา สร้างไทยเป็นศูนย์กลางข้าวโลก โดย เทคโนโลยีชาวบ้าน มติชน วันที่ 01 มิถุนายน พ.ศ. 2550 ปีที่ 19 ฉบับที่ 408\n" +
"   5. ↑ http://www.thairath.co.th/news.php?section=agriculture&content=52868\n" +
"   6. ↑ ผลผลิตของประเทศไทย จากเว็บไซต์ธนาคารแห่งประเทศไทย\n" +
"   7. ↑ ข้อมูลการท่องเที่ยว จากการท่องเที่ยวแห่งประเทศไทย (ข้อมูลเป็นไฟล์เอกเซล)\n" +
"   8. ↑ 8.0 8.1 8.2 8.3 รายละเอียดประเทศไทยจากเว็บซีไอเอ\n" +
"   9. ↑ http://207.5.46.81/tat_news/detail.asp?id=963\n" +
"  10. ↑ ข้อมูลจาก Webforum.org พ.ศ. 2546\n" +
"\n" +
"แหล่งข้อมูลอื่น\n" +
"Commons\n" +
"คอมมอนส์ มีภาพและสื่ออื่นๆ เกี่ยวกับ:\n" +
"ประเทศไทย\n" +
"ฟลิคเกอร์\n" +
"ฟลิคเกอร์ มีรูปภาพเกี่ยวกับ: ประเทศไทย\n" +
"\n" +
"    * รัฐบาลไทย\n" +
"    * การท่องเที่ยวแห่งประเทศไทย\n" +
"    * ประเทศไทยศึกษา ห้องสมุดรัฐสภา สหรัฐอเมริกา\n" +
"    * พจนานุกรมท่องเที่ยวไทย\n" +
"    * แผนที่ประเทศไทย Longdo Map\n";

function get_most_popular(text) {
  var i;
  var frequencies = new Object();
  var letter;
  for (i = 0; i < text.length; i++) {
    letter = text.charAt(i);
    if (typeof(frequencies[letter]) == 'undefined')
      frequencies[letter] = 0;
    frequencies[letter]++;
  }
  var most = [];
  for (letter in frequencies) {
    if (frequencies[letter] > 50) {
      most.push(letter);
    }
  }
  most.sort();
  return most;
}


var languages = new Array(
    chinese,     // 1
    cyrillic,    // 2
    devanagari,  // 3
    english,     // 4
    greek,       // 5
    hebrew,      // 6
    japanese,    // 7
    korean,      // 8
    persian,     // 9
    source,      // 10
    thai);       // 11


var number_re = /[0-9]/;
var latin_lc = "[a-zA\u0631]";
assertEquals(7, latin_lc.length);
var latin_lc_re = new RegExp(latin_lc);
var latin_lc_re2 = new RegExp(/[a-zA\u0631]/);

assertEquals(13793, chinese.length, "chinese utf8 in source");
assertEquals(60606, cyrillic.length, "cyrillic utf8 in source");
assertEquals(20203, devanagari.length, "devanagari utf8 in source");
assertEquals(37505, english.length, "english utf8 in source");
assertEquals(30052, greek.length, "greek utf8 in source");
assertEquals(25640, hebrew.length, "hebrew utf8 in source");
assertEquals(31082, japanese.length, "japanese utf8 in source");
assertEquals(12291, korean.length, "korean utf8 in source");
assertEquals(13851, persian.length, "persian utf8 in source");
assertEquals(177473, source.length, "source utf8 in source");
assertEquals(18315, thai.length, "thai utf8 in source");

munged_sizes = new Array(17197, 2511, 2645, 3820, 3086, 2609,
                         27231, 12972, 2014, 24943, 2773);


var i = 0;
for (idx in languages) {
  i++;
  var text = languages[idx];
  assertTrue(latin_lc_re.test(text), "latin_lc" + i);
  assertTrue(latin_lc_re2.test(text), "latin_lc" + i);
  assertTrue(number_re.test(text), "number " + i);
  var most_popular = get_most_popular(text);
  var idx;
  var re = "([x";
  var last_c = -9999;
  for (idx in most_popular) {
    var c = most_popular[idx];
    if ("^]-\n\\".indexOf(c) == -1) {
      if (c.charCodeAt(0) > last_c &&
          c.charCodeAt(0) - 20 < last_c) {
        re += "-" + c;
        last_c = -9999;
      } else {
        re += c;
        last_c = c.charCodeAt(0);
      }
    }
  }
  re += "]+)";
  var char_class = new RegExp(re, "g");
  var munged = text.replace(char_class, "foo");
  assertEquals(munged_sizes[i - 1], munged.length, "munged size " + i);
}


function hex(x) {
  x &= 15;
  if (x < 10) {
    return String.fromCharCode(x + 48);
  } else {
    return String.fromCharCode(x + 97 - 10);
  }
}


function dump_re(re) {
  var out = "";
  for (var i = 0; i < re.length; i++) {
    var c = re.charCodeAt(i);
    if (c >= 32 && c <= 126) {
      out += re[i];
    } else if (c < 256) {
      out += "\\x" + hex(c >> 4) + hex(c);
    } else {
      out += "\\u" + hex(c >> 12) + hex(c >> 8) + hex(c >> 4) + hex(c);
    }
  }
  print ("re = " + out);
}

var thai_l_thingy = "\u0e44";
var thai_l_regexp = new RegExp(thai_l_thingy);
var thai_l_regexp2 = new RegExp("[" + thai_l_thingy + "]");
assertTrue(thai_l_regexp.test(thai_l_thingy));
assertTrue(thai_l_regexp2.test(thai_l_thingy));
