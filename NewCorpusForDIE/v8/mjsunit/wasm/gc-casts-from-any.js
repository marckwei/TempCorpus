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

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-gc --experimental-wasm-stringref

d8.file.execute('test/mjsunit/wasm/wasm-module-builder.js');

(function TestRefTest() {
  var builder = new WasmModuleBuilder();
  builder.startRecGroup();
  let structSuper = builder.addStruct([makeField(kWasmI32, true)]);
  let structSub = builder.addStruct([makeField(kWasmI32, true)], structSuper);
  let array = builder.addArray(kWasmI32);
  builder.endRecGroup();

  let fct =
  builder.addFunction('createStructSuper',
                      makeSig([kWasmI32], [kWasmExternRef]))
    .addBody([
      kExprLocalGet, 0,
      kGCPrefix, kExprStructNew, structSuper,
      kGCPrefix, kExprExternExternalize,
    ]).exportFunc();
  builder.addFunction('createStructSub', makeSig([kWasmI32], [kWasmExternRef]))
    .addBody([
      kExprLocalGet, 0,
      kGCPrefix, kExprStructNew, structSub,
      kGCPrefix, kExprExternExternalize,
    ]).exportFunc();
  builder.addFunction('createArray', makeSig([kWasmI32], [kWasmExternRef]))
    .addBody([
      kExprLocalGet, 0,
      kGCPrefix, kExprArrayNewFixed, array, 1,
      kGCPrefix, kExprExternExternalize,
    ]).exportFunc();
  builder.addFunction('createFuncRef', makeSig([], [kWasmFuncRef]))
    .addBody([
      kExprRefFunc, fct.index,
    ]).exportFunc();

  [
    ["StructSuper", structSuper],
    ["StructSub", structSub],
    ["Array", array],
    ["I31", kI31RefCode],
    ["AnyArray", kArrayRefCode],
    ["Struct", kStructRefCode],
    ["Eq", kEqRefCode],
    ["String", kStringRefCode],
    // 'ref.test any' is semantically the same as '!ref.is_null' here.
    ["Any", kAnyRefCode],
    ["None", kNullRefCode]
  ].forEach(([typeName, typeCode]) => {
    builder.addFunction(`refTest${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32, kWasmI32]))
    .addBody([
      kExprLocalGet, 0,
      kGCPrefix, kExprExternInternalize,
      kGCPrefix, kExprRefTest, typeCode,
      kExprLocalGet, 0,
      kGCPrefix, kExprExternInternalize,
      kGCPrefix, kExprRefTestNull, typeCode,
    ]).exportFunc();

    builder.addFunction(`refCast${typeName}`,
                        makeSig([kWasmExternRef], [kWasmExternRef]))
    .addBody([
      kExprLocalGet, 0,
      kGCPrefix, kExprExternInternalize,
      kGCPrefix, kExprRefCast, typeCode,
      kGCPrefix, kExprExternExternalize,
    ]).exportFunc();

    builder.addFunction(`refCastNull${typeName}`,
                        makeSig([kWasmExternRef], [kWasmExternRef]))
    .addBody([
      kExprLocalGet, 0,
      kGCPrefix, kExprExternInternalize,
      kGCPrefix, kExprRefCastNull, typeCode,
      kGCPrefix, kExprExternExternalize,
    ]).exportFunc();

    builder.addFunction(`brOnCast${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32]))
    .addBody([
      kExprBlock, kWasmRef, typeCode,
        kExprLocalGet, 0,
        kGCPrefix, kExprExternInternalize,
        kGCPrefix, kExprBrOnCast, 0, typeCode,
        kExprI32Const, 0,
        kExprReturn,
      kExprEnd,
      kExprDrop,
      kExprI32Const, 1,
      kExprReturn,
    ]).exportFunc();
    builder.addFunction(`brOnCastNull${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32]))
    .addBody([
      kExprBlock, kWasmRefNull, typeCode,
        kExprLocalGet, 0,
        kGCPrefix, kExprExternInternalize,
        kGCPrefix, kExprBrOnCastNull, 0, typeCode,
        kExprI32Const, 0,
        kExprReturn,
      kExprEnd,
      kExprDrop,
      kExprI32Const, 1,
      kExprReturn,
    ]).exportFunc();
    builder.addFunction(`brOnCastFail${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32]))
    .addBody([
      kExprBlock, kAnyRefCode,
        kExprLocalGet, 0,
        kGCPrefix, kExprExternInternalize,
        kGCPrefix, kExprBrOnCastFail, 0, typeCode,
        kExprI32Const, 0,
        kExprReturn,
      kExprEnd,
      kExprDrop,
      kExprI32Const, 1,
      kExprReturn,
    ]).exportFunc();
    builder.addFunction(`brOnCastFailNull${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32]))
    .addBody([
      kExprBlock, kAnyRefCode,
        kExprLocalGet, 0,
        kGCPrefix, kExprExternInternalize,
        kGCPrefix, kExprBrOnCastFailNull, 0, typeCode,
        kExprI32Const, 0,
        kExprReturn,
      kExprEnd,
      kExprDrop,
      kExprI32Const, 1,
      kExprReturn,
    ]).exportFunc();

    builder.addFunction(`brOnCastGeneric${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32]))
    .addBody([
      kExprBlock, kWasmRef, typeCode,
        kExprLocalGet, 0,
        kGCPrefix, kExprExternInternalize,
        kGCPrefix, kExprBrOnCastGeneric, 0b01, 0, kAnyRefCode, typeCode,
        kExprI32Const, 0,
        kExprReturn,
      kExprEnd,
      kExprDrop,
      kExprI32Const, 1,
      kExprReturn,
    ]).exportFunc();
    builder.addFunction(`brOnCastGenericNull${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32]))
    .addBody([
      kExprBlock, kWasmRefNull, typeCode,
        kExprLocalGet, 0,
        kGCPrefix, kExprExternInternalize,
        kGCPrefix, kExprBrOnCastGeneric, 0b11, 0, kAnyRefCode, typeCode,
        kExprI32Const, 0,
        kExprReturn,
      kExprEnd,
      kExprDrop,
      kExprI32Const, 1,
      kExprReturn,
    ]).exportFunc();
    builder.addFunction(`brOnCastGenericFail${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32]))
    .addBody([
      kExprBlock, kAnyRefCode,
        kExprLocalGet, 0,
        kGCPrefix, kExprExternInternalize,
        kGCPrefix, kExprBrOnCastFailGeneric, 0b01, 0, kAnyRefCode, typeCode,
        kExprI32Const, 0,
        kExprReturn,
      kExprEnd,
      kExprDrop,
      kExprI32Const, 1,
      kExprReturn,
    ]).exportFunc();
    builder.addFunction(`brOnCastGenericFailNull${typeName}`,
                        makeSig([kWasmExternRef], [kWasmI32]))
    .addBody([
      kExprBlock, kAnyRefCode,
        kExprLocalGet, 0,
        kGCPrefix, kExprExternInternalize,
        kGCPrefix, kExprBrOnCastFailGeneric, 0b11, 0, kAnyRefCode, typeCode,
        kExprI32Const, 0,
        kExprReturn,
      kExprEnd,
      kExprDrop,
      kExprI32Const, 1,
      kExprReturn,
    ]).exportFunc();
  });

  var instance = builder.instantiate();
  let wasm = instance.exports;
  // result: [ref.test, ref.test null]
  assertEquals([0, 1], wasm.refTestStructSuper(null));
  assertEquals([0, 0], wasm.refTestStructSuper(undefined));
  assertEquals([1, 1], wasm.refTestStructSuper(wasm.createStructSuper()));
  assertEquals([1, 1], wasm.refTestStructSuper(wasm.createStructSub()));
  assertEquals([0, 0], wasm.refTestStructSuper(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestStructSuper(wasm.createFuncRef()));
  assertEquals([0, 0], wasm.refTestStructSuper(1));
  assertEquals([0, 0], wasm.refTestStructSuper({'JavaScript': 'Object'}));
  assertEquals([0, 0], wasm.refTestStructSuper('string'));

  assertEquals([0, 1], wasm.refTestStructSub(null));
  assertEquals([0, 0], wasm.refTestStructSub(undefined));
  assertEquals([0, 0], wasm.refTestStructSub(wasm.createStructSuper()));
  assertEquals([1, 1], wasm.refTestStructSub(wasm.createStructSub()));
  assertEquals([0, 0], wasm.refTestStructSub(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestStructSub(wasm.createFuncRef()));
  assertEquals([0, 0], wasm.refTestStructSub(1));
  assertEquals([0, 0], wasm.refTestStructSub({'JavaScript': 'Object'}));
  assertEquals([0, 0], wasm.refTestStructSub('string'));

  assertEquals([0, 1], wasm.refTestArray(null));
  assertEquals([0, 0], wasm.refTestArray(undefined));
  assertEquals([0, 0], wasm.refTestArray(wasm.createStructSuper()));
  assertEquals([0, 0], wasm.refTestArray(wasm.createStructSub()));
  assertEquals([1, 1], wasm.refTestArray(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestArray(wasm.createFuncRef()));
  assertEquals([0, 0], wasm.refTestArray(1));
  assertEquals([0, 0], wasm.refTestArray({'JavaScript': 'Object'}));
  assertEquals([0, 0], wasm.refTestArray('string'));

  assertEquals([0, 1], wasm.refTestI31(null));
  assertEquals([0, 0], wasm.refTestI31(undefined));
  assertEquals([0, 0], wasm.refTestI31(wasm.createStructSuper()));
  assertEquals([0, 0], wasm.refTestI31(wasm.createStructSub()));
  assertEquals([0, 0], wasm.refTestI31(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestI31(wasm.createFuncRef()));
  assertEquals([1, 1], wasm.refTestI31(1));
  assertEquals([0, 0], wasm.refTestI31({'JavaScript': 'Object'}));
  assertEquals([0, 0], wasm.refTestI31('string'));

  assertEquals([0, 1], wasm.refTestAnyArray(null));
  assertEquals([0, 0], wasm.refTestAnyArray(undefined));
  assertEquals([0, 0], wasm.refTestAnyArray(wasm.createStructSuper()));
  assertEquals([0, 0], wasm.refTestAnyArray(wasm.createStructSub()));
  assertEquals([1, 1], wasm.refTestAnyArray(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestAnyArray(wasm.createFuncRef()));
  assertEquals([0, 0], wasm.refTestAnyArray(1));
  assertEquals([0, 0], wasm.refTestAnyArray({'JavaScript': 'Object'}));
  assertEquals([0, 0], wasm.refTestAnyArray('string'));

  assertEquals([0, 1], wasm.refTestStruct(null));
  assertEquals([0, 0], wasm.refTestStruct(undefined));
  assertEquals([1, 1], wasm.refTestStruct(wasm.createStructSuper()));
  assertEquals([1, 1], wasm.refTestStruct(wasm.createStructSub()));
  assertEquals([0, 0], wasm.refTestStruct(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestStruct(wasm.createFuncRef()));
  assertEquals([0, 0], wasm.refTestStruct(1));
  assertEquals([0, 0], wasm.refTestStruct({'JavaScript': 'Object'}));
  assertEquals([0, 0], wasm.refTestStruct('string'));

  assertEquals([0, 1], wasm.refTestString(null));
  assertEquals([0, 0], wasm.refTestString(undefined));
  assertEquals([0, 0], wasm.refTestString(wasm.createStructSuper()));
  assertEquals([0, 0], wasm.refTestString(wasm.createStructSub()));
  assertEquals([0, 0], wasm.refTestString(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestString(wasm.createFuncRef()));
  assertEquals([0, 0], wasm.refTestString(1));
  assertEquals([0, 0], wasm.refTestString({'JavaScript': 'Object'}));
  assertEquals([1, 1], wasm.refTestString('string'));

  assertEquals([0, 1], wasm.refTestEq(null));
  assertEquals([0, 0], wasm.refTestEq(undefined));
  assertEquals([1, 1], wasm.refTestEq(wasm.createStructSuper()));
  assertEquals([1, 1], wasm.refTestEq(wasm.createStructSub()));
  assertEquals([1, 1], wasm.refTestEq(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestEq(wasm.createFuncRef()));
  assertEquals([1, 1], wasm.refTestEq(1)); // ref.i31
  assertEquals([0, 0], wasm.refTestEq({'JavaScript': 'Object'}));
  assertEquals([0, 0], wasm.refTestEq('string'));

  assertEquals([0, 1], wasm.refTestAny(null));
  assertEquals([1, 1], wasm.refTestAny(undefined));
  assertEquals([1, 1], wasm.refTestAny(wasm.createStructSuper()));
  assertEquals([1, 1], wasm.refTestAny(wasm.createStructSub()));
  assertEquals([1, 1], wasm.refTestAny(wasm.createArray()));
  assertEquals([1, 1], wasm.refTestAny(wasm.createFuncRef()));
  assertEquals([1, 1], wasm.refTestAny(1)); // ref.i31
  assertEquals([1, 1], wasm.refTestAny({'JavaScript': 'Object'}));
  assertEquals([1, 1], wasm.refTestAny('string'));

  assertEquals([0, 1], wasm.refTestNone(null));
  assertEquals([0, 0], wasm.refTestNone(undefined));
  assertEquals([0, 0], wasm.refTestNone(wasm.createStructSuper()));
  assertEquals([0, 0], wasm.refTestNone(wasm.createStructSub()));
  assertEquals([0, 0], wasm.refTestNone(wasm.createArray()));
  assertEquals([0, 0], wasm.refTestNone(wasm.createFuncRef()));
  assertEquals([0, 0], wasm.refTestNone(1)); // ref.i31
  assertEquals([0, 0], wasm.refTestNone({'JavaScript': 'Object'}));
  assertEquals([0, 0], wasm.refTestNone('string'));

  // ref.cast
  let structSuperObj = wasm.createStructSuper();
  let structSubObj = wasm.createStructSub();
  let arrayObj = wasm.createArray();
  let jsObj = {'JavaScript': 'Object'};
  let strObj = 'string';
  let funcObj = wasm.createFuncRef();

  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSuper(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSuper(undefined));
  assertSame(structSuperObj, wasm.refCastStructSuper(structSuperObj));
  assertSame(structSubObj, wasm.refCastStructSuper(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSuper(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSuper(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSuper(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSuper(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSuper(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSub(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSub(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSub(structSuperObj));
  assertSame(structSubObj, wasm.refCastStructSub(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSub(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSub(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSub(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSub(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStructSub(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastArray(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastArray(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastArray(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastArray(structSubObj));
  assertSame(arrayObj, wasm.refCastArray(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastArray(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastArray(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastArray(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastArray(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastI31(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastI31(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastI31(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastI31(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastI31(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastI31(funcObj));
  assertEquals(1, wasm.refCastI31(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastI31(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastI31(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastAnyArray(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastAnyArray(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastAnyArray(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastAnyArray(structSubObj));
  assertSame(arrayObj, wasm.refCastAnyArray(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastAnyArray(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastAnyArray(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastAnyArray(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastAnyArray(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastStruct(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStruct(undefined));
  assertSame(structSuperObj, wasm.refCastStruct(structSuperObj));
  assertSame(structSubObj, wasm.refCastStruct(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStruct(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStruct(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStruct(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStruct(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastStruct(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastString(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastString(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastString(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastString(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastString(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastString(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastString(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastString(jsObj));
  assertSame(strObj, wasm.refCastString(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastEq(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastEq(undefined));
  assertSame(structSuperObj, wasm.refCastEq(structSuperObj));
  assertSame(structSubObj, wasm.refCastEq(structSubObj));
  assertSame(arrayObj, wasm.refCastEq(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastEq(funcObj));
  assertEquals(1, wasm.refCastEq(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastEq(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastEq(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastAny(null));
  assertSame(undefined, wasm.refCastAny(undefined));
  assertSame(structSuperObj, wasm.refCastAny(structSuperObj));
  assertSame(structSubObj, wasm.refCastAny(structSubObj));
  assertSame(arrayObj, wasm.refCastAny(arrayObj));
  assertSame(funcObj, wasm.refCastAny(funcObj));
  assertEquals(1, wasm.refCastAny(1));
  assertSame(jsObj, wasm.refCastAny(jsObj));
  assertSame(strObj, wasm.refCastAny(strObj));

  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNone(strObj));

  // ref.cast null
  assertSame(null, wasm.refCastNullStructSuper(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSuper(undefined));
  assertSame(structSuperObj, wasm.refCastNullStructSuper(structSuperObj));
  assertSame(structSubObj, wasm.refCastNullStructSuper(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSuper(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSuper(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSuper(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSuper(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSuper(strObj));

  assertSame(null, wasm.refCastNullStructSub(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSub(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSub(structSuperObj));
  assertSame(structSubObj, wasm.refCastNullStructSub(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSub(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSub(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSub(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSub(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStructSub(strObj));

  assertSame(null, wasm.refCastNullArray(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullArray(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullArray(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullArray(structSubObj));
  assertSame(arrayObj, wasm.refCastNullArray(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullArray(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullArray(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullArray(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullArray(strObj));

  assertSame(null, wasm.refCastNullI31(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullI31(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullI31(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullI31(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullI31(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullI31(funcObj));
  assertEquals(1, wasm.refCastNullI31(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullI31(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullI31(strObj));

  assertSame(null, wasm.refCastNullAnyArray(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullAnyArray(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullAnyArray(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullAnyArray(structSubObj));
  assertSame(arrayObj, wasm.refCastNullAnyArray(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullAnyArray(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullAnyArray(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullAnyArray(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullAnyArray(strObj));

  assertSame(null, wasm.refCastNullStruct(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStruct(undefined));
  assertSame(structSuperObj, wasm.refCastNullStruct(structSuperObj));
  assertSame(structSubObj, wasm.refCastNullStruct(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStruct(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStruct(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStruct(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStruct(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullStruct(strObj));

  assertSame(null, wasm.refCastNullString(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullString(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullString(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullString(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullString(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullString(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullString(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullString(jsObj));
  assertSame(strObj, wasm.refCastNullString(strObj));

  assertSame(null, wasm.refCastNullEq(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullEq(undefined));
  assertSame(structSuperObj, wasm.refCastNullEq(structSuperObj));
  assertSame(structSubObj, wasm.refCastNullEq(structSubObj));
  assertSame(arrayObj, wasm.refCastNullEq(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullEq(funcObj));
  assertEquals(1, wasm.refCastNullEq(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullEq(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullEq(strObj));

  assertSame(null, wasm.refCastNullAny(null));
  assertSame(undefined, wasm.refCastNullAny(undefined));
  assertSame(structSuperObj, wasm.refCastNullAny(structSuperObj));
  assertSame(structSubObj, wasm.refCastNullAny(structSubObj));
  assertSame(arrayObj, wasm.refCastNullAny(arrayObj));
  assertSame(funcObj, wasm.refCastNullAny(funcObj));
  assertEquals(1, wasm.refCastNullAny(1));
  assertSame(jsObj, wasm.refCastNullAny(jsObj));
  assertSame(strObj, wasm.refCastNullAny(strObj));

  assertSame(null, wasm.refCastNullNone(null));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullNone(undefined));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullNone(structSuperObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullNone(structSubObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullNone(arrayObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullNone(funcObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullNone(1));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullNone(jsObj));
  assertTraps(kTrapIllegalCast, () => wasm.refCastNullNone(strObj));

  // br_on_cast
  assertEquals(0, wasm.brOnCastStructSuper(null));
  assertEquals(0, wasm.brOnCastStructSuper(undefined));
  assertEquals(1, wasm.brOnCastStructSuper(structSuperObj));
  assertEquals(1, wasm.brOnCastStructSuper(structSubObj));
  assertEquals(0, wasm.brOnCastStructSuper(arrayObj));
  assertEquals(0, wasm.brOnCastStructSuper(funcObj));
  assertEquals(0, wasm.brOnCastStructSuper(1));
  assertEquals(0, wasm.brOnCastStructSuper(jsObj));
  assertEquals(0, wasm.brOnCastStructSuper(strObj));

  assertEquals(0, wasm.brOnCastStructSub(null));
  assertEquals(0, wasm.brOnCastStructSub(undefined));
  assertEquals(0, wasm.brOnCastStructSub(structSuperObj));
  assertEquals(1, wasm.brOnCastStructSub(structSubObj));
  assertEquals(0, wasm.brOnCastStructSub(arrayObj));
  assertEquals(0, wasm.brOnCastStructSub(funcObj));
  assertEquals(0, wasm.brOnCastStructSub(1));
  assertEquals(0, wasm.brOnCastStructSub(jsObj));
  assertEquals(0, wasm.brOnCastStructSub(strObj));

  assertEquals(0, wasm.brOnCastArray(null));
  assertEquals(0, wasm.brOnCastArray(undefined));
  assertEquals(0, wasm.brOnCastArray(structSuperObj));
  assertEquals(0, wasm.brOnCastArray(structSubObj));
  assertEquals(1, wasm.brOnCastArray(arrayObj));
  assertEquals(0, wasm.brOnCastArray(funcObj));
  assertEquals(0, wasm.brOnCastArray(1));
  assertEquals(0, wasm.brOnCastArray(jsObj));
  assertEquals(0, wasm.brOnCastArray(strObj));

  assertEquals(0, wasm.brOnCastI31(null));
  assertEquals(0, wasm.brOnCastI31(undefined));
  assertEquals(0, wasm.brOnCastI31(structSuperObj));
  assertEquals(0, wasm.brOnCastI31(structSubObj));
  assertEquals(0, wasm.brOnCastI31(arrayObj));
  assertEquals(0, wasm.brOnCastI31(funcObj));
  assertEquals(1, wasm.brOnCastI31(1));
  assertEquals(0, wasm.brOnCastI31(jsObj));
  assertEquals(0, wasm.brOnCastI31(strObj));

  assertEquals(0, wasm.brOnCastAnyArray(null));
  assertEquals(0, wasm.brOnCastAnyArray(undefined));
  assertEquals(0, wasm.brOnCastAnyArray(structSuperObj));
  assertEquals(0, wasm.brOnCastAnyArray(structSubObj));
  assertEquals(1, wasm.brOnCastAnyArray(arrayObj));
  assertEquals(0, wasm.brOnCastAnyArray(funcObj));
  assertEquals(0, wasm.brOnCastAnyArray(1));
  assertEquals(0, wasm.brOnCastAnyArray(jsObj));
  assertEquals(0, wasm.brOnCastAnyArray(strObj));

  assertEquals(0, wasm.brOnCastStruct(null));
  assertEquals(0, wasm.brOnCastStruct(undefined));
  assertEquals(1, wasm.brOnCastStruct(structSuperObj));
  assertEquals(1, wasm.brOnCastStruct(structSubObj));
  assertEquals(0, wasm.brOnCastStruct(arrayObj));
  assertEquals(0, wasm.brOnCastStruct(funcObj));
  assertEquals(0, wasm.brOnCastStruct(1));
  assertEquals(0, wasm.brOnCastStruct(jsObj));
  assertEquals(0, wasm.brOnCastStruct(strObj));

  assertEquals(0, wasm.brOnCastString(null));
  assertEquals(0, wasm.brOnCastString(undefined));
  assertEquals(0, wasm.brOnCastString(structSuperObj));
  assertEquals(0, wasm.brOnCastString(structSubObj));
  assertEquals(0, wasm.brOnCastString(arrayObj));
  assertEquals(0, wasm.brOnCastString(funcObj));
  assertEquals(0, wasm.brOnCastString(1));
  assertEquals(0, wasm.brOnCastString(jsObj));
  assertEquals(1, wasm.brOnCastString(strObj));

  assertEquals(0, wasm.brOnCastEq(null));
  assertEquals(0, wasm.brOnCastEq(undefined));
  assertEquals(1, wasm.brOnCastEq(structSuperObj));
  assertEquals(1, wasm.brOnCastEq(structSubObj));
  assertEquals(1, wasm.brOnCastEq(arrayObj));
  assertEquals(0, wasm.brOnCastEq(funcObj));
  assertEquals(1, wasm.brOnCastEq(1));
  assertEquals(0, wasm.brOnCastEq(jsObj));
  assertEquals(0, wasm.brOnCastEq(strObj));

  assertEquals(0, wasm.brOnCastAny(null));
  assertEquals(1, wasm.brOnCastAny(undefined));
  assertEquals(1, wasm.brOnCastAny(structSuperObj));
  assertEquals(1, wasm.brOnCastAny(structSubObj));
  assertEquals(1, wasm.brOnCastAny(arrayObj));
  assertEquals(1, wasm.brOnCastAny(funcObj));
  assertEquals(1, wasm.brOnCastAny(1));
  assertEquals(1, wasm.brOnCastAny(jsObj));
  assertEquals(1, wasm.brOnCastAny(strObj));

  assertEquals(0, wasm.brOnCastNone(null));
  assertEquals(0, wasm.brOnCastNone(undefined));
  assertEquals(0, wasm.brOnCastNone(structSuperObj));
  assertEquals(0, wasm.brOnCastNone(structSubObj));
  assertEquals(0, wasm.brOnCastNone(arrayObj));
  assertEquals(0, wasm.brOnCastNone(funcObj));
  assertEquals(0, wasm.brOnCastNone(1));
  assertEquals(0, wasm.brOnCastNone(jsObj));
  assertEquals(0, wasm.brOnCastNone(strObj));

  // br_on_cast null
  assertEquals(1, wasm.brOnCastNullStructSuper(null));
  assertEquals(0, wasm.brOnCastNullStructSuper(undefined));
  assertEquals(1, wasm.brOnCastNullStructSuper(structSuperObj));
  assertEquals(1, wasm.brOnCastNullStructSuper(structSubObj));
  assertEquals(0, wasm.brOnCastNullStructSuper(arrayObj));
  assertEquals(0, wasm.brOnCastNullStructSuper(funcObj));
  assertEquals(0, wasm.brOnCastNullStructSuper(1));
  assertEquals(0, wasm.brOnCastNullStructSuper(jsObj));
  assertEquals(0, wasm.brOnCastNullStructSuper(strObj));

  assertEquals(1, wasm.brOnCastNullStructSub(null));
  assertEquals(0, wasm.brOnCastNullStructSub(undefined));
  assertEquals(0, wasm.brOnCastNullStructSub(structSuperObj));
  assertEquals(1, wasm.brOnCastNullStructSub(structSubObj));
  assertEquals(0, wasm.brOnCastNullStructSub(arrayObj));
  assertEquals(0, wasm.brOnCastNullStructSub(funcObj));
  assertEquals(0, wasm.brOnCastNullStructSub(1));
  assertEquals(0, wasm.brOnCastNullStructSub(jsObj));
  assertEquals(0, wasm.brOnCastNullStructSub(strObj));

  assertEquals(1, wasm.brOnCastNullArray(null));
  assertEquals(0, wasm.brOnCastNullArray(undefined));
  assertEquals(0, wasm.brOnCastNullArray(structSuperObj));
  assertEquals(0, wasm.brOnCastNullArray(structSubObj));
  assertEquals(1, wasm.brOnCastNullArray(arrayObj));
  assertEquals(0, wasm.brOnCastNullArray(funcObj));
  assertEquals(0, wasm.brOnCastNullArray(1));
  assertEquals(0, wasm.brOnCastNullArray(jsObj));
  assertEquals(0, wasm.brOnCastNullArray(strObj));

  assertEquals(1, wasm.brOnCastNullI31(null));
  assertEquals(0, wasm.brOnCastNullI31(undefined));
  assertEquals(0, wasm.brOnCastNullI31(structSuperObj));
  assertEquals(0, wasm.brOnCastNullI31(structSubObj));
  assertEquals(0, wasm.brOnCastNullI31(arrayObj));
  assertEquals(0, wasm.brOnCastNullI31(funcObj));
  assertEquals(1, wasm.brOnCastNullI31(1));
  assertEquals(0, wasm.brOnCastNullI31(jsObj));
  assertEquals(0, wasm.brOnCastNullI31(strObj));

  assertEquals(1, wasm.brOnCastNullAnyArray(null));
  assertEquals(0, wasm.brOnCastNullAnyArray(undefined));
  assertEquals(0, wasm.brOnCastNullAnyArray(structSuperObj));
  assertEquals(0, wasm.brOnCastNullAnyArray(structSubObj));
  assertEquals(1, wasm.brOnCastNullAnyArray(arrayObj));
  assertEquals(0, wasm.brOnCastNullAnyArray(funcObj));
  assertEquals(0, wasm.brOnCastNullAnyArray(1));
  assertEquals(0, wasm.brOnCastNullAnyArray(jsObj));
  assertEquals(0, wasm.brOnCastNullAnyArray(strObj));

  assertEquals(1, wasm.brOnCastNullStruct(null));
  assertEquals(0, wasm.brOnCastNullStruct(undefined));
  assertEquals(1, wasm.brOnCastNullStruct(structSuperObj));
  assertEquals(1, wasm.brOnCastNullStruct(structSubObj));
  assertEquals(0, wasm.brOnCastNullStruct(arrayObj));
  assertEquals(0, wasm.brOnCastNullStruct(funcObj));
  assertEquals(0, wasm.brOnCastNullStruct(1));
  assertEquals(0, wasm.brOnCastNullStruct(jsObj));
  assertEquals(0, wasm.brOnCastNullStruct(strObj));

  assertEquals(1, wasm.brOnCastNullEq(null));
  assertEquals(0, wasm.brOnCastNullEq(undefined));
  assertEquals(1, wasm.brOnCastNullEq(structSuperObj));
  assertEquals(1, wasm.brOnCastNullEq(structSubObj));
  assertEquals(1, wasm.brOnCastNullEq(arrayObj));
  assertEquals(0, wasm.brOnCastNullEq(funcObj));
  assertEquals(1, wasm.brOnCastNullEq(1));
  assertEquals(0, wasm.brOnCastNullEq(jsObj));
  assertEquals(0, wasm.brOnCastNullEq(strObj));

  assertEquals(1, wasm.brOnCastNullString(null));
  assertEquals(0, wasm.brOnCastNullString(undefined));
  assertEquals(0, wasm.brOnCastNullString(structSuperObj));
  assertEquals(0, wasm.brOnCastNullString(structSubObj));
  assertEquals(0, wasm.brOnCastNullString(arrayObj));
  assertEquals(0, wasm.brOnCastNullString(funcObj));
  assertEquals(0, wasm.brOnCastNullString(1));
  assertEquals(0, wasm.brOnCastNullString(jsObj));
  assertEquals(1, wasm.brOnCastNullString(strObj));

  assertEquals(1, wasm.brOnCastNullAny(null));
  assertEquals(1, wasm.brOnCastNullAny(undefined));
  assertEquals(1, wasm.brOnCastNullAny(structSuperObj));
  assertEquals(1, wasm.brOnCastNullAny(structSubObj));
  assertEquals(1, wasm.brOnCastNullAny(arrayObj));
  assertEquals(1, wasm.brOnCastNullAny(funcObj));
  assertEquals(1, wasm.brOnCastNullAny(1));
  assertEquals(1, wasm.brOnCastNullAny(jsObj));
  assertEquals(1, wasm.brOnCastNullAny(strObj));

  assertEquals(1, wasm.brOnCastNullNone(null));
  assertEquals(0, wasm.brOnCastNullNone(undefined));
  assertEquals(0, wasm.brOnCastNullNone(structSuperObj));
  assertEquals(0, wasm.brOnCastNullNone(structSubObj));
  assertEquals(0, wasm.brOnCastNullNone(arrayObj));
  assertEquals(0, wasm.brOnCastNullNone(funcObj));
  assertEquals(0, wasm.brOnCastNullNone(1));
  assertEquals(0, wasm.brOnCastNullNone(jsObj));
  assertEquals(0, wasm.brOnCastNullNone(strObj));

  // br_on_cast_fail
  assertEquals(1, wasm.brOnCastFailStructSuper(null));
  assertEquals(1, wasm.brOnCastFailStructSuper(undefined));
  assertEquals(0, wasm.brOnCastFailStructSuper(structSuperObj));
  assertEquals(0, wasm.brOnCastFailStructSuper(structSubObj));
  assertEquals(1, wasm.brOnCastFailStructSuper(arrayObj));
  assertEquals(1, wasm.brOnCastFailStructSuper(funcObj));
  assertEquals(1, wasm.brOnCastFailStructSuper(1));
  assertEquals(1, wasm.brOnCastFailStructSuper(jsObj));
  assertEquals(1, wasm.brOnCastFailStructSuper(strObj));

  assertEquals(1, wasm.brOnCastFailStructSub(null));
  assertEquals(1, wasm.brOnCastFailStructSub(undefined));
  assertEquals(1, wasm.brOnCastFailStructSub(structSuperObj));
  assertEquals(0, wasm.brOnCastFailStructSub(structSubObj));
  assertEquals(1, wasm.brOnCastFailStructSub(arrayObj));
  assertEquals(1, wasm.brOnCastFailStructSub(funcObj));
  assertEquals(1, wasm.brOnCastFailStructSub(1));
  assertEquals(1, wasm.brOnCastFailStructSub(jsObj));
  assertEquals(1, wasm.brOnCastFailStructSub(strObj));

  assertEquals(1, wasm.brOnCastFailArray(null));
  assertEquals(1, wasm.brOnCastFailArray(undefined));
  assertEquals(1, wasm.brOnCastFailArray(structSuperObj));
  assertEquals(1, wasm.brOnCastFailArray(structSubObj));
  assertEquals(0, wasm.brOnCastFailArray(arrayObj));
  assertEquals(1, wasm.brOnCastFailArray(funcObj));
  assertEquals(1, wasm.brOnCastFailArray(1));
  assertEquals(1, wasm.brOnCastFailArray(jsObj));
  assertEquals(1, wasm.brOnCastFailArray(strObj));

  assertEquals(1, wasm.brOnCastFailI31(null));
  assertEquals(1, wasm.brOnCastFailI31(undefined));
  assertEquals(1, wasm.brOnCastFailI31(structSuperObj));
  assertEquals(1, wasm.brOnCastFailI31(structSubObj));
  assertEquals(1, wasm.brOnCastFailI31(arrayObj));
  assertEquals(1, wasm.brOnCastFailI31(funcObj));
  assertEquals(0, wasm.brOnCastFailI31(1));
  assertEquals(1, wasm.brOnCastFailI31(jsObj));
  assertEquals(1, wasm.brOnCastFailI31(strObj));

  assertEquals(1, wasm.brOnCastFailAnyArray(null));
  assertEquals(1, wasm.brOnCastFailAnyArray(undefined));
  assertEquals(1, wasm.brOnCastFailAnyArray(structSuperObj));
  assertEquals(1, wasm.brOnCastFailAnyArray(structSubObj));
  assertEquals(0, wasm.brOnCastFailAnyArray(arrayObj));
  assertEquals(1, wasm.brOnCastFailAnyArray(funcObj));
  assertEquals(1, wasm.brOnCastFailAnyArray(1));
  assertEquals(1, wasm.brOnCastFailAnyArray(jsObj));
  assertEquals(1, wasm.brOnCastFailAnyArray(strObj));

  assertEquals(1, wasm.brOnCastFailStruct(null));
  assertEquals(1, wasm.brOnCastFailStruct(undefined));
  assertEquals(0, wasm.brOnCastFailStruct(structSuperObj));
  assertEquals(0, wasm.brOnCastFailStruct(structSubObj));
  assertEquals(1, wasm.brOnCastFailStruct(arrayObj));
  assertEquals(1, wasm.brOnCastFailStruct(funcObj));
  assertEquals(1, wasm.brOnCastFailStruct(1));
  assertEquals(1, wasm.brOnCastFailStruct(jsObj));
  assertEquals(1, wasm.brOnCastFailStruct(strObj));

  assertEquals(1, wasm.brOnCastFailEq(null));
  assertEquals(1, wasm.brOnCastFailEq(undefined));
  assertEquals(0, wasm.brOnCastFailEq(structSuperObj));
  assertEquals(0, wasm.brOnCastFailEq(structSubObj));
  assertEquals(0, wasm.brOnCastFailEq(arrayObj));
  assertEquals(1, wasm.brOnCastFailEq(funcObj));
  assertEquals(0, wasm.brOnCastFailEq(1));
  assertEquals(1, wasm.brOnCastFailEq(jsObj));
  assertEquals(1, wasm.brOnCastFailEq(strObj));

  assertEquals(1, wasm.brOnCastFailString(null));
  assertEquals(1, wasm.brOnCastFailString(undefined));
  assertEquals(1, wasm.brOnCastFailString(structSuperObj));
  assertEquals(1, wasm.brOnCastFailString(structSubObj));
  assertEquals(1, wasm.brOnCastFailString(arrayObj));
  assertEquals(1, wasm.brOnCastFailString(funcObj));
  assertEquals(1, wasm.brOnCastFailString(1));
  assertEquals(1, wasm.brOnCastFailString(jsObj));
  assertEquals(0, wasm.brOnCastFailString(strObj));

  assertEquals(1, wasm.brOnCastFailAny(null));
  assertEquals(0, wasm.brOnCastFailAny(undefined));
  assertEquals(0, wasm.brOnCastFailAny(structSuperObj));
  assertEquals(0, wasm.brOnCastFailAny(structSubObj));
  assertEquals(0, wasm.brOnCastFailAny(arrayObj));
  assertEquals(0, wasm.brOnCastFailAny(funcObj));
  assertEquals(0, wasm.brOnCastFailAny(1));
  assertEquals(0, wasm.brOnCastFailAny(jsObj));
  assertEquals(0, wasm.brOnCastFailAny(strObj));

  assertEquals(1, wasm.brOnCastFailNone(null));
  assertEquals(1, wasm.brOnCastFailNone(undefined));
  assertEquals(1, wasm.brOnCastFailNone(structSuperObj));
  assertEquals(1, wasm.brOnCastFailNone(structSubObj));
  assertEquals(1, wasm.brOnCastFailNone(arrayObj));
  assertEquals(1, wasm.brOnCastFailNone(funcObj));
  assertEquals(1, wasm.brOnCastFailNone(1));
  assertEquals(1, wasm.brOnCastFailNone(jsObj));
  assertEquals(1, wasm.brOnCastFailNone(strObj));

  // br_on_cast_fail null
  assertEquals(0, wasm.brOnCastFailNullStructSuper(null));
  assertEquals(1, wasm.brOnCastFailNullStructSuper(undefined));
  assertEquals(0, wasm.brOnCastFailNullStructSuper(structSuperObj));
  assertEquals(0, wasm.brOnCastFailNullStructSuper(structSubObj));
  assertEquals(1, wasm.brOnCastFailNullStructSuper(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullStructSuper(funcObj));
  assertEquals(1, wasm.brOnCastFailNullStructSuper(1));
  assertEquals(1, wasm.brOnCastFailNullStructSuper(jsObj));
  assertEquals(1, wasm.brOnCastFailNullStructSuper(strObj));

  assertEquals(0, wasm.brOnCastFailNullStructSub(null));
  assertEquals(1, wasm.brOnCastFailNullStructSub(undefined));
  assertEquals(1, wasm.brOnCastFailNullStructSub(structSuperObj));
  assertEquals(0, wasm.brOnCastFailNullStructSub(structSubObj));
  assertEquals(1, wasm.brOnCastFailNullStructSub(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullStructSub(funcObj));
  assertEquals(1, wasm.brOnCastFailNullStructSub(1));
  assertEquals(1, wasm.brOnCastFailNullStructSub(jsObj));
  assertEquals(1, wasm.brOnCastFailNullStructSub(strObj));

  assertEquals(0, wasm.brOnCastFailNullArray(null));
  assertEquals(1, wasm.brOnCastFailNullArray(undefined));
  assertEquals(1, wasm.brOnCastFailNullArray(structSuperObj));
  assertEquals(1, wasm.brOnCastFailNullArray(structSubObj));
  assertEquals(0, wasm.brOnCastFailNullArray(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullArray(funcObj));
  assertEquals(1, wasm.brOnCastFailNullArray(1));
  assertEquals(1, wasm.brOnCastFailNullArray(jsObj));
  assertEquals(1, wasm.brOnCastFailNullArray(strObj));

  assertEquals(0, wasm.brOnCastFailNullI31(null));
  assertEquals(1, wasm.brOnCastFailNullI31(undefined));
  assertEquals(1, wasm.brOnCastFailNullI31(structSuperObj));
  assertEquals(1, wasm.brOnCastFailNullI31(structSubObj));
  assertEquals(1, wasm.brOnCastFailNullI31(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullI31(funcObj));
  assertEquals(0, wasm.brOnCastFailNullI31(1));
  assertEquals(1, wasm.brOnCastFailNullI31(jsObj));
  assertEquals(1, wasm.brOnCastFailNullI31(strObj));

  assertEquals(0, wasm.brOnCastFailNullAnyArray(null));
  assertEquals(1, wasm.brOnCastFailNullAnyArray(undefined));
  assertEquals(1, wasm.brOnCastFailNullAnyArray(structSuperObj));
  assertEquals(1, wasm.brOnCastFailNullAnyArray(structSubObj));
  assertEquals(0, wasm.brOnCastFailNullAnyArray(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullAnyArray(funcObj));
  assertEquals(1, wasm.brOnCastFailNullAnyArray(1));
  assertEquals(1, wasm.brOnCastFailNullAnyArray(jsObj));
  assertEquals(1, wasm.brOnCastFailNullAnyArray(strObj));

  assertEquals(0, wasm.brOnCastFailNullStruct(null));
  assertEquals(1, wasm.brOnCastFailNullStruct(undefined));
  assertEquals(0, wasm.brOnCastFailNullStruct(structSuperObj));
  assertEquals(0, wasm.brOnCastFailNullStruct(structSubObj));
  assertEquals(1, wasm.brOnCastFailNullStruct(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullStruct(funcObj));
  assertEquals(1, wasm.brOnCastFailNullStruct(1));
  assertEquals(1, wasm.brOnCastFailNullStruct(jsObj));
  assertEquals(1, wasm.brOnCastFailNullStruct(strObj));

  assertEquals(0, wasm.brOnCastFailNullEq(null));
  assertEquals(1, wasm.brOnCastFailNullEq(undefined));
  assertEquals(0, wasm.brOnCastFailNullEq(structSuperObj));
  assertEquals(0, wasm.brOnCastFailNullEq(structSubObj));
  assertEquals(0, wasm.brOnCastFailNullEq(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullEq(funcObj));
  assertEquals(0, wasm.brOnCastFailNullEq(1));
  assertEquals(1, wasm.brOnCastFailNullEq(jsObj));
  assertEquals(1, wasm.brOnCastFailNullEq(strObj));

  assertEquals(0, wasm.brOnCastFailNullString(null));
  assertEquals(1, wasm.brOnCastFailNullString(undefined));
  assertEquals(1, wasm.brOnCastFailNullString(structSuperObj));
  assertEquals(1, wasm.brOnCastFailNullString(structSubObj));
  assertEquals(1, wasm.brOnCastFailNullString(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullString(funcObj));
  assertEquals(1, wasm.brOnCastFailNullString(1));
  assertEquals(1, wasm.brOnCastFailNullString(jsObj));
  assertEquals(0, wasm.brOnCastFailNullString(strObj));

  assertEquals(0, wasm.brOnCastFailNullAny(null));
  assertEquals(0, wasm.brOnCastFailNullAny(undefined));
  assertEquals(0, wasm.brOnCastFailNullAny(structSuperObj));
  assertEquals(0, wasm.brOnCastFailNullAny(structSubObj));
  assertEquals(0, wasm.brOnCastFailNullAny(arrayObj));
  assertEquals(0, wasm.brOnCastFailNullAny(funcObj));
  assertEquals(0, wasm.brOnCastFailNullAny(1));
  assertEquals(0, wasm.brOnCastFailNullAny(jsObj));
  assertEquals(0, wasm.brOnCastFailNullAny(strObj));

  assertEquals(0, wasm.brOnCastFailNullNone(null));
  assertEquals(1, wasm.brOnCastFailNullNone(undefined));
  assertEquals(1, wasm.brOnCastFailNullNone(structSuperObj));
  assertEquals(1, wasm.brOnCastFailNullNone(structSubObj));
  assertEquals(1, wasm.brOnCastFailNullNone(arrayObj));
  assertEquals(1, wasm.brOnCastFailNullNone(funcObj));
  assertEquals(1, wasm.brOnCastFailNullNone(1));
  assertEquals(1, wasm.brOnCastFailNullNone(jsObj));
  assertEquals(1, wasm.brOnCastFailNullNone(strObj));

  // br_on_cast
  assertEquals(0, wasm.brOnCastGenericStructSuper(null));
  assertEquals(0, wasm.brOnCastGenericStructSuper(undefined));
  assertEquals(1, wasm.brOnCastGenericStructSuper(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericStructSuper(structSubObj));
  assertEquals(0, wasm.brOnCastGenericStructSuper(arrayObj));
  assertEquals(0, wasm.brOnCastGenericStructSuper(funcObj));
  assertEquals(0, wasm.brOnCastGenericStructSuper(1));
  assertEquals(0, wasm.brOnCastGenericStructSuper(jsObj));
  assertEquals(0, wasm.brOnCastGenericStructSuper(strObj));

  assertEquals(0, wasm.brOnCastGenericStructSub(null));
  assertEquals(0, wasm.brOnCastGenericStructSub(undefined));
  assertEquals(0, wasm.brOnCastGenericStructSub(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericStructSub(structSubObj));
  assertEquals(0, wasm.brOnCastGenericStructSub(arrayObj));
  assertEquals(0, wasm.brOnCastGenericStructSub(funcObj));
  assertEquals(0, wasm.brOnCastGenericStructSub(1));
  assertEquals(0, wasm.brOnCastGenericStructSub(jsObj));
  assertEquals(0, wasm.brOnCastGenericStructSub(strObj));

  assertEquals(0, wasm.brOnCastGenericArray(null));
  assertEquals(0, wasm.brOnCastGenericArray(undefined));
  assertEquals(0, wasm.brOnCastGenericArray(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericArray(structSubObj));
  assertEquals(1, wasm.brOnCastGenericArray(arrayObj));
  assertEquals(0, wasm.brOnCastGenericArray(funcObj));
  assertEquals(0, wasm.brOnCastGenericArray(1));
  assertEquals(0, wasm.brOnCastGenericArray(jsObj));
  assertEquals(0, wasm.brOnCastGenericArray(strObj));

  assertEquals(0, wasm.brOnCastGenericI31(null));
  assertEquals(0, wasm.brOnCastGenericI31(undefined));
  assertEquals(0, wasm.brOnCastGenericI31(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericI31(structSubObj));
  assertEquals(0, wasm.brOnCastGenericI31(arrayObj));
  assertEquals(0, wasm.brOnCastGenericI31(funcObj));
  assertEquals(1, wasm.brOnCastGenericI31(1));
  assertEquals(0, wasm.brOnCastGenericI31(jsObj));
  assertEquals(0, wasm.brOnCastGenericI31(strObj));

  assertEquals(0, wasm.brOnCastGenericAnyArray(null));
  assertEquals(0, wasm.brOnCastGenericAnyArray(undefined));
  assertEquals(0, wasm.brOnCastGenericAnyArray(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericAnyArray(structSubObj));
  assertEquals(1, wasm.brOnCastGenericAnyArray(arrayObj));
  assertEquals(0, wasm.brOnCastGenericAnyArray(funcObj));
  assertEquals(0, wasm.brOnCastGenericAnyArray(1));
  assertEquals(0, wasm.brOnCastGenericAnyArray(jsObj));
  assertEquals(0, wasm.brOnCastGenericAnyArray(strObj));

  assertEquals(0, wasm.brOnCastGenericStruct(null));
  assertEquals(0, wasm.brOnCastGenericStruct(undefined));
  assertEquals(1, wasm.brOnCastGenericStruct(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericStruct(structSubObj));
  assertEquals(0, wasm.brOnCastGenericStruct(arrayObj));
  assertEquals(0, wasm.brOnCastGenericStruct(funcObj));
  assertEquals(0, wasm.brOnCastGenericStruct(1));
  assertEquals(0, wasm.brOnCastGenericStruct(jsObj));
  assertEquals(0, wasm.brOnCastGenericStruct(strObj));

  assertEquals(0, wasm.brOnCastGenericEq(null));
  assertEquals(0, wasm.brOnCastGenericEq(undefined));
  assertEquals(1, wasm.brOnCastGenericEq(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericEq(structSubObj));
  assertEquals(1, wasm.brOnCastGenericEq(arrayObj));
  assertEquals(0, wasm.brOnCastGenericEq(funcObj));
  assertEquals(1, wasm.brOnCastGenericEq(1));
  assertEquals(0, wasm.brOnCastGenericEq(jsObj));
  assertEquals(0, wasm.brOnCastGenericEq(strObj));

  assertEquals(0, wasm.brOnCastGenericString(null));
  assertEquals(0, wasm.brOnCastGenericString(undefined));
  assertEquals(0, wasm.brOnCastGenericString(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericString(structSubObj));
  assertEquals(0, wasm.brOnCastGenericString(arrayObj));
  assertEquals(0, wasm.brOnCastGenericString(funcObj));
  assertEquals(0, wasm.brOnCastGenericString(1));
  assertEquals(0, wasm.brOnCastGenericString(jsObj));
  assertEquals(1, wasm.brOnCastGenericString(strObj));

  assertEquals(0, wasm.brOnCastGenericAny(null));
  assertEquals(1, wasm.brOnCastGenericAny(undefined));
  assertEquals(1, wasm.brOnCastGenericAny(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericAny(structSubObj));
  assertEquals(1, wasm.brOnCastGenericAny(arrayObj));
  assertEquals(1, wasm.brOnCastGenericAny(funcObj));
  assertEquals(1, wasm.brOnCastGenericAny(1));
  assertEquals(1, wasm.brOnCastGenericAny(jsObj));
  assertEquals(1, wasm.brOnCastGenericAny(strObj));

  assertEquals(0, wasm.brOnCastGenericNone(null));
  assertEquals(0, wasm.brOnCastGenericNone(undefined));
  assertEquals(0, wasm.brOnCastGenericNone(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericNone(structSubObj));
  assertEquals(0, wasm.brOnCastGenericNone(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNone(funcObj));
  assertEquals(0, wasm.brOnCastGenericNone(1));
  assertEquals(0, wasm.brOnCastGenericNone(jsObj));
  assertEquals(0, wasm.brOnCastGenericNone(strObj));

  // br_on_cast null
  assertEquals(1, wasm.brOnCastGenericNullStructSuper(null));
  assertEquals(0, wasm.brOnCastGenericNullStructSuper(undefined));
  assertEquals(1, wasm.brOnCastGenericNullStructSuper(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericNullStructSuper(structSubObj));
  assertEquals(0, wasm.brOnCastGenericNullStructSuper(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullStructSuper(funcObj));
  assertEquals(0, wasm.brOnCastGenericNullStructSuper(1));
  assertEquals(0, wasm.brOnCastGenericNullStructSuper(jsObj));
  assertEquals(0, wasm.brOnCastGenericNullStructSuper(strObj));

  assertEquals(1, wasm.brOnCastGenericNullStructSub(null));
  assertEquals(0, wasm.brOnCastGenericNullStructSub(undefined));
  assertEquals(0, wasm.brOnCastGenericNullStructSub(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericNullStructSub(structSubObj));
  assertEquals(0, wasm.brOnCastGenericNullStructSub(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullStructSub(funcObj));
  assertEquals(0, wasm.brOnCastGenericNullStructSub(1));
  assertEquals(0, wasm.brOnCastGenericNullStructSub(jsObj));
  assertEquals(0, wasm.brOnCastGenericNullStructSub(strObj));

  assertEquals(1, wasm.brOnCastGenericNullArray(null));
  assertEquals(0, wasm.brOnCastGenericNullArray(undefined));
  assertEquals(0, wasm.brOnCastGenericNullArray(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericNullArray(structSubObj));
  assertEquals(1, wasm.brOnCastGenericNullArray(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullArray(funcObj));
  assertEquals(0, wasm.brOnCastGenericNullArray(1));
  assertEquals(0, wasm.brOnCastGenericNullArray(jsObj));
  assertEquals(0, wasm.brOnCastGenericNullArray(strObj));

  assertEquals(1, wasm.brOnCastGenericNullI31(null));
  assertEquals(0, wasm.brOnCastGenericNullI31(undefined));
  assertEquals(0, wasm.brOnCastGenericNullI31(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericNullI31(structSubObj));
  assertEquals(0, wasm.brOnCastGenericNullI31(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullI31(funcObj));
  assertEquals(1, wasm.brOnCastGenericNullI31(1));
  assertEquals(0, wasm.brOnCastGenericNullI31(jsObj));
  assertEquals(0, wasm.brOnCastGenericNullI31(strObj));

  assertEquals(1, wasm.brOnCastGenericNullAnyArray(null));
  assertEquals(0, wasm.brOnCastGenericNullAnyArray(undefined));
  assertEquals(0, wasm.brOnCastGenericNullAnyArray(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericNullAnyArray(structSubObj));
  assertEquals(1, wasm.brOnCastGenericNullAnyArray(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullAnyArray(funcObj));
  assertEquals(0, wasm.brOnCastGenericNullAnyArray(1));
  assertEquals(0, wasm.brOnCastGenericNullAnyArray(jsObj));
  assertEquals(0, wasm.brOnCastGenericNullAnyArray(strObj));

  assertEquals(1, wasm.brOnCastGenericNullStruct(null));
  assertEquals(0, wasm.brOnCastGenericNullStruct(undefined));
  assertEquals(1, wasm.brOnCastGenericNullStruct(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericNullStruct(structSubObj));
  assertEquals(0, wasm.brOnCastGenericNullStruct(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullStruct(funcObj));
  assertEquals(0, wasm.brOnCastGenericNullStruct(1));
  assertEquals(0, wasm.brOnCastGenericNullStruct(jsObj));
  assertEquals(0, wasm.brOnCastGenericNullStruct(strObj));

  assertEquals(1, wasm.brOnCastGenericNullEq(null));
  assertEquals(0, wasm.brOnCastGenericNullEq(undefined));
  assertEquals(1, wasm.brOnCastGenericNullEq(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericNullEq(structSubObj));
  assertEquals(1, wasm.brOnCastGenericNullEq(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullEq(funcObj));
  assertEquals(1, wasm.brOnCastGenericNullEq(1));
  assertEquals(0, wasm.brOnCastGenericNullEq(jsObj));
  assertEquals(0, wasm.brOnCastGenericNullEq(strObj));

  assertEquals(1, wasm.brOnCastGenericNullString(null));
  assertEquals(0, wasm.brOnCastGenericNullString(undefined));
  assertEquals(0, wasm.brOnCastGenericNullString(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericNullString(structSubObj));
  assertEquals(0, wasm.brOnCastGenericNullString(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullString(funcObj));
  assertEquals(0, wasm.brOnCastGenericNullString(1));
  assertEquals(0, wasm.brOnCastGenericNullString(jsObj));
  assertEquals(1, wasm.brOnCastGenericNullString(strObj));

  assertEquals(1, wasm.brOnCastGenericNullAny(null));
  assertEquals(1, wasm.brOnCastGenericNullAny(undefined));
  assertEquals(1, wasm.brOnCastGenericNullAny(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericNullAny(structSubObj));
  assertEquals(1, wasm.brOnCastGenericNullAny(arrayObj));
  assertEquals(1, wasm.brOnCastGenericNullAny(funcObj));
  assertEquals(1, wasm.brOnCastGenericNullAny(1));
  assertEquals(1, wasm.brOnCastGenericNullAny(jsObj));
  assertEquals(1, wasm.brOnCastGenericNullAny(strObj));

  assertEquals(1, wasm.brOnCastGenericNullNone(null));
  assertEquals(0, wasm.brOnCastGenericNullNone(undefined));
  assertEquals(0, wasm.brOnCastGenericNullNone(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericNullNone(structSubObj));
  assertEquals(0, wasm.brOnCastGenericNullNone(arrayObj));
  assertEquals(0, wasm.brOnCastGenericNullNone(funcObj));
  assertEquals(0, wasm.brOnCastGenericNullNone(1));
  assertEquals(0, wasm.brOnCastGenericNullNone(jsObj));
  assertEquals(0, wasm.brOnCastGenericNullNone(strObj));

  // br_on_cast_fail
  assertEquals(1, wasm.brOnCastGenericFailStructSuper(null));
  assertEquals(1, wasm.brOnCastGenericFailStructSuper(undefined));
  assertEquals(0, wasm.brOnCastGenericFailStructSuper(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailStructSuper(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailStructSuper(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailStructSuper(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailStructSuper(1));
  assertEquals(1, wasm.brOnCastGenericFailStructSuper(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailStructSuper(strObj));

  assertEquals(1, wasm.brOnCastGenericFailStructSub(null));
  assertEquals(1, wasm.brOnCastGenericFailStructSub(undefined));
  assertEquals(1, wasm.brOnCastGenericFailStructSub(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailStructSub(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailStructSub(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailStructSub(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailStructSub(1));
  assertEquals(1, wasm.brOnCastGenericFailStructSub(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailStructSub(strObj));

  assertEquals(1, wasm.brOnCastGenericFailArray(null));
  assertEquals(1, wasm.brOnCastGenericFailArray(undefined));
  assertEquals(1, wasm.brOnCastGenericFailArray(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailArray(structSubObj));
  assertEquals(0, wasm.brOnCastGenericFailArray(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailArray(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailArray(1));
  assertEquals(1, wasm.brOnCastGenericFailArray(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailArray(strObj));

  assertEquals(1, wasm.brOnCastGenericFailI31(null));
  assertEquals(1, wasm.brOnCastGenericFailI31(undefined));
  assertEquals(1, wasm.brOnCastGenericFailI31(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailI31(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailI31(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailI31(funcObj));
  assertEquals(0, wasm.brOnCastGenericFailI31(1));
  assertEquals(1, wasm.brOnCastGenericFailI31(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailI31(strObj));

  assertEquals(1, wasm.brOnCastGenericFailAnyArray(null));
  assertEquals(1, wasm.brOnCastGenericFailAnyArray(undefined));
  assertEquals(1, wasm.brOnCastGenericFailAnyArray(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailAnyArray(structSubObj));
  assertEquals(0, wasm.brOnCastGenericFailAnyArray(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailAnyArray(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailAnyArray(1));
  assertEquals(1, wasm.brOnCastGenericFailAnyArray(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailAnyArray(strObj));

  assertEquals(1, wasm.brOnCastGenericFailStruct(null));
  assertEquals(1, wasm.brOnCastGenericFailStruct(undefined));
  assertEquals(0, wasm.brOnCastGenericFailStruct(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailStruct(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailStruct(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailStruct(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailStruct(1));
  assertEquals(1, wasm.brOnCastGenericFailStruct(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailStruct(strObj));

  assertEquals(1, wasm.brOnCastGenericFailEq(null));
  assertEquals(1, wasm.brOnCastGenericFailEq(undefined));
  assertEquals(0, wasm.brOnCastGenericFailEq(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailEq(structSubObj));
  assertEquals(0, wasm.brOnCastGenericFailEq(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailEq(funcObj));
  assertEquals(0, wasm.brOnCastGenericFailEq(1));
  assertEquals(1, wasm.brOnCastGenericFailEq(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailEq(strObj));

  assertEquals(1, wasm.brOnCastGenericFailString(null));
  assertEquals(1, wasm.brOnCastGenericFailString(undefined));
  assertEquals(1, wasm.brOnCastGenericFailString(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailString(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailString(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailString(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailString(1));
  assertEquals(1, wasm.brOnCastGenericFailString(jsObj));
  assertEquals(0, wasm.brOnCastGenericFailString(strObj));

  assertEquals(1, wasm.brOnCastGenericFailAny(null));
  assertEquals(0, wasm.brOnCastGenericFailAny(undefined));
  assertEquals(0, wasm.brOnCastGenericFailAny(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailAny(structSubObj));
  assertEquals(0, wasm.brOnCastGenericFailAny(arrayObj));
  assertEquals(0, wasm.brOnCastGenericFailAny(funcObj));
  assertEquals(0, wasm.brOnCastGenericFailAny(1));
  assertEquals(0, wasm.brOnCastGenericFailAny(jsObj));
  assertEquals(0, wasm.brOnCastGenericFailAny(strObj));

  assertEquals(1, wasm.brOnCastGenericFailNone(null));
  assertEquals(1, wasm.brOnCastGenericFailNone(undefined));
  assertEquals(1, wasm.brOnCastGenericFailNone(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailNone(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailNone(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNone(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailNone(1));
  assertEquals(1, wasm.brOnCastGenericFailNone(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNone(strObj));

  // br_on_cast_fail null
  assertEquals(0, wasm.brOnCastGenericFailNullStructSuper(null));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSuper(undefined));
  assertEquals(0, wasm.brOnCastGenericFailNullStructSuper(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailNullStructSuper(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSuper(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSuper(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSuper(1));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSuper(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSuper(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullStructSub(null));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSub(undefined));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSub(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailNullStructSub(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSub(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSub(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSub(1));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSub(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStructSub(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullArray(null));
  assertEquals(1, wasm.brOnCastGenericFailNullArray(undefined));
  assertEquals(1, wasm.brOnCastGenericFailNullArray(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailNullArray(structSubObj));
  assertEquals(0, wasm.brOnCastGenericFailNullArray(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullArray(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailNullArray(1));
  assertEquals(1, wasm.brOnCastGenericFailNullArray(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNullArray(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullI31(null));
  assertEquals(1, wasm.brOnCastGenericFailNullI31(undefined));
  assertEquals(1, wasm.brOnCastGenericFailNullI31(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailNullI31(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailNullI31(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullI31(funcObj));
  assertEquals(0, wasm.brOnCastGenericFailNullI31(1));
  assertEquals(1, wasm.brOnCastGenericFailNullI31(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNullI31(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullAnyArray(null));
  assertEquals(1, wasm.brOnCastGenericFailNullAnyArray(undefined));
  assertEquals(1, wasm.brOnCastGenericFailNullAnyArray(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailNullAnyArray(structSubObj));
  assertEquals(0, wasm.brOnCastGenericFailNullAnyArray(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullAnyArray(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailNullAnyArray(1));
  assertEquals(1, wasm.brOnCastGenericFailNullAnyArray(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNullAnyArray(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullStruct(null));
  assertEquals(1, wasm.brOnCastGenericFailNullStruct(undefined));
  assertEquals(0, wasm.brOnCastGenericFailNullStruct(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailNullStruct(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStruct(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStruct(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStruct(1));
  assertEquals(1, wasm.brOnCastGenericFailNullStruct(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNullStruct(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullEq(null));
  assertEquals(1, wasm.brOnCastGenericFailNullEq(undefined));
  assertEquals(0, wasm.brOnCastGenericFailNullEq(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailNullEq(structSubObj));
  assertEquals(0, wasm.brOnCastGenericFailNullEq(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullEq(funcObj));
  assertEquals(0, wasm.brOnCastGenericFailNullEq(1));
  assertEquals(1, wasm.brOnCastGenericFailNullEq(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNullEq(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullString(null));
  assertEquals(1, wasm.brOnCastGenericFailNullString(undefined));
  assertEquals(1, wasm.brOnCastGenericFailNullString(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailNullString(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailNullString(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullString(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailNullString(1));
  assertEquals(1, wasm.brOnCastGenericFailNullString(jsObj));
  assertEquals(0, wasm.brOnCastGenericFailNullString(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullAny(null));
  assertEquals(0, wasm.brOnCastGenericFailNullAny(undefined));
  assertEquals(0, wasm.brOnCastGenericFailNullAny(structSuperObj));
  assertEquals(0, wasm.brOnCastGenericFailNullAny(structSubObj));
  assertEquals(0, wasm.brOnCastGenericFailNullAny(arrayObj));
  assertEquals(0, wasm.brOnCastGenericFailNullAny(funcObj));
  assertEquals(0, wasm.brOnCastGenericFailNullAny(1));
  assertEquals(0, wasm.brOnCastGenericFailNullAny(jsObj));
  assertEquals(0, wasm.brOnCastGenericFailNullAny(strObj));

  assertEquals(0, wasm.brOnCastGenericFailNullNone(null));
  assertEquals(1, wasm.brOnCastGenericFailNullNone(undefined));
  assertEquals(1, wasm.brOnCastGenericFailNullNone(structSuperObj));
  assertEquals(1, wasm.brOnCastGenericFailNullNone(structSubObj));
  assertEquals(1, wasm.brOnCastGenericFailNullNone(arrayObj));
  assertEquals(1, wasm.brOnCastGenericFailNullNone(funcObj));
  assertEquals(1, wasm.brOnCastGenericFailNullNone(1));
  assertEquals(1, wasm.brOnCastGenericFailNullNone(jsObj));
  assertEquals(1, wasm.brOnCastGenericFailNullNone(strObj));
})();
