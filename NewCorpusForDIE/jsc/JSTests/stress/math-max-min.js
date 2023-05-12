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

//@ runDefault("--useConcurrentJIT=false")

let operands = [
    0,
    -0,
    1,
    -1,
    42,
    -42,
    -Number.EPSILON,
    Number.EPSILON,
    -Number.MIN_VALUE,
    Number.MIN_VALUE,
    -Number.MAX_VALUE,
    Number.MAX_VALUE,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NaN,
];

function isNegativeZero(x) {
    if (x != 0)
        return false;
    return (1/x == Number.NEGATIVE_INFINITY);
}

let expectedMaxResults = [];
for (i in operands) {
    expectedMaxResults[i] = [];
    for (j in operands) {
        let x = operands[i];
        let y = operands[j];
        let result;
        if (Number.isNaN(x) || Number.isNaN(y))
            result = Number.NaN;
        else if (x == y)
            result = isNegativeZero(x) ? y : x;
        else 
            result = (x > y) ? x : y;
        expectedMaxResults[i][j] = result;
    }
}

let expectedMinResults = [];
for (i in operands) {
    expectedMinResults[i] = [];
    for (j in operands) {
        let x = operands[i];
        let y = operands[j];
        let result;
        if (Number.isNaN(x) || Number.isNaN(y))
            result = Number.NaN;
        else if (x == y)
            result = isNegativeZero(x) ? x : y;
        else 
            result = (x < y) ? x : y;
        expectedMinResults[i][j] = result;
    }
}

function numberAsString(x) {
    if (x == 0 && isNegativeZero(x))
        return "-0";
    return x;
}

function testMax(x, y) {
    return Math.max(x, y);
}
noInline(testMax);

function testMin(x, y) {
    return Math.min(x, y);
}
noInline(testMin);

let numberOfFailures = 0;

function assertEq(label, x, y, expected, actual) {
    if (Number.isNaN(expected) && Number.isNaN(actual))
        return;

    if ((actual == expected) && (actual == 0)) {
        if (isNegativeZero(expected) != isNegativeZero(actual)) {
            print("FAIL " + label + ": comparing " + numberAsString(x) + " and " + numberAsString(y) + ": expected: " + numberAsString(expected) + " actual: " + numberAsString(actual));
            numberOfFailures++;
            return;
        }
    }

    if (expected !== actual) {
        print("FAIL " + label + ": comparing " + numberAsString(x) + " and " + numberAsString(y) + ": expected: " + numberAsString(expected) + " actual: " + numberAsString(actual));
        numberOfFailures++;
        return;
    }
}

for (var iteration = 0; iteration < 1000; ++iteration) {
    for (i in operands) {
        for (j in operands) {
            let x = operands[i];
            let y = operands[j];

            let maxResult = testMax(x, y);
            let expectedMaxResult = expectedMaxResults[i][j];
            assertEq("Math.max", x, y, expectedMaxResult, maxResult);

            let minResult = testMin(x, y);
            let expectedMinResult = expectedMinResults[i][j];
            assertEq("Math.min", x, y, expectedMinResult, minResult);
        }
    }
}

if (numberOfFailures > 0)
    throw "FAILED";
