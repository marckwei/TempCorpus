function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
}

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

// This test module provides infrastructure for generating and running tests on a unary
// operator.
//
// It works by generating test functions to exercise the specified operator on operand
// values in a provided set. For each test, it computes the expected result by exercising
// the test function once (using the LLINT) at test generation time.
// The test runner later compares the result produced by the function (as it tiers up)
// against the expected result.
//
// The generated tests will exercise the operator on a variable.
//
// If all goes well, this test module will terminate silently. If not, it will print
// errors.

//============================================================================
// Debugging options:

var verbose = false;
var abortOnFirstFail = false;
var testFilterStr = undefined; // Define a filter string to filter tests to run.

var verboseTestGeneration = false;

//============================================================================
// Test generation:

function stringifyIfNeeded(x) {
    if (typeof x == "string")
        return '"' + x + '"';
    if (typeof x == "object")
        return 'objWithVal:' + x;
    return x;
}

// operatorTypes can be "Prefix" or "Postfix".
// resultTypes can be "ImmediateResult" or "PostResult". PostResult is mainly for
// checking the value of a variable on subsequent inspection, so we can confirm that the
// postfix operator did do its job.
var funcIndex = 0;
function generateBinaryTests(tests, opName, operatorType, resultType, op, inValues) {
    var funcNamePrefix = opName + resultType;
    for (var i = 0; i < inValues.length; i++) {
        var test = { };
        xStr = inValues[i];
        test.x = eval(xStr);

        var funcName = funcNamePrefix + funcIndex++;
        if (operatorType == "Prefix") {
            if (resultType == "ImmediateResult")
                test.signature = funcName + "(x) { return " + op + "x }";
            else if (resultType == "PostResult")
                test.signature = funcName + "(x) { " + op + "x; return x; }";
        } else if (operatorType == "Postfix") {
            if (resultType == "ImmediateResult")
                test.signature = funcName + "(x) { return x" + op + " }";
            else if (resultType == "PostResult")
                test.signature = funcName + "(x) { x" + op + "; return x; }";
        }

        test.name = test.signature + " with x:" + xStr;

        test.func = eval("(function " + test.signature + ")");
        noInline(test.func);

        test.expectedResult = test.func(test.x);
        test.name += ", expected:" + stringifyIfNeeded(test.expectedResult);

        tests.push(test);
        if (verboseTestGeneration)
            print("Generated " + test.name);
    }
}

//============================================================================
// Test running and reporting:

var errorReport = "";

function isIdentical(x, y) {
    if (typeof x == "undefined" && typeof y == "undefined")
        return true;
    if (typeof x != typeof y)
        return false;
    if (x == y) {
        if (x)
            return true;
        // Distinguish between 0 and negative 0.
        if (1 / x == 1 / y)
            return true;
    } else if (Number.isNaN(x) && Number.isNaN(y))
        return true;
    return false;
}

function runTest(test) {
    if (testFilterStr && !test.name.includes(testFilterStr))
        return;

    var firstFailed = -1;
    try {
        if (verbose)
            print(test.name);
        for (var i = 0; i < 10000; i++) {
            var result = test.func(test.x);
            if (isIdentical(result, test.expectedResult))
                continue;
            if (firstFailed < 0) {
                errorReport += "FAILED: " + test.name + " started failing on iteration " + i
                    + ": actual " + stringifyIfNeeded(result) + "\n";
                if (abortOnFirstFail)
                    throw errorReport;
                firstFailed = i;
            }
        }
    } catch(e) {
        if (abortOnFirstFail)
            throw e; // Negate the catch by re-throwing.
        errorReport += "FAILED: Unexpected exception: " + e + "\n";
    }
}

function run() {
    if (verbose)
        print("Start testing");

    for (var test of tests)
        runTest(test);

    if (errorReport !== "")
        throw "Found failures:\n" + errorReport;

    if (verbose)
        print("Done testing");
}
