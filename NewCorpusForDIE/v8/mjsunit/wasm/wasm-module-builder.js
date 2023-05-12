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

// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Used for encoding f32 and double constants to bits.
let byte_view = new Uint8Array(8);
let data_view = new DataView(byte_view.buffer);

// The bytes function receives one of
//  - several arguments, each of which is either a number or a string of length
//    1; if it's a string, the charcode of the contained character is used.
//  - a single array argument containing the actual arguments
//  - a single string; the returned buffer will contain the char codes of all
//    contained characters.
function bytes(...input) {
  if (input.length == 1 && typeof input[0] == 'array') input = input[0];
  if (input.length == 1 && typeof input[0] == 'string') {
    let len = input[0].length;
    let view = new Uint8Array(len);
    for (let i = 0; i < len; i++) view[i] = input[0].charCodeAt(i);
    return view.buffer;
  }
  let view = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    if (typeof val == 'string') {
      if (val.length != 1) {
        throw new Error('string inputs must have length 1');
      }
      val = val.charCodeAt(0);
    }
    view[i] = val | 0;
  }
  return view.buffer;
}

// Header declaration constants
var kWasmH0 = 0;
var kWasmH1 = 0x61;
var kWasmH2 = 0x73;
var kWasmH3 = 0x6d;

var kWasmV0 = 0x1;
var kWasmV1 = 0;
var kWasmV2 = 0;
var kWasmV3 = 0;

var kHeaderSize = 8;
var kPageSize = 65536;
var kSpecMaxPages = 65536;
var kMaxVarInt32Size = 5;
var kMaxVarInt64Size = 10;

let kDeclNoLocals = 0;

// Section declaration constants
let kUnknownSectionCode = 0;
let kTypeSectionCode = 1;        // Function signature declarations
let kImportSectionCode = 2;      // Import declarations
let kFunctionSectionCode = 3;    // Function declarations
let kTableSectionCode = 4;       // Indirect function table and other tables
let kMemorySectionCode = 5;      // Memory attributes
let kGlobalSectionCode = 6;      // Global declarations
let kExportSectionCode = 7;      // Exports
let kStartSectionCode = 8;       // Start function declaration
let kElementSectionCode = 9;     // Elements section
let kCodeSectionCode = 10;       // Function code
let kDataSectionCode = 11;       // Data segments
let kDataCountSectionCode = 12;  // Data segment count (between Element & Code)
let kTagSectionCode = 13;        // Tag section (between Memory & Global)
let kStringRefSectionCode = 14;  // Stringref literals section (between Tag & Global)
let kLastKnownSectionCode = 14;

// Name section types
let kModuleNameCode = 0;
let kFunctionNamesCode = 1;
let kLocalNamesCode = 2;

let kWasmFunctionTypeForm = 0x60;
let kWasmStructTypeForm = 0x5f;
let kWasmArrayTypeForm = 0x5e;
let kWasmSubtypeForm = 0x50;
let kWasmSubtypeFinalForm = 0x4e;
let kWasmRecursiveTypeGroupForm = 0x4f;

let kNoSuperType = 0xFFFFFFFF;

let kLimitsNoMaximum = 0x00;
let kLimitsWithMaximum = 0x01;
let kLimitsSharedNoMaximum = 0x02;
let kLimitsSharedWithMaximum = 0x03;
let kLimitsMemory64NoMaximum = 0x04;
let kLimitsMemory64WithMaximum = 0x05;
let kLimitsMemory64SharedNoMaximum = 0x06;
let kLimitsMemory64SharedWithMaximum = 0x07;

// Segment flags
let kActiveNoIndex = 0;
let kPassive = 1;
let kActiveWithIndex = 2;
let kDeclarative = 3;
let kPassiveWithElements = 5;
let kDeclarativeWithElements = 7;

// Function declaration flags
let kDeclFunctionName = 0x01;
let kDeclFunctionImport = 0x02;
let kDeclFunctionLocals = 0x04;
let kDeclFunctionExport = 0x08;

// Value types and related
let kWasmVoid = 0x40;
let kWasmI32 = 0x7f;
let kWasmI64 = 0x7e;
let kWasmF32 = 0x7d;
let kWasmF64 = 0x7c;
let kWasmS128 = 0x7b;
let kWasmI8 = 0x7a;
let kWasmI16 = 0x79;

// These are defined as negative integers to distinguish them from positive type
// indices.
let kWasmFuncRef = -0x10;
let kWasmAnyFunc = kWasmFuncRef;  // Alias named as in the JS API spec
let kWasmExternRef = -0x11;
let kWasmAnyRef = -0x12;
let kWasmEqRef = -0x13;
let kWasmI31Ref = -0x16;
let kWasmNullExternRef = -0x17;
let kWasmNullFuncRef = -0x18;
let kWasmStructRef = -0x19;
let kWasmArrayRef = -0x1a;
let kWasmNullRef = -0x1b;
let kWasmStringRef = -0x1c;
let kWasmStringViewWtf8 = -0x1d;
let kWasmStringViewWtf16 = -0x1e;
let kWasmStringViewIter = -0x1f;

// Use the positive-byte versions inside function bodies.
let kLeb128Mask = 0x7f;
let kFuncRefCode = kWasmFuncRef & kLeb128Mask;
let kAnyFuncCode = kFuncRefCode;  // Alias named as in the JS API spec
let kExternRefCode = kWasmExternRef & kLeb128Mask;
let kAnyRefCode = kWasmAnyRef & kLeb128Mask;
let kEqRefCode = kWasmEqRef & kLeb128Mask;
let kI31RefCode = kWasmI31Ref & kLeb128Mask;
let kNullExternRefCode = kWasmNullExternRef & kLeb128Mask;
let kNullFuncRefCode = kWasmNullFuncRef & kLeb128Mask;
let kStructRefCode = kWasmStructRef & kLeb128Mask;
let kArrayRefCode = kWasmArrayRef & kLeb128Mask;
let kNullRefCode = kWasmNullRef & kLeb128Mask;
let kStringRefCode = kWasmStringRef & kLeb128Mask;
let kStringViewWtf8Code = kWasmStringViewWtf8 & kLeb128Mask;
let kStringViewWtf16Code = kWasmStringViewWtf16 & kLeb128Mask;
let kStringViewIterCode = kWasmStringViewIter & kLeb128Mask;

let kWasmRefNull = 0x6c;
let kWasmRef = 0x6b;
function wasmRefNullType(heap_type) {
  return {opcode: kWasmRefNull, heap_type: heap_type};
}
function wasmRefType(heap_type) {
  return {opcode: kWasmRef, heap_type: heap_type};
}

let kExternalFunction = 0;
let kExternalTable = 1;
let kExternalMemory = 2;
let kExternalGlobal = 3;
let kExternalTag = 4;

let kTableZero = 0;
let kMemoryZero = 0;
let kSegmentZero = 0;

let kExceptionAttribute = 0;

// Useful signatures
let kSig_i_i = makeSig([kWasmI32], [kWasmI32]);
let kSig_l_l = makeSig([kWasmI64], [kWasmI64]);
let kSig_i_l = makeSig([kWasmI64], [kWasmI32]);
let kSig_i_ii = makeSig([kWasmI32, kWasmI32], [kWasmI32]);
let kSig_i_iii = makeSig([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]);
let kSig_v_iiii = makeSig([kWasmI32, kWasmI32, kWasmI32, kWasmI32], []);
let kSig_l_i = makeSig([kWasmI32], [kWasmI64]);
let kSig_f_ff = makeSig([kWasmF32, kWasmF32], [kWasmF32]);
let kSig_d_dd = makeSig([kWasmF64, kWasmF64], [kWasmF64]);
let kSig_l_ll = makeSig([kWasmI64, kWasmI64], [kWasmI64]);
let kSig_i_dd = makeSig([kWasmF64, kWasmF64], [kWasmI32]);
let kSig_v_v = makeSig([], []);
let kSig_i_v = makeSig([], [kWasmI32]);
let kSig_l_v = makeSig([], [kWasmI64]);
let kSig_f_v = makeSig([], [kWasmF32]);
let kSig_d_v = makeSig([], [kWasmF64]);
let kSig_v_i = makeSig([kWasmI32], []);
let kSig_v_ii = makeSig([kWasmI32, kWasmI32], []);
let kSig_v_iii = makeSig([kWasmI32, kWasmI32, kWasmI32], []);
let kSig_v_l = makeSig([kWasmI64], []);
let kSig_v_li = makeSig([kWasmI64, kWasmI32], []);
let kSig_v_d = makeSig([kWasmF64], []);
let kSig_v_dd = makeSig([kWasmF64, kWasmF64], []);
let kSig_v_ddi = makeSig([kWasmF64, kWasmF64, kWasmI32], []);
let kSig_ii_v = makeSig([], [kWasmI32, kWasmI32]);
let kSig_iii_v = makeSig([], [kWasmI32, kWasmI32, kWasmI32]);
let kSig_ii_i = makeSig([kWasmI32], [kWasmI32, kWasmI32]);
let kSig_iii_i = makeSig([kWasmI32], [kWasmI32, kWasmI32, kWasmI32]);
let kSig_ii_ii = makeSig([kWasmI32, kWasmI32], [kWasmI32, kWasmI32]);
let kSig_iii_ii = makeSig([kWasmI32, kWasmI32], [kWasmI32, kWasmI32, kWasmI32]);

let kSig_v_f = makeSig([kWasmF32], []);
let kSig_f_f = makeSig([kWasmF32], [kWasmF32]);
let kSig_f_d = makeSig([kWasmF64], [kWasmF32]);
let kSig_d_d = makeSig([kWasmF64], [kWasmF64]);
let kSig_r_r = makeSig([kWasmExternRef], [kWasmExternRef]);
let kSig_a_a = makeSig([kWasmAnyFunc], [kWasmAnyFunc]);
let kSig_i_r = makeSig([kWasmExternRef], [kWasmI32]);
let kSig_v_r = makeSig([kWasmExternRef], []);
let kSig_v_a = makeSig([kWasmAnyFunc], []);
let kSig_v_rr = makeSig([kWasmExternRef, kWasmExternRef], []);
let kSig_v_aa = makeSig([kWasmAnyFunc, kWasmAnyFunc], []);
let kSig_r_v = makeSig([], [kWasmExternRef]);
let kSig_a_v = makeSig([], [kWasmAnyFunc]);
let kSig_a_i = makeSig([kWasmI32], [kWasmAnyFunc]);
let kSig_s_i = makeSig([kWasmI32], [kWasmS128]);
let kSig_i_s = makeSig([kWasmS128], [kWasmI32]);

function makeSig(params, results) {
  return {params: params, results: results};
}

function makeSig_v_x(x) {
  return makeSig([x], []);
}

function makeSig_x_v(x) {
  return makeSig([], [x]);
}

function makeSig_v_xx(x) {
  return makeSig([x, x], []);
}

function makeSig_r_v(r) {
  return makeSig([], [r]);
}

function makeSig_r_x(r, x) {
  return makeSig([x], [r]);
}

function makeSig_r_xx(r, x) {
  return makeSig([x, x], [r]);
}

// Opcodes
const kWasmOpcodes = {
  'Unreachable': 0x00,
  'Nop': 0x01,
  'Block': 0x02,
  'Loop': 0x03,
  'If': 0x04,
  'Else': 0x05,
  'Try': 0x06,
  'Catch': 0x07,
  'Throw': 0x08,
  'Rethrow': 0x09,
  'CatchAll': 0x19,
  'End': 0x0b,
  'Br': 0x0c,
  'BrIf': 0x0d,
  'BrTable': 0x0e,
  'Return': 0x0f,
  'CallFunction': 0x10,
  'CallIndirect': 0x11,
  'ReturnCall': 0x12,
  'ReturnCallIndirect': 0x13,
  'CallRef': 0x14,
  'ReturnCallRef': 0x15,
  'Delegate': 0x18,
  'Drop': 0x1a,
  'Select': 0x1b,
  'SelectWithType': 0x1c,
  'LocalGet': 0x20,
  'LocalSet': 0x21,
  'LocalTee': 0x22,
  'GlobalGet': 0x23,
  'GlobalSet': 0x24,
  'TableGet': 0x25,
  'TableSet': 0x26,
  'I32LoadMem': 0x28,
  'I64LoadMem': 0x29,
  'F32LoadMem': 0x2a,
  'F64LoadMem': 0x2b,
  'I32LoadMem8S': 0x2c,
  'I32LoadMem8U': 0x2d,
  'I32LoadMem16S': 0x2e,
  'I32LoadMem16U': 0x2f,
  'I64LoadMem8S': 0x30,
  'I64LoadMem8U': 0x31,
  'I64LoadMem16S': 0x32,
  'I64LoadMem16U': 0x33,
  'I64LoadMem32S': 0x34,
  'I64LoadMem32U': 0x35,
  'I32StoreMem': 0x36,
  'I64StoreMem': 0x37,
  'F32StoreMem': 0x38,
  'F64StoreMem': 0x39,
  'I32StoreMem8': 0x3a,
  'I32StoreMem16': 0x3b,
  'I64StoreMem8': 0x3c,
  'I64StoreMem16': 0x3d,
  'I64StoreMem32': 0x3e,
  'MemorySize': 0x3f,
  'MemoryGrow': 0x40,
  'I32Const': 0x41,
  'I64Const': 0x42,
  'F32Const': 0x43,
  'F64Const': 0x44,
  'I32Eqz': 0x45,
  'I32Eq': 0x46,
  'I32Ne': 0x47,
  'I32LtS': 0x48,
  'I32LtU': 0x49,
  'I32GtS': 0x4a,
  'I32GtU': 0x4b,
  'I32LeS': 0x4c,
  'I32LeU': 0x4d,
  'I32GeS': 0x4e,
  'I32GeU': 0x4f,
  'I64Eqz': 0x50,
  'I64Eq': 0x51,
  'I64Ne': 0x52,
  'I64LtS': 0x53,
  'I64LtU': 0x54,
  'I64GtS': 0x55,
  'I64GtU': 0x56,
  'I64LeS': 0x57,
  'I64LeU': 0x58,
  'I64GeS': 0x59,
  'I64GeU': 0x5a,
  'F32Eq': 0x5b,
  'F32Ne': 0x5c,
  'F32Lt': 0x5d,
  'F32Gt': 0x5e,
  'F32Le': 0x5f,
  'F32Ge': 0x60,
  'F64Eq': 0x61,
  'F64Ne': 0x62,
  'F64Lt': 0x63,
  'F64Gt': 0x64,
  'F64Le': 0x65,
  'F64Ge': 0x66,
  'I32Clz': 0x67,
  'I32Ctz': 0x68,
  'I32Popcnt': 0x69,
  'I32Add': 0x6a,
  'I32Sub': 0x6b,
  'I32Mul': 0x6c,
  'I32DivS': 0x6d,
  'I32DivU': 0x6e,
  'I32RemS': 0x6f,
  'I32RemU': 0x70,
  'I32And': 0x71,
  'I32Ior': 0x72,
  'I32Xor': 0x73,
  'I32Shl': 0x74,
  'I32ShrS': 0x75,
  'I32ShrU': 0x76,
  'I32Rol': 0x77,
  'I32Ror': 0x78,
  'I64Clz': 0x79,
  'I64Ctz': 0x7a,
  'I64Popcnt': 0x7b,
  'I64Add': 0x7c,
  'I64Sub': 0x7d,
  'I64Mul': 0x7e,
  'I64DivS': 0x7f,
  'I64DivU': 0x80,
  'I64RemS': 0x81,
  'I64RemU': 0x82,
  'I64And': 0x83,
  'I64Ior': 0x84,
  'I64Xor': 0x85,
  'I64Shl': 0x86,
  'I64ShrS': 0x87,
  'I64ShrU': 0x88,
  'I64Rol': 0x89,
  'I64Ror': 0x8a,
  'F32Abs': 0x8b,
  'F32Neg': 0x8c,
  'F32Ceil': 0x8d,
  'F32Floor': 0x8e,
  'F32Trunc': 0x8f,
  'F32NearestInt': 0x90,
  'F32Sqrt': 0x91,
  'F32Add': 0x92,
  'F32Sub': 0x93,
  'F32Mul': 0x94,
  'F32Div': 0x95,
  'F32Min': 0x96,
  'F32Max': 0x97,
  'F32CopySign': 0x98,
  'F64Abs': 0x99,
  'F64Neg': 0x9a,
  'F64Ceil': 0x9b,
  'F64Floor': 0x9c,
  'F64Trunc': 0x9d,
  'F64NearestInt': 0x9e,
  'F64Sqrt': 0x9f,
  'F64Add': 0xa0,
  'F64Sub': 0xa1,
  'F64Mul': 0xa2,
  'F64Div': 0xa3,
  'F64Min': 0xa4,
  'F64Max': 0xa5,
  'F64CopySign': 0xa6,
  'I32ConvertI64': 0xa7,
  'I32SConvertF32': 0xa8,
  'I32UConvertF32': 0xa9,
  'I32SConvertF64': 0xaa,
  'I32UConvertF64': 0xab,
  'I64SConvertI32': 0xac,
  'I64UConvertI32': 0xad,
  'I64SConvertF32': 0xae,
  'I64UConvertF32': 0xaf,
  'I64SConvertF64': 0xb0,
  'I64UConvertF64': 0xb1,
  'F32SConvertI32': 0xb2,
  'F32UConvertI32': 0xb3,
  'F32SConvertI64': 0xb4,
  'F32UConvertI64': 0xb5,
  'F32ConvertF64': 0xb6,
  'F64SConvertI32': 0xb7,
  'F64UConvertI32': 0xb8,
  'F64SConvertI64': 0xb9,
  'F64UConvertI64': 0xba,
  'F64ConvertF32': 0xbb,
  'I32ReinterpretF32': 0xbc,
  'I64ReinterpretF64': 0xbd,
  'F32ReinterpretI32': 0xbe,
  'F64ReinterpretI64': 0xbf,
  'I32SExtendI8': 0xc0,
  'I32SExtendI16': 0xc1,
  'I64SExtendI8': 0xc2,
  'I64SExtendI16': 0xc3,
  'I64SExtendI32': 0xc4,
  'RefNull': 0xd0,
  'RefIsNull': 0xd1,
  'RefFunc': 0xd2,
  'RefAsNonNull': 0xd3,
  'BrOnNull': 0xd4,
  'RefEq': 0xd5,
  'BrOnNonNull': 0xd6
};

function defineWasmOpcode(name, value) {
  if (globalThis.kWasmOpcodeNames === undefined) {
    globalThis.kWasmOpcodeNames = {};
  }
  Object.defineProperty(globalThis, name, {value: value});
  if (globalThis.kWasmOpcodeNames[value] !== undefined) {
    throw new Error(`Duplicate wasm opcode: ${value}. Previous name: ${
        globalThis.kWasmOpcodeNames[value]}, new name: ${name}`);
  }
  globalThis.kWasmOpcodeNames[value] = name;
}
for (let name in kWasmOpcodes) {
  defineWasmOpcode(`kExpr${name}`, kWasmOpcodes[name]);
}

// Prefix opcodes
const kPrefixOpcodes = {
  'GC': 0xfb,
  'Numeric': 0xfc,
  'Simd': 0xfd,
  'Atomic': 0xfe
};
for (let prefix in kPrefixOpcodes) {
  defineWasmOpcode(`k${prefix}Prefix`, kPrefixOpcodes[prefix]);
}

// Use these for multi-byte instructions (opcode > 0x7F needing two LEB bytes):
function SimdInstr(opcode) {
  if (opcode <= 0x7F) return [kSimdPrefix, opcode];
  return [kSimdPrefix, 0x80 | (opcode & 0x7F), opcode >> 7];
}
function GCInstr(opcode) {
  if (opcode <= 0x7F) return [kGCPrefix, opcode];
  return [kGCPrefix, 0x80 | (opcode & 0x7F), opcode >> 7];
}

// GC opcodes
let kExprStructGet = 0x03;
let kExprStructGetS = 0x04;
let kExprStructGetU = 0x05;
let kExprStructSet = 0x06;
let kExprStructNew = 0x07;
let kExprStructNewDefault = 0x08;
let kExprArrayGet = 0x13;
let kExprArrayGetS = 0x14;
let kExprArrayGetU = 0x15;
let kExprArraySet = 0x16;
let kExprArrayCopy = 0x18;
let kExprArrayLen = 0x19;
let kExprArrayNewFixed = 0x1a;
let kExprArrayNew = 0x1b;
let kExprArrayNewDefault = 0x1c;
let kExprArrayNewData = 0x1d;
let kExprArrayNewElem = 0x1f;
let kExprArrayInitData = 0x54;
let kExprArrayInitElem = 0x55;
let kExprArrayFill = 0x0f;
let kExprI31New = 0x20;
let kExprI31GetS = 0x21;
let kExprI31GetU = 0x22;
let kExprRefTest = 0x40;
let kExprRefTestNull = 0x48;
let kExprRefTestDeprecated = 0x44;
let kExprRefCast = 0x41;
let kExprRefCastNull = 0x49;
let kExprRefCastDeprecated = 0x45;
let kExprBrOnCast = 0x42;
let kExprBrOnCastNull = 0x4a;
let kExprBrOnCastDeprecated = 0x46;
let kExprBrOnCastFail = 0x43;
let kExprBrOnCastFailNull = 0x4b;
let kExprBrOnCastGeneric = 0x4e;
let kExprBrOnCastFailGeneric = 0x4f;
let kExprRefCastNop = 0x4c;
let kExprRefIsData = 0x51;
let kExprRefIsI31 = 0x52;
let kExprRefIsArray = 0x53;
let kExprRefAsStruct = 0x59;
let kExprRefAsI31 = 0x5a;
let kExprRefAsArray = 0x5b;
let kExprBrOnStruct = 0x61;
let kExprBrOnI31 = 0x62;
let kExprBrOnArray = 0x66;
let kExprBrOnNonStruct = 0x64;
let kExprBrOnNonI31 = 0x65;
let kExprBrOnNonArray = 0x67;
let kExprExternInternalize = 0x70;
let kExprExternExternalize = 0x71;
let kExprStringNewUtf8 = 0x80;
let kExprStringNewWtf16 = 0x81;
let kExprStringConst = 0x82;
let kExprStringMeasureUtf8 = 0x83;
let kExprStringMeasureWtf8 = 0x84;
let kExprStringMeasureWtf16 = 0x85;
let kExprStringEncodeUtf8 = 0x86;
let kExprStringEncodeWtf16 = 0x87;
let kExprStringConcat = 0x88;
let kExprStringEq = 0x89;
let kExprStringIsUsvSequence = 0x8a;
let kExprStringNewLossyUtf8 = 0x8b;
let kExprStringNewWtf8 = 0x8c;
let kExprStringEncodeLossyUtf8 = 0x8d;
let kExprStringEncodeWtf8 = 0x8e;
let kExprStringNewUtf8Try = 0x8f;
let kExprStringAsWtf8 = 0x90;
let kExprStringViewWtf8Advance = 0x91;
let kExprStringViewWtf8EncodeUtf8 = 0x92;
let kExprStringViewWtf8Slice = 0x93;
let kExprStringViewWtf8EncodeLossyUtf8 = 0x94;
let kExprStringViewWtf8EncodeWtf8 = 0x95;
let kExprStringAsWtf16 = 0x98;
let kExprStringViewWtf16Length = 0x99;
let kExprStringViewWtf16GetCodeunit = 0x9a;
let kExprStringViewWtf16Encode = 0x9b;
let kExprStringViewWtf16Slice = 0x9c;
let kExprStringAsIter = 0xa0;
let kExprStringViewIterNext = 0xa1
let kExprStringViewIterAdvance = 0xa2;
let kExprStringViewIterRewind = 0xa3
let kExprStringViewIterSlice = 0xa4;
let kExprStringCompare = 0xa8;
let kExprStringFromCodePoint = 0xa9;
let kExprStringHash = 0xaa;
let kExprStringNewUtf8Array = 0xb0;
let kExprStringNewWtf16Array = 0xb1;
let kExprStringEncodeUtf8Array = 0xb2;
let kExprStringEncodeWtf16Array = 0xb3;
let kExprStringNewLossyUtf8Array = 0xb4;
let kExprStringNewWtf8Array = 0xb5;
let kExprStringEncodeLossyUtf8Array = 0xb6;
let kExprStringEncodeWtf8Array = 0xb7;
let kExprStringNewUtf8ArrayTry = 0xb8;

// Numeric opcodes.
let kExprI32SConvertSatF32 = 0x00;
let kExprI32UConvertSatF32 = 0x01;
let kExprI32SConvertSatF64 = 0x02;
let kExprI32UConvertSatF64 = 0x03;
let kExprI64SConvertSatF32 = 0x04;
let kExprI64UConvertSatF32 = 0x05;
let kExprI64SConvertSatF64 = 0x06;
let kExprI64UConvertSatF64 = 0x07;
let kExprMemoryInit = 0x08;
let kExprDataDrop = 0x09;
let kExprMemoryCopy = 0x0a;
let kExprMemoryFill = 0x0b;
let kExprTableInit = 0x0c;
let kExprElemDrop = 0x0d;
let kExprTableCopy = 0x0e;
let kExprTableGrow = 0x0f;
let kExprTableSize = 0x10;
let kExprTableFill = 0x11;

// Atomic opcodes.
let kExprAtomicNotify = 0x00;
let kExprI32AtomicWait = 0x01;
let kExprI64AtomicWait = 0x02;
let kExprI32AtomicLoad = 0x10;
let kExprI32AtomicLoad8U = 0x12;
let kExprI32AtomicLoad16U = 0x13;
let kExprI32AtomicStore = 0x17;
let kExprI32AtomicStore8U = 0x19;
let kExprI32AtomicStore16U = 0x1a;
let kExprI32AtomicAdd = 0x1e;
let kExprI32AtomicAdd8U = 0x20;
let kExprI32AtomicAdd16U = 0x21;
let kExprI32AtomicSub = 0x25;
let kExprI32AtomicSub8U = 0x27;
let kExprI32AtomicSub16U = 0x28;
let kExprI32AtomicAnd = 0x2c;
let kExprI32AtomicAnd8U = 0x2e;
let kExprI32AtomicAnd16U = 0x2f;
let kExprI32AtomicOr = 0x33;
let kExprI32AtomicOr8U = 0x35;
let kExprI32AtomicOr16U = 0x36;
let kExprI32AtomicXor = 0x3a;
let kExprI32AtomicXor8U = 0x3c;
let kExprI32AtomicXor16U = 0x3d;
let kExprI32AtomicExchange = 0x41;
let kExprI32AtomicExchange8U = 0x43;
let kExprI32AtomicExchange16U = 0x44;
let kExprI32AtomicCompareExchange = 0x48;
let kExprI32AtomicCompareExchange8U = 0x4a;
let kExprI32AtomicCompareExchange16U = 0x4b;

let kExprI64AtomicLoad = 0x11;
let kExprI64AtomicLoad8U = 0x14;
let kExprI64AtomicLoad16U = 0x15;
let kExprI64AtomicLoad32U = 0x16;
let kExprI64AtomicStore = 0x18;
let kExprI64AtomicStore8U = 0x1b;
let kExprI64AtomicStore16U = 0x1c;
let kExprI64AtomicStore32U = 0x1d;
let kExprI64AtomicAdd = 0x1f;
let kExprI64AtomicAdd8U = 0x22;
let kExprI64AtomicAdd16U = 0x23;
let kExprI64AtomicAdd32U = 0x24;
let kExprI64AtomicSub = 0x26;
let kExprI64AtomicSub8U = 0x29;
let kExprI64AtomicSub16U = 0x2a;
let kExprI64AtomicSub32U = 0x2b;
let kExprI64AtomicAnd = 0x2d;
let kExprI64AtomicAnd8U = 0x30;
let kExprI64AtomicAnd16U = 0x31;
let kExprI64AtomicAnd32U = 0x32;
let kExprI64AtomicOr = 0x34;
let kExprI64AtomicOr8U = 0x37;
let kExprI64AtomicOr16U = 0x38;
let kExprI64AtomicOr32U = 0x39;
let kExprI64AtomicXor = 0x3b;
let kExprI64AtomicXor8U = 0x3e;
let kExprI64AtomicXor16U = 0x3f;
let kExprI64AtomicXor32U = 0x40;
let kExprI64AtomicExchange = 0x42;
let kExprI64AtomicExchange8U = 0x45;
let kExprI64AtomicExchange16U = 0x46;
let kExprI64AtomicExchange32U = 0x47;
let kExprI64AtomicCompareExchange = 0x49
let kExprI64AtomicCompareExchange8U = 0x4c;
let kExprI64AtomicCompareExchange16U = 0x4d;
let kExprI64AtomicCompareExchange32U = 0x4e;

// Simd opcodes.
let kExprS128LoadMem = 0x00;
let kExprS128Load8x8S = 0x01;
let kExprS128Load8x8U = 0x02;
let kExprS128Load16x4S = 0x03;
let kExprS128Load16x4U = 0x04;
let kExprS128Load32x2S = 0x05;
let kExprS128Load32x2U = 0x06;
let kExprS128Load8Splat = 0x07;
let kExprS128Load16Splat = 0x08;
let kExprS128Load32Splat = 0x09;
let kExprS128Load64Splat = 0x0a;
let kExprS128StoreMem = 0x0b;
let kExprS128Const = 0x0c;
let kExprI8x16Shuffle = 0x0d;
let kExprI8x16Swizzle = 0x0e;

let kExprI8x16Splat = 0x0f;
let kExprI16x8Splat = 0x10;
let kExprI32x4Splat = 0x11;
let kExprI64x2Splat = 0x12;
let kExprF32x4Splat = 0x13;
let kExprF64x2Splat = 0x14;
let kExprI8x16ExtractLaneS = 0x15;
let kExprI8x16ExtractLaneU = 0x16;
let kExprI8x16ReplaceLane = 0x17;
let kExprI16x8ExtractLaneS = 0x18;
let kExprI16x8ExtractLaneU = 0x19;
let kExprI16x8ReplaceLane = 0x1a;
let kExprI32x4ExtractLane = 0x1b;
let kExprI32x4ReplaceLane = 0x1c;
let kExprI64x2ExtractLane = 0x1d;
let kExprI64x2ReplaceLane = 0x1e;
let kExprF32x4ExtractLane = 0x1f;
let kExprF32x4ReplaceLane = 0x20;
let kExprF64x2ExtractLane = 0x21;
let kExprF64x2ReplaceLane = 0x22;
let kExprI8x16Eq = 0x23;
let kExprI8x16Ne = 0x24;
let kExprI8x16LtS = 0x25;
let kExprI8x16LtU = 0x26;
let kExprI8x16GtS = 0x27;
let kExprI8x16GtU = 0x28;
let kExprI8x16LeS = 0x29;
let kExprI8x16LeU = 0x2a;
let kExprI8x16GeS = 0x2b;
let kExprI8x16GeU = 0x2c;
let kExprI16x8Eq = 0x2d;
let kExprI16x8Ne = 0x2e;
let kExprI16x8LtS = 0x2f;
let kExprI16x8LtU = 0x30;
let kExprI16x8GtS = 0x31;
let kExprI16x8GtU = 0x32;
let kExprI16x8LeS = 0x33;
let kExprI16x8LeU = 0x34;
let kExprI16x8GeS = 0x35;
let kExprI16x8GeU = 0x36;
let kExprI32x4Eq = 0x37;
let kExprI32x4Ne = 0x38;
let kExprI32x4LtS = 0x39;
let kExprI32x4LtU = 0x3a;
let kExprI32x4GtS = 0x3b;
let kExprI32x4GtU = 0x3c;
let kExprI32x4LeS = 0x3d;
let kExprI32x4LeU = 0x3e;
let kExprI32x4GeS = 0x3f;
let kExprI32x4GeU = 0x40;
let kExprF32x4Eq = 0x41;
let kExprF32x4Ne = 0x42;
let kExprF32x4Lt = 0x43;
let kExprF32x4Gt = 0x44;
let kExprF32x4Le = 0x45;
let kExprF32x4Ge = 0x46;
let kExprF64x2Eq = 0x47;
let kExprF64x2Ne = 0x48;
let kExprF64x2Lt = 0x49;
let kExprF64x2Gt = 0x4a;
let kExprF64x2Le = 0x4b;
let kExprF64x2Ge = 0x4c;
let kExprS128Not = 0x4d;
let kExprS128And = 0x4e;
let kExprS128AndNot = 0x4f;
let kExprS128Or = 0x50;
let kExprS128Xor = 0x51;
let kExprS128Select = 0x52;
let kExprV128AnyTrue = 0x53;
let kExprS128Load8Lane = 0x54;
let kExprS128Load16Lane = 0x55;
let kExprS128Load32Lane = 0x56;
let kExprS128Load64Lane = 0x57;
let kExprS128Store8Lane = 0x58;
let kExprS128Store16Lane = 0x59;
let kExprS128Store32Lane = 0x5a;
let kExprS128Store64Lane = 0x5b;
let kExprS128Load32Zero = 0x5c;
let kExprS128Load64Zero = 0x5d;
let kExprF32x4DemoteF64x2Zero = 0x5e;
let kExprF64x2PromoteLowF32x4 = 0x5f;
let kExprI8x16Abs = 0x60;
let kExprI8x16Neg = 0x61;
let kExprI8x16Popcnt = 0x62;
let kExprI8x16AllTrue = 0x63;
let kExprI8x16BitMask = 0x64;
let kExprI8x16SConvertI16x8 = 0x65;
let kExprI8x16UConvertI16x8 = 0x66;
let kExprF32x4Ceil = 0x67;
let kExprF32x4Floor = 0x68;
let kExprF32x4Trunc = 0x69;
let kExprF32x4NearestInt = 0x6a;
let kExprI8x16Shl = 0x6b;
let kExprI8x16ShrS = 0x6c;
let kExprI8x16ShrU = 0x6d;
let kExprI8x16Add = 0x6e;
let kExprI8x16AddSatS = 0x6f;
let kExprI8x16AddSatU = 0x70;
let kExprI8x16Sub = 0x71;
let kExprI8x16SubSatS = 0x72;
let kExprI8x16SubSatU = 0x73;
let kExprF64x2Ceil = 0x74;
let kExprF64x2Floor = 0x75;
let kExprI8x16MinS = 0x76;
let kExprI8x16MinU = 0x77;
let kExprI8x16MaxS = 0x78;
let kExprI8x16MaxU = 0x79;
let kExprF64x2Trunc = 0x7a;
let kExprI8x16RoundingAverageU = 0x7b;
let kExprI16x8ExtAddPairwiseI8x16S = 0x7c;
let kExprI16x8ExtAddPairwiseI8x16U = 0x7d;
let kExprI32x4ExtAddPairwiseI16x8S = 0x7e;
let kExprI32x4ExtAddPairwiseI16x8U = 0x7f;
let kExprI16x8Abs = 0x80;
let kExprI16x8Neg = 0x81;
let kExprI16x8Q15MulRSatS = 0x82;
let kExprI16x8AllTrue = 0x83;
let kExprI16x8BitMask = 0x84;
let kExprI16x8SConvertI32x4 = 0x85;
let kExprI16x8UConvertI32x4 = 0x86;
let kExprI16x8SConvertI8x16Low = 0x87;
let kExprI16x8SConvertI8x16High = 0x88;
let kExprI16x8UConvertI8x16Low = 0x89;
let kExprI16x8UConvertI8x16High = 0x8a;
let kExprI16x8Shl = 0x8b;
let kExprI16x8ShrS = 0x8c;
let kExprI16x8ShrU = 0x8d;
let kExprI16x8Add = 0x8e;
let kExprI16x8AddSatS = 0x8f;
let kExprI16x8AddSatU = 0x90;
let kExprI16x8Sub = 0x91;
let kExprI16x8SubSatS = 0x92;
let kExprI16x8SubSatU = 0x93;
let kExprF64x2NearestInt = 0x94;
let kExprI16x8Mul = 0x95;
let kExprI16x8MinS = 0x96;
let kExprI16x8MinU = 0x97;
let kExprI16x8MaxS = 0x98;
let kExprI16x8MaxU = 0x99;
let kExprI16x8RoundingAverageU = 0x9b;
let kExprI16x8ExtMulLowI8x16S = 0x9c;
let kExprI16x8ExtMulHighI8x16S = 0x9d;
let kExprI16x8ExtMulLowI8x16U = 0x9e;
let kExprI16x8ExtMulHighI8x16U = 0x9f;
let kExprI32x4Abs = 0xa0;
let kExprI32x4Neg = 0xa1;
let kExprI32x4AllTrue = 0xa3;
let kExprI32x4BitMask = 0xa4;
let kExprI32x4SConvertI16x8Low = 0xa7;
let kExprI32x4SConvertI16x8High = 0xa8;
let kExprI32x4UConvertI16x8Low = 0xa9;
let kExprI32x4UConvertI16x8High = 0xaa;
let kExprI32x4Shl = 0xab;
let kExprI32x4ShrS = 0xac;
let kExprI32x4ShrU = 0xad;
let kExprI32x4Add = 0xae;
let kExprI32x4Sub = 0xb1;
let kExprI32x4Mul = 0xb5;
let kExprI32x4MinS = 0xb6;
let kExprI32x4MinU = 0xb7;
let kExprI32x4MaxS = 0xb8;
let kExprI32x4MaxU = 0xb9;
let kExprI32x4DotI16x8S = 0xba;
let kExprI32x4ExtMulLowI16x8S = 0xbc;
let kExprI32x4ExtMulHighI16x8S = 0xbd;
let kExprI32x4ExtMulLowI16x8U = 0xbe;
let kExprI32x4ExtMulHighI16x8U = 0xbf;
let kExprI64x2Abs = 0xc0;
let kExprI64x2Neg = 0xc1;
let kExprI64x2AllTrue = 0xc3;
let kExprI64x2BitMask = 0xc4;
let kExprI64x2SConvertI32x4Low = 0xc7;
let kExprI64x2SConvertI32x4High = 0xc8;
let kExprI64x2UConvertI32x4Low = 0xc9;
let kExprI64x2UConvertI32x4High = 0xca;
let kExprI64x2Shl = 0xcb;
let kExprI64x2ShrS = 0xcc;
let kExprI64x2ShrU = 0xcd;
let kExprI64x2Add = 0xce;
let kExprI64x2Sub = 0xd1;
let kExprI64x2Mul = 0xd5;
let kExprI64x2Eq = 0xd6;
let kExprI64x2Ne = 0xd7;
let kExprI64x2LtS = 0xd8;
let kExprI64x2GtS = 0xd9;
let kExprI64x2LeS = 0xda;
let kExprI64x2GeS = 0xdb;
let kExprI64x2ExtMulLowI32x4S = 0xdc;
let kExprI64x2ExtMulHighI32x4S = 0xdd;
let kExprI64x2ExtMulLowI32x4U = 0xde;
let kExprI64x2ExtMulHighI32x4U = 0xdf;
let kExprF32x4Abs = 0xe0;
let kExprF32x4Neg = 0xe1;
let kExprF32x4Sqrt = 0xe3;
let kExprF32x4Add = 0xe4;
let kExprF32x4Sub = 0xe5;
let kExprF32x4Mul = 0xe6;
let kExprF32x4Div = 0xe7;
let kExprF32x4Min = 0xe8;
let kExprF32x4Max = 0xe9;
let kExprF32x4Pmin = 0xea;
let kExprF32x4Pmax = 0xeb;
let kExprF64x2Abs = 0xec;
let kExprF64x2Neg = 0xed;
let kExprF64x2Sqrt = 0xef;
let kExprF64x2Add = 0xf0;
let kExprF64x2Sub = 0xf1;
let kExprF64x2Mul = 0xf2;
let kExprF64x2Div = 0xf3;
let kExprF64x2Min = 0xf4;
let kExprF64x2Max = 0xf5;
let kExprF64x2Pmin = 0xf6;
let kExprF64x2Pmax = 0xf7;
let kExprI32x4SConvertF32x4 = 0xf8;
let kExprI32x4UConvertF32x4 = 0xf9;
let kExprF32x4SConvertI32x4 = 0xfa;
let kExprF32x4UConvertI32x4 = 0xfb;
let kExprI32x4TruncSatF64x2SZero = 0xfc;
let kExprI32x4TruncSatF64x2UZero = 0xfd;
let kExprF64x2ConvertLowI32x4S = 0xfe;
let kExprF64x2ConvertLowI32x4U = 0xff;

// Compilation hint constants.
let kCompilationHintStrategyDefault = 0x00;
let kCompilationHintStrategyLazy = 0x01;
let kCompilationHintStrategyEager = 0x02;
let kCompilationHintStrategyLazyBaselineEagerTopTier = 0x03;
let kCompilationHintTierDefault = 0x00;
let kCompilationHintTierBaseline = 0x01;
let kCompilationHintTierOptimized = 0x02;

let kTrapUnreachable = 0;
let kTrapMemOutOfBounds = 1;
let kTrapDivByZero = 2;
let kTrapDivUnrepresentable = 3;
let kTrapRemByZero = 4;
let kTrapFloatUnrepresentable = 5;
let kTrapTableOutOfBounds = 6;
let kTrapFuncSigMismatch = 7;
let kTrapUnalignedAccess = 8;
let kTrapDataSegmentOutOfBounds = 9;
let kTrapElementSegmentOutOfBounds = 10;
let kTrapRethrowNull = 11;
let kTrapArrayTooLarge = 12;
let kTrapArrayOutOfBounds = 13;
let kTrapNullDereference = 14;
let kTrapIllegalCast = 15;

let kTrapMsgs = [
  'unreachable',                                    // --
  'memory access out of bounds',                    // --
  'divide by zero',                                 // --
  'divide result unrepresentable',                  // --
  'remainder by zero',                              // --
  'float unrepresentable in integer range',         // --
  'table index is out of bounds',                   // --
  'null function or function signature mismatch',   // --
  'operation does not support unaligned accesses',  // --
  'data segment out of bounds',                     // --
  'element segment out of bounds',                  // --
  'rethrowing null value',                          // --
  'requested new array is too large',               // --
  'array element access out of bounds',             // --
  'dereferencing a null pointer',                   // --
  'illegal cast',                                   // --
];

// This requires test/mjsunit/mjsunit.js.
function assertTraps(trap, code) {
  assertThrows(code, WebAssembly.RuntimeError, new RegExp(kTrapMsgs[trap]));
}

function assertTrapsOneOf(traps, code) {
  const errorChecker = new RegExp(
    '(' + traps.map(trap => kTrapMsgs[trap]).join('|') + ')'
  );
  assertThrows(code, WebAssembly.RuntimeError, errorChecker);
}

class Binary {
  constructor() {
    this.length = 0;
    this.buffer = new Uint8Array(8192);
  }

  ensure_space(needed) {
    if (this.buffer.length - this.length >= needed) return;
    let new_capacity = this.buffer.length * 2;
    while (new_capacity - this.length < needed) new_capacity *= 2;
    let new_buffer = new Uint8Array(new_capacity);
    new_buffer.set(this.buffer);
    this.buffer = new_buffer;
  }

  trunc_buffer() {
    return new Uint8Array(this.buffer.buffer, 0, this.length);
  }

  reset() {
    this.length = 0;
  }

  emit_u8(val) {
    this.ensure_space(1);
    this.buffer[this.length++] = val;
  }

  emit_u16(val) {
    this.ensure_space(2);
    this.buffer[this.length++] = val;
    this.buffer[this.length++] = val >> 8;
  }

  emit_u32(val) {
    this.ensure_space(4);
    this.buffer[this.length++] = val;
    this.buffer[this.length++] = val >> 8;
    this.buffer[this.length++] = val >> 16;
    this.buffer[this.length++] = val >> 24;
  }

  emit_leb_u(val, max_len) {
    this.ensure_space(max_len);
    for (let i = 0; i < max_len; ++i) {
      let v = val & 0xff;
      val = val >>> 7;
      if (val == 0) {
        this.buffer[this.length++] = v;
        return;
      }
      this.buffer[this.length++] = v | 0x80;
    }
    throw new Error('Leb value exceeds maximum length of ' + max_len);
  }

  emit_u32v(val) {
    this.emit_leb_u(val, kMaxVarInt32Size);
  }

  emit_u64v(val) {
    this.emit_leb_u(val, kMaxVarInt64Size);
  }

  emit_bytes(data) {
    this.ensure_space(data.length);
    this.buffer.set(data, this.length);
    this.length += data.length;
  }

  emit_string(string) {
    // When testing illegal names, we pass a byte array directly.
    if (string instanceof Array) {
      this.emit_u32v(string.length);
      this.emit_bytes(string);
      return;
    }

    // This is the hacky way to convert a JavaScript string to a UTF8 encoded
    // string only containing single-byte characters.
    let string_utf8 = unescape(encodeURIComponent(string));
    this.emit_u32v(string_utf8.length);
    for (let i = 0; i < string_utf8.length; i++) {
      this.emit_u8(string_utf8.charCodeAt(i));
    }
  }

  emit_heap_type(heap_type) {
    this.emit_bytes(wasmSignedLeb(heap_type, kMaxVarInt32Size));
  }

  emit_type(type) {
    if ((typeof type) == 'number') {
      this.emit_u8(type >= 0 ? type : type & kLeb128Mask);
    } else {
      this.emit_u8(type.opcode);
      if ('depth' in type) this.emit_u8(type.depth);
      this.emit_heap_type(type.heap_type);
    }
  }

  emit_init_expr(expr) {
    this.emit_bytes(expr);
    this.emit_u8(kExprEnd);
  }

  emit_header() {
    this.emit_bytes([
      kWasmH0, kWasmH1, kWasmH2, kWasmH3, kWasmV0, kWasmV1, kWasmV2, kWasmV3
    ]);
  }

  emit_section(section_code, content_generator) {
    // Emit section name.
    this.emit_u8(section_code);
    // Emit the section to a temporary buffer: its full length isn't know yet.
    const section = new Binary;
    content_generator(section);
    // Emit section length.
    this.emit_u32v(section.length);
    // Copy the temporary buffer.
    // Avoid spread because {section} can be huge.
    this.emit_bytes(section.trunc_buffer());
  }
}

class WasmFunctionBuilder {
  // Encoding of local names: a string corresponds to a local name,
  // a number n corresponds to n undefined names.
  constructor(module, name, type_index, arg_names) {
    this.module = module;
    this.name = name;
    this.type_index = type_index;
    this.body = [];
    this.locals = [];
    this.local_names = arg_names;
    this.body_offset = undefined;  // Not valid until module is serialized.
  }

  numLocalNames() {
    let num_local_names = 0;
    for (let loc_name of this.local_names) {
      if (typeof loc_name == 'string') ++num_local_names;
    }
    return num_local_names;
  }

  exportAs(name) {
    this.module.addExport(name, this.index);
    return this;
  }

  exportFunc() {
    this.exportAs(this.name);
    return this;
  }

  setCompilationHint(strategy, baselineTier, topTier) {
    this.module.setCompilationHint(strategy, baselineTier, topTier, this.index);
    return this;
  }

  addBody(body) {
    checkExpr(body);
    // Store a copy of the body, and automatically add the end opcode.
    this.body = body.concat([kExprEnd]);
    return this;
  }

  addBodyWithEnd(body) {
    this.body = body;
    return this;
  }

  getNumLocals() {
    let total_locals = 0;
    for (let l of this.locals) {
      total_locals += l.count
    }
    return total_locals;
  }

  addLocals(type, count, names) {
    this.locals.push({type: type, count: count});
    names = names || [];
    if (names.length > count) throw new Error('too many locals names given');
    this.local_names.push(...names);
    if (count > names.length) this.local_names.push(count - names.length);
    return this;
  }

  end() {
    return this.module;
  }
}

class WasmGlobalBuilder {
  constructor(module, type, mutable, init) {
    this.module = module;
    this.type = type;
    this.mutable = mutable;
    this.init = init;
  }

  exportAs(name) {
    this.module.exports.push(
        {name: name, kind: kExternalGlobal, index: this.index});
    return this;
  }
}

function checkExpr(expr) {
  for (let b of expr) {
    if (typeof b !== 'number' || (b & (~0xFF)) !== 0) {
      throw new Error(
          'invalid body (entries must be 8 bit numbers): ' + expr);
    }
  }
}

class WasmTableBuilder {
  constructor(module, type, initial_size, max_size, init_expr) {
    // TODO(manoskouk): Add the table index.
    this.module = module;
    this.type = type;
    this.initial_size = initial_size;
    this.has_max = max_size !== undefined;
    this.max_size = max_size;
    this.init_expr = init_expr;
    this.has_init = init_expr !== undefined;
  }

  exportAs(name) {
    this.module.exports.push(
        {name: name, kind: kExternalTable, index: this.index});
    return this;
  }
}

function makeField(type, mutability) {
  if ((typeof mutability) != 'boolean') {
    throw new Error('field mutability must be boolean');
  }
  return {type: type, mutability: mutability};
}

class WasmStruct {
  constructor(fields, is_final, supertype_idx) {
    if (!Array.isArray(fields)) {
      throw new Error('struct fields must be an array');
    }
    this.fields = fields;
    this.type_form = kWasmStructTypeForm;
    this.is_final = is_final;
    this.supertype = supertype_idx;
  }
}

class WasmArray {
  constructor(type, mutability, is_final, supertype_idx) {
    this.type = type;
    this.mutability = mutability;
    this.type_form = kWasmArrayTypeForm;
    this.is_final = is_final;
    this.supertype = supertype_idx;
  }
}

class WasmElemSegment {
  constructor(table, offset, type, elements, is_decl) {
    this.table = table;
    this.offset = offset;
    this.type = type;
    this.elements = elements;
    this.is_decl = is_decl;
    // Invariant checks.
    if ((table === undefined) != (offset === undefined)) {
      throw new Error("invalid element segment");
    }
    for (let elem of elements) {
      if (((typeof elem) == 'number') != (type === undefined)) {
        throw new Error("invalid element");
      }
    }
  }

  is_active() {
    return this.table !== undefined;
  }

  is_passive() {
    return this.table === undefined && !this.is_decl;
  }

  is_declarative() {
    return this.table === undefined && this.is_decl;
  }

  expressions_as_elements() {
    return this.type !== undefined;
  }
}

class WasmModuleBuilder {
  constructor() {
    this.types = [];
    this.imports = [];
    this.exports = [];
    this.stringrefs = [];
    this.globals = [];
    this.tables = [];
    this.tags = [];
    this.functions = [];
    this.compilation_hints = [];
    this.element_segments = [];
    this.data_segments = [];
    this.explicit = [];
    this.rec_groups = [];
    this.num_imported_funcs = 0;
    this.num_imported_globals = 0;
    this.num_imported_tables = 0;
    this.num_imported_tags = 0;
    return this;
  }

  addStart(start_index) {
    this.start_index = start_index;
    return this;
  }

  addMemory(min, max, exported, shared) {
    this.memory = {
      min: min,
      max: max,
      exported: exported,
      shared: shared || false,
      is_memory64: false
    };
    return this;
  }

  addMemory64(min, max, exported, shared) {
    this.memory = {
      min: min,
      max: max,
      exported: exported,
      shared: shared || false,
      is_memory64: true
    };
    return this;
  }

  addExplicitSection(bytes) {
    this.explicit.push(bytes);
    return this;
  }

  stringToBytes(name) {
    var result = new Binary();
    result.emit_u32v(name.length);
    for (var i = 0; i < name.length; i++) {
      result.emit_u8(name.charCodeAt(i));
    }
    return result.trunc_buffer()
  }

  createCustomSection(name, bytes) {
    name = this.stringToBytes(name);
    var section = new Binary();
    section.emit_u8(0);
    section.emit_u32v(name.length + bytes.length);
    section.emit_bytes(name);
    section.emit_bytes(bytes);
    return section.trunc_buffer();
  }

  addCustomSection(name, bytes) {
    this.explicit.push(this.createCustomSection(name, bytes));
  }

  // We use {is_final = true} so that the MVP syntax is generated for
  // signatures.
  addType(type, supertype_idx = kNoSuperType, is_final = true) {
    var pl = type.params.length;   // should have params
    var rl = type.results.length;  // should have results
    var type_copy = {params: type.params, results: type.results,
                     is_final: is_final, supertype: supertype_idx};
    this.types.push(type_copy);
    return this.types.length - 1;
  }

  addLiteralStringRef(str) {
    this.stringrefs.push(str);
    return this.stringrefs.length - 1;
  }

  addStruct(fields, supertype_idx = kNoSuperType, is_final = false) {
    this.types.push(new WasmStruct(fields, is_final, supertype_idx));
    return this.types.length - 1;
  }

  addArray(type, mutability, supertype_idx = kNoSuperType, is_final = false) {
    this.types.push(new WasmArray(type, mutability, is_final, supertype_idx));
    return this.types.length - 1;
  }

  static defaultFor(type) {
    switch (type) {
      case kWasmI32:
        return wasmI32Const(0);
      case kWasmI64:
        return wasmI64Const(0);
      case kWasmF32:
        return wasmF32Const(0.0);
      case kWasmF64:
        return wasmF64Const(0.0);
      case kWasmS128:
        return [kSimdPrefix, kExprS128Const, ...(new Array(16).fill(0))];
      default:
        if ((typeof type) != 'number' && type.opcode != kWasmRefNull) {
          throw new Error("Non-defaultable type");
        }
        let heap_type = (typeof type) == 'number' ? type : type.heap_type;
        return [kExprRefNull, ...wasmSignedLeb(heap_type, kMaxVarInt32Size)];
    }
  }

  addGlobal(type, mutable, init) {
    if (init === undefined) init = WasmModuleBuilder.defaultFor(type);
    checkExpr(init);
    let glob = new WasmGlobalBuilder(this, type, mutable, init);
    glob.index = this.globals.length + this.num_imported_globals;
    this.globals.push(glob);
    return glob;
  }

  addTable(
      type, initial_size, max_size = undefined, init_expr = undefined) {
    if (type == kWasmI32 || type == kWasmI64 || type == kWasmF32 ||
        type == kWasmF64 || type == kWasmS128 || type == kWasmVoid) {
      throw new Error('Tables must be of a reference type');
    }
    if (init_expr != undefined) checkExpr(init_expr);
    let table = new WasmTableBuilder(
        this, type, initial_size, max_size, init_expr);
    table.index = this.tables.length + this.num_imported_tables;
    this.tables.push(table);
    return table;
  }

  addTag(type) {
    let type_index = (typeof type) == 'number' ? type : this.addType(type);
    let tag_index = this.tags.length + this.num_imported_tags;
    this.tags.push(type_index);
    return tag_index;
  }

  addFunction(name, type, arg_names) {
    arg_names = arg_names || [];
    let type_index = (typeof type) == 'number' ? type : this.addType(type);
    let num_args = this.types[type_index].params.length;
    if (num_args < arg_names.length)
      throw new Error('too many arg names provided');
    if (num_args > arg_names.length)
      arg_names.push(num_args - arg_names.length);
    let func = new WasmFunctionBuilder(this, name, type_index, arg_names);
    func.index = this.functions.length + this.num_imported_funcs;
    this.functions.push(func);
    return func;
  }

  addImport(module, name, type) {
    if (this.functions.length != 0) {
      throw new Error('Imported functions must be declared before local ones');
    }
    let type_index = (typeof type) == 'number' ? type : this.addType(type);
    this.imports.push({
      module: module,
      name: name,
      kind: kExternalFunction,
      type_index: type_index
    });
    return this.num_imported_funcs++;
  }

  addImportedGlobal(module, name, type, mutable = false) {
    if (this.globals.length != 0) {
      throw new Error('Imported globals must be declared before local ones');
    }
    let o = {
      module: module,
      name: name,
      kind: kExternalGlobal,
      type: type,
      mutable: mutable
    };
    this.imports.push(o);
    return this.num_imported_globals++;
  }

  addImportedMemory(module, name, initial = 0, maximum, shared, is_memory64) {
    let o = {
      module: module,
      name: name,
      kind: kExternalMemory,
      initial: initial,
      maximum: maximum,
      shared: !!shared,
      is_memory64: !!is_memory64
    };
    this.imports.push(o);
    return this;
  }

  addImportedTable(module, name, initial, maximum, type) {
    if (this.tables.length != 0) {
      throw new Error('Imported tables must be declared before local ones');
    }
    let o = {
      module: module,
      name: name,
      kind: kExternalTable,
      initial: initial,
      maximum: maximum,
      type: type || kWasmFuncRef
    };
    this.imports.push(o);
    return this.num_imported_tables++;
  }

  addImportedTag(module, name, type) {
    if (this.tags.length != 0) {
      throw new Error('Imported tags must be declared before local ones');
    }
    let type_index = (typeof type) == 'number' ? type : this.addType(type);
    let o = {
      module: module,
      name: name,
      kind: kExternalTag,
      type_index: type_index
    };
    this.imports.push(o);
    return this.num_imported_tags++;
  }

  addExport(name, index) {
    this.exports.push({name: name, kind: kExternalFunction, index: index});
    return this;
  }

  addExportOfKind(name, kind, index) {
    if (index === undefined && kind != kExternalTable &&
        kind != kExternalMemory) {
      throw new Error(
          'Index for exports other than tables/memories must be provided');
    }
    if (index !== undefined && (typeof index) != 'number') {
      throw new Error('Index for exports must be a number')
    }
    this.exports.push({name: name, kind: kind, index: index});
    return this;
  }

  setCompilationHint(strategy, baselineTier, topTier, index) {
    this.compilation_hints[index] = {
      strategy: strategy,
      baselineTier: baselineTier,
      topTier: topTier
    };
    return this;
  }

  // TODO(manoskouk): Refactor this to use initializer expression for {addr}.
  addDataSegment(addr, data, is_global = false) {
    this.data_segments.push(
        {addr: addr, data: data, is_global: is_global, is_active: true});
    return this.data_segments.length - 1;
  }

  addPassiveDataSegment(data) {
    this.data_segments.push({data: data, is_active: false});
    return this.data_segments.length - 1;
  }

  exportMemoryAs(name) {
    this.exports.push({name: name, kind: kExternalMemory, index: 0});
  }

  // {offset} is a constant expression.
  // If {type} is undefined, then {elements} are function indices. Otherwise,
  // they are constant expressions.
  addActiveElementSegment(table, offset, elements, type) {
    checkExpr(offset);
    if (type != undefined) {
      for (let element of elements) checkExpr(element);
    }
    this.element_segments.push(
        new WasmElemSegment(table, offset, type, elements, false));
    return this.element_segments.length - 1;
  }

  // If {type} is undefined, then {elements} are function indices. Otherwise,
  // they are constant expressions.
  addPassiveElementSegment(elements, type) {
    if (type != undefined) {
      for (let element of elements) checkExpr(element);
    }
    this.element_segments.push(
      new WasmElemSegment(undefined, undefined, type, elements, false));
    return this.element_segments.length - 1;
  }

  // If {type} is undefined, then {elements} are function indices. Otherwise,
  // they are constant expressions.
  addDeclarativeElementSegment(elements, type) {
    if (type != undefined) {
      for (let element of elements) checkExpr(element);
    }
    this.element_segments.push(
      new WasmElemSegment(undefined, undefined, type, elements, true));
    return this.element_segments.length - 1;
  }

  appendToTable(array) {
    for (let n of array) {
      if (typeof n != 'number')
        throw new Error('invalid table (entries have to be numbers): ' + array);
    }
    if (this.tables.length == 0) {
      this.addTable(kWasmAnyFunc, 0);
    }
    // Adjust the table to the correct size.
    let table = this.tables[0];
    const base = table.initial_size;
    const table_size = base + array.length;
    table.initial_size = table_size;
    if (table.has_max && table_size > table.max_size) {
      table.max_size = table_size;
    }
    return this.addActiveElementSegment(0, wasmI32Const(base), array);
  }

  setTableBounds(min, max = undefined) {
    if (this.tables.length != 0) {
      throw new Error('The table bounds of table \'0\' have already been set.');
    }
    this.addTable(kWasmAnyFunc, min, max);
    return this;
  }

  startRecGroup() {
    this.rec_groups.push({start: this.types.length, size: 0});
  }

  endRecGroup() {
    if (this.rec_groups.length == 0) {
      throw new Error("Did not start a recursive group before ending one")
    }
    let last_element = this.rec_groups[this.rec_groups.length - 1]
    if (last_element.size != 0) {
      throw new Error("Did not start a recursive group before ending one")
    }
    last_element.size = this.types.length - last_element.start;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  toBuffer(debug = false) {
    let binary = new Binary;
    let wasm = this;

    // Add header
    binary.emit_header();

    // Add type section
    if (wasm.types.length > 0) {
      if (debug) print('emitting types @ ' + binary.length);
      binary.emit_section(kTypeSectionCode, section => {
        let length_with_groups = wasm.types.length;
        for (let group of wasm.rec_groups) {
          length_with_groups -= group.size - 1;
        }
        section.emit_u32v(length_with_groups);

        let rec_group_index = 0;

        for (let i = 0; i < wasm.types.length; i++) {
          if (rec_group_index < wasm.rec_groups.length &&
              wasm.rec_groups[rec_group_index].start == i) {
            section.emit_u8(kWasmRecursiveTypeGroupForm);
            section.emit_u32v(wasm.rec_groups[rec_group_index].size);
            rec_group_index++;
          }

          let type = wasm.types[i];
          if (type.supertype != kNoSuperType) {
            section.emit_u8(type.is_final ? kWasmSubtypeFinalForm
                                          : kWasmSubtypeForm);
            section.emit_u8(1);  // supertype count
            section.emit_u32v(type.supertype);
          } else if (!type.is_final) {
            section.emit_u8(kWasmSubtypeForm);
            section.emit_u8(0);  // no supertypes
          }
          if (type instanceof WasmStruct) {
            section.emit_u8(kWasmStructTypeForm);
            section.emit_u32v(type.fields.length);
            for (let field of type.fields) {
              section.emit_type(field.type);
              section.emit_u8(field.mutability ? 1 : 0);
            }
          } else if (type instanceof WasmArray) {
            section.emit_u8(kWasmArrayTypeForm);
            section.emit_type(type.type);
            section.emit_u8(type.mutability ? 1 : 0);
          } else {
            section.emit_u8(kWasmFunctionTypeForm);
            section.emit_u32v(type.params.length);
            for (let param of type.params) {
              section.emit_type(param);
            }
            section.emit_u32v(type.results.length);
            for (let result of type.results) {
              section.emit_type(result);
            }
          }
        }
      });
    }

    // Add imports section.
    if (wasm.imports.length > 0) {
      if (debug) print('emitting imports @ ' + binary.length);
      binary.emit_section(kImportSectionCode, section => {
        section.emit_u32v(wasm.imports.length);
        for (let imp of wasm.imports) {
          section.emit_string(imp.module);
          section.emit_string(imp.name || '');
          section.emit_u8(imp.kind);
          if (imp.kind == kExternalFunction) {
            section.emit_u32v(imp.type_index);
          } else if (imp.kind == kExternalGlobal) {
            section.emit_type(imp.type);
            section.emit_u8(imp.mutable);
          } else if (imp.kind == kExternalMemory) {
            const has_max = imp.maximum !== undefined;
            const is_shared = !!imp.shared;
            const is_memory64 = !!imp.is_memory64;
            let limits_byte =
                (is_memory64 ? 4 : 0) | (is_shared ? 2 : 0) | (has_max ? 1 : 0);
            section.emit_u8(limits_byte);
            let emit = val =>
                is_memory64 ? section.emit_u64v(val) : section.emit_u32v(val);
            emit(imp.initial);
            if (has_max) emit(imp.maximum);
          } else if (imp.kind == kExternalTable) {
            section.emit_type(imp.type);
            var has_max = (typeof imp.maximum) != 'undefined';
            section.emit_u8(has_max ? 1 : 0);             // flags
            section.emit_u32v(imp.initial);               // initial
            if (has_max) section.emit_u32v(imp.maximum);  // maximum
          } else if (imp.kind == kExternalTag) {
            section.emit_u32v(kExceptionAttribute);
            section.emit_u32v(imp.type_index);
          } else {
            throw new Error('unknown/unsupported import kind ' + imp.kind);
          }
        }
      });
    }

    // Add functions declarations
    if (wasm.functions.length > 0) {
      if (debug) print('emitting function decls @ ' + binary.length);
      binary.emit_section(kFunctionSectionCode, section => {
        section.emit_u32v(wasm.functions.length);
        for (let func of wasm.functions) {
          section.emit_u32v(func.type_index);
        }
      });
    }

    // Add table section
    if (wasm.tables.length > 0) {
      if (debug) print('emitting tables @ ' + binary.length);
      binary.emit_section(kTableSectionCode, section => {
        section.emit_u32v(wasm.tables.length);
        for (let table of wasm.tables) {
          if (table.has_init) {
            section.emit_u8(0x40);  // "has initializer"
            section.emit_u8(0x00);  // Reserved byte.
          }
          section.emit_type(table.type);
          section.emit_u8(table.has_max);
          section.emit_u32v(table.initial_size);
          if (table.has_max) section.emit_u32v(table.max_size);
          if (table.has_init) section.emit_init_expr(table.init_expr);
        }
      });
    }

    // Add memory section
    if (wasm.memory !== undefined) {
      if (debug) print('emitting memory @ ' + binary.length);
      binary.emit_section(kMemorySectionCode, section => {
        section.emit_u8(1);  // one memory entry
        const has_max = wasm.memory.max !== undefined;
        const is_shared = !!wasm.memory.shared;
        const is_memory64 = !!wasm.memory.is_memory64;
        let limits_byte =
            (is_memory64 ? 4 : 0) | (is_shared ? 2 : 0) | (has_max ? 1 : 0);
        section.emit_u8(limits_byte);
        let emit = val =>
            is_memory64 ? section.emit_u64v(val) : section.emit_u32v(val);
        emit(wasm.memory.min);
        if (has_max) emit(wasm.memory.max);
      });
    }

    // Add tag section.
    if (wasm.tags.length > 0) {
      if (debug) print('emitting tags @ ' + binary.length);
      binary.emit_section(kTagSectionCode, section => {
        section.emit_u32v(wasm.tags.length);
        for (let type_index of wasm.tags) {
          section.emit_u32v(kExceptionAttribute);
          section.emit_u32v(type_index);
        }
      });
    }

    // Add stringref section.
    if (wasm.stringrefs.length > 0) {
      if (debug) print('emitting stringrefs @ ' + binary.length);
      binary.emit_section(kStringRefSectionCode, section => {
        section.emit_u32v(0);
        section.emit_u32v(wasm.stringrefs.length);
        for (let str of wasm.stringrefs) {
          section.emit_string(str);
        }
      });
    }

    // Add global section.
    if (wasm.globals.length > 0) {
      if (debug) print('emitting globals @ ' + binary.length);
      binary.emit_section(kGlobalSectionCode, section => {
        section.emit_u32v(wasm.globals.length);
        for (let global of wasm.globals) {
          section.emit_type(global.type);
          section.emit_u8(global.mutable);
          section.emit_init_expr(global.init);
        }
      });
    }

    // Add export table.
    var mem_export = (wasm.memory !== undefined && wasm.memory.exported);
    var exports_count = wasm.exports.length + (mem_export ? 1 : 0);
    if (exports_count > 0) {
      if (debug) print('emitting exports @ ' + binary.length);
      binary.emit_section(kExportSectionCode, section => {
        section.emit_u32v(exports_count);
        for (let exp of wasm.exports) {
          section.emit_string(exp.name);
          section.emit_u8(exp.kind);
          section.emit_u32v(exp.index);
        }
        if (mem_export) {
          section.emit_string('memory');
          section.emit_u8(kExternalMemory);
          section.emit_u8(0);
        }
      });
    }

    // Add start function section.
    if (wasm.start_index !== undefined) {
      if (debug) print('emitting start function @ ' + binary.length);
      binary.emit_section(kStartSectionCode, section => {
        section.emit_u32v(wasm.start_index);
      });
    }

    // Add element segments
    if (wasm.element_segments.length > 0) {
      if (debug) print('emitting element segments @ ' + binary.length);
      binary.emit_section(kElementSectionCode, section => {
        var segments = wasm.element_segments;
        section.emit_u32v(segments.length);

        for (let segment of segments) {
          // Emit flag and header.
          // Each case below corresponds to a flag from
          // https://webassembly.github.io/spec/core/binary/modules.html#element-section
          // (not in increasing order).
          if (segment.is_active()) {
            if (segment.table == 0 && segment.type === undefined) {
              if (segment.expressions_as_elements()) {
                section.emit_u8(0x04);
                section.emit_init_expr(segment.offset);
              } else {
                section.emit_u8(0x00)
                section.emit_init_expr(segment.offset);
              }
            } else {
              if (segment.expressions_as_elements()) {
                section.emit_u8(0x06);
                section.emit_u32v(segment.table);
                section.emit_init_expr(segment.offset);
                section.emit_type(segment.type);
              } else {
                section.emit_u8(0x02);
                section.emit_u32v(segment.table);
                section.emit_init_expr(segment.offset);
                section.emit_u8(kExternalFunction);
              }
            }
          } else {
            if (segment.expressions_as_elements()) {
              if (segment.is_passive()) {
                section.emit_u8(0x05);
              } else {
                section.emit_u8(0x07);
              }
              section.emit_type(segment.type);
            } else {
              if (segment.is_passive()) {
                section.emit_u8(0x01);
              } else {
                section.emit_u8(0x03);
              }
              section.emit_u8(kExternalFunction);
            }
          }

          // Emit elements.
          section.emit_u32v(segment.elements.length);
          for (let element of segment.elements) {
            if (segment.expressions_as_elements()) {
              section.emit_init_expr(element);
            } else {
              section.emit_u32v(element);
            }
          }
        }
      })
    }

    // If there are any passive data segments, add the DataCount section.
    if (wasm.data_segments.some(seg => !seg.is_active)) {
      binary.emit_section(kDataCountSectionCode, section => {
        section.emit_u32v(wasm.data_segments.length);
      });
    }

    // If there are compilation hints add a custom section 'compilationHints'
    // after the function section and before the code section.
    if (wasm.compilation_hints.length > 0) {
      if (debug) print('emitting compilation hints @ ' + binary.length);
      // Build custom section payload.
      let payloadBinary = new Binary();
      let implicit_compilation_hints_count = wasm.functions.length;
      payloadBinary.emit_u32v(implicit_compilation_hints_count);

      // Defaults to the compiler's choice if no better hint was given (0x00).
      let defaultHintByte = kCompilationHintStrategyDefault |
          (kCompilationHintTierDefault << 2) |
          (kCompilationHintTierDefault << 4);

      // Emit hint byte for every function defined in this module.
      for (let i = 0; i < implicit_compilation_hints_count; i++) {
        let index = wasm.num_imported_funcs + i;
        var hintByte;
        if (index in wasm.compilation_hints) {
          let hint = wasm.compilation_hints[index];
          hintByte =
              hint.strategy | (hint.baselineTier << 2) | (hint.topTier << 4);
        } else {
          hintByte = defaultHintByte;
        }
        payloadBinary.emit_u8(hintByte);
      }

      // Finalize as custom section.
      let name = 'compilationHints';
      let bytes = this.createCustomSection(name, payloadBinary.trunc_buffer());
      binary.emit_bytes(bytes);
    }

    // Add function bodies.
    if (wasm.functions.length > 0) {
      // emit function bodies
      if (debug) print('emitting code @ ' + binary.length);
      let section_length = 0;
      binary.emit_section(kCodeSectionCode, section => {
        section.emit_u32v(wasm.functions.length);
        let header;
        for (let func of wasm.functions) {
          if (func.locals.length == 0) {
            // Fast path for functions without locals.
            section.emit_u32v(func.body.length + 1);
            section.emit_u8(0);  // 0 locals.
          } else {
            // Build the locals declarations in separate buffer first.
            if (!header) header = new Binary;
            header.reset();
            header.emit_u32v(func.locals.length);
            for (let decl of func.locals) {
              header.emit_u32v(decl.count);
              header.emit_type(decl.type);
            }
            section.emit_u32v(header.length + func.body.length);
            section.emit_bytes(header.trunc_buffer());
          }
          // Set to section offset for now, will update.
          func.body_offset = section.length;
          section.emit_bytes(func.body);
        }
        section_length = section.length;
      });
      for (let func of wasm.functions) {
        func.body_offset += binary.length - section_length;
      }
    }

    // Add data segments.
    if (wasm.data_segments.length > 0) {
      if (debug) print('emitting data segments @ ' + binary.length);
      binary.emit_section(kDataSectionCode, section => {
        section.emit_u32v(wasm.data_segments.length);
        for (let seg of wasm.data_segments) {
          if (seg.is_active) {
            section.emit_u8(0);  // linear memory index 0 / flags
            if (seg.is_global) {
              // Initializer is a global variable.
              section.emit_u8(kExprGlobalGet);
              section.emit_u32v(seg.addr);
            } else {
              // Initializer is a constant.
              section.emit_bytes(wasmI32Const(seg.addr));
            }
            section.emit_u8(kExprEnd);
          } else {
            section.emit_u8(kPassive);  // flags
          }
          section.emit_u32v(seg.data.length);
          section.emit_bytes(seg.data);
        }
      });
    }

    // Add any explicitly added sections.
    for (let exp of wasm.explicit) {
      if (debug) print('emitting explicit @ ' + binary.length);
      binary.emit_bytes(exp);
    }

    // Add names.
    let num_function_names = 0;
    let num_functions_with_local_names = 0;
    for (let func of wasm.functions) {
      if (func.name !== undefined) ++num_function_names;
      if (func.numLocalNames() > 0) ++num_functions_with_local_names;
    }
    if (num_function_names > 0 || num_functions_with_local_names > 0 ||
        wasm.name !== undefined) {
      if (debug) print('emitting names @ ' + binary.length);
      binary.emit_section(kUnknownSectionCode, section => {
        section.emit_string('name');
        // Emit module name.
        if (wasm.name !== undefined) {
          section.emit_section(kModuleNameCode, name_section => {
            name_section.emit_string(wasm.name);
          });
        }
        // Emit function names.
        if (num_function_names > 0) {
          section.emit_section(kFunctionNamesCode, name_section => {
            name_section.emit_u32v(num_function_names);
            for (let func of wasm.functions) {
              if (func.name === undefined) continue;
              name_section.emit_u32v(func.index);
              name_section.emit_string(func.name);
            }
          });
        }
        // Emit local names.
        if (num_functions_with_local_names > 0) {
          section.emit_section(kLocalNamesCode, name_section => {
            name_section.emit_u32v(num_functions_with_local_names);
            for (let func of wasm.functions) {
              if (func.numLocalNames() == 0) continue;
              name_section.emit_u32v(func.index);
              name_section.emit_u32v(func.numLocalNames());
              let name_index = 0;
              for (let i = 0; i < func.local_names.length; ++i) {
                if (typeof func.local_names[i] == 'string') {
                  name_section.emit_u32v(name_index);
                  name_section.emit_string(func.local_names[i]);
                  name_index++;
                } else {
                  name_index += func.local_names[i];
                }
              }
            }
          });
        }
      });
    }

    return binary.trunc_buffer();
  }

  toArray(debug = false) {
    return Array.from(this.toBuffer(debug));
  }

  instantiate(ffi) {
    let module = this.toModule();
    let instance = new WebAssembly.Instance(module, ffi);
    return instance;
  }

  asyncInstantiate(ffi) {
    return WebAssembly.instantiate(this.toBuffer(), ffi)
        .then(({module, instance}) => instance);
  }

  toModule(debug = false) {
    return new WebAssembly.Module(this.toBuffer(debug));
  }
}

function wasmSignedLeb(val, max_len = 5) {
  if (val == null) throw new Error("Leb value many not be null/undefined");
  let res = [];
  for (let i = 0; i < max_len; ++i) {
    let v = val & 0x7f;
    // If {v} sign-extended from 7 to 32 bits is equal to val, we are done.
    if (((v << 25) >> 25) == val) {
      res.push(v);
      return res;
    }
    res.push(v | 0x80);
    val = val >> 7;
  }
  throw new Error(
      'Leb value <' + val + '> exceeds maximum length of ' + max_len);
}

function wasmSignedLeb64(val, max_len = 10) {
  if (val == null) throw new Error("Leb value many not be null/undefined");
  if (typeof val != "bigint") {
    if (val < Math.pow(2, 31)) {
      return wasmSignedLeb(val, max_len);
    }
    val = BigInt(val);
  }
  let res = [];
  for (let i = 0; i < max_len; ++i) {
    let v = val & 0x7fn;
    // If {v} sign-extended from 7 to 32 bits is equal to val, we are done.
    if (((v << 25n) >> 25n) == val) {
      res.push(Number(v));
      return res;
    }
    res.push(Number(v) | 0x80);
    val = val >> 7n;
  }
  throw new Error(
      'Leb value <' + val + '> exceeds maximum length of ' + max_len);
}

function wasmUnsignedLeb(val, max_len = 5) {
  if (val == null) throw new Error("Leb value many not be null/undefined");
  let res = [];
  for (let i = 0; i < max_len; ++i) {
    let v = val & 0x7f;
    if (v == val) {
      res.push(v);
      return res;
    }
    res.push(v | 0x80);
    val = val >>> 7;
  }
  throw new Error(
      'Leb value <' + val + '> exceeds maximum length of ' + max_len);
}

function wasmI32Const(val) {
  return [kExprI32Const, ...wasmSignedLeb(val, 5)];
}

// Note: Since {val} is a JS number, the generated constant only has 53 bits of
// precision.
function wasmI64Const(val) {
  return [kExprI64Const, ...wasmSignedLeb64(val, 10)];
}

function wasmF32Const(f) {
  // Write in little-endian order at offset 0.
  data_view.setFloat32(0, f, true);
  return [
    kExprF32Const, byte_view[0], byte_view[1], byte_view[2], byte_view[3]
  ];
}

function wasmF64Const(f) {
  // Write in little-endian order at offset 0.
  data_view.setFloat64(0, f, true);
  return [
    kExprF64Const, byte_view[0], byte_view[1], byte_view[2], byte_view[3],
    byte_view[4], byte_view[5], byte_view[6], byte_view[7]
  ];
}

function wasmS128Const(f) {
  // Write in little-endian order at offset 0.
  if (Array.isArray(f)) {
    if (f.length != 16) throw new Error('S128Const needs 16 bytes');
    return [kSimdPrefix, kExprS128Const, ...f];
  }
  let result = [kSimdPrefix, kExprS128Const];
  if (arguments.length === 2) {
    for (let j = 0; j < 2; j++) {
      data_view.setFloat64(0, arguments[j], true);
      for (let i = 0; i < 8; i++) result.push(byte_view[i]);
    }
  } else if (arguments.length === 4) {
    for (let j = 0; j < 4; j++) {
      data_view.setFloat32(0, arguments[j], true);
      for (let i = 0; i < 4; i++) result.push(byte_view[i]);
    }
  } else {
    throw new Error('S128Const needs an array of bytes, or two f64 values, ' +
                    'or four f32 values');
  }
  return result;
}

let [wasmBrOnCast, wasmBrOnCastFail] = (function() {
  return [
    (labelIdx, sourceType, targetType) =>
      wasmBrOnCastImpl(labelIdx, sourceType, targetType, false),
      (labelIdx, sourceType, targetType) =>
      wasmBrOnCastImpl(labelIdx, sourceType, targetType, true),
  ];
  function wasmBrOnCastImpl(labelIdx, sourceType, targetType, brOnFail) {
    labelIdx = wasmUnsignedLeb(labelIdx, kMaxVarInt32Size);
    let srcHeap = wasmSignedLeb(sourceType.heap_type, kMaxVarInt32Size);
    let tgtHeap = wasmSignedLeb(targetType.heap_type, kMaxVarInt32Size);
    let srcIsNullable = sourceType.opcode == kWasmRefNull;
    let tgtIsNullable = targetType.opcode == kWasmRefNull;
    flags = (tgtIsNullable << 1) + srcIsNullable;
    return [
      kGCPrefix, brOnFail ? kExprBrOnCastFailGeneric : kExprBrOnCastGeneric,
      flags, ...labelIdx, ...srcHeap, ...tgtHeap];
  }
})();

function getOpcodeName(opcode) {
  return globalThis.kWasmOpcodeNames?.[opcode] ?? 'unknown';
}
