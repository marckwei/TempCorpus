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

//@ skip if $hostOS == "windows"

// Verify that the dividend propagate the NeedsNegZero if the dividend requires it.
function moduloWithNegativeZeroDividend(a, b, c)
{
    var temp = a * b;
    return temp % c;
}
noInline(moduloWithNegativeZeroDividend);

// Warm up with integers. The test for NegZero should not be eliminated here.
for (var i = 1; i < 1e4; ++i) {
    var result = moduloWithNegativeZeroDividend(i, 5, 5);
    if (result !== 0)
        throw "moduloWithNegativeZeroDividend(i, 5, 5), returned: " + result;
}

for (var i = 1; i < 1e4; ++i) {
    // Produce negative zero in the multiplication.
    var result = moduloWithNegativeZeroDividend(-i, 0, 2);
    if (!(result === 0 && (1/result) === -Infinity))
        throw "moduloWithNegativeZeroDividend(-i, 0, 2) failed, returned: " + result;

    // A negative dividend can produce negative zero results.
    var result = moduloWithNegativeZeroDividend(-i, 5, 5);
    if (!(result === 0 && (1/result) === -Infinity))
        throw "moduloWithNegativeZeroDividend(-i, 5, 5) failed, returned: " + result;
}

// Edge cases.
for (var i = 1; i < 1e4; ++i) {
    var result = moduloWithNegativeZeroDividend(-i, 0, Infinity);
    if (!(result === 0 && (1/result) === -Infinity))
        throw "moduloWithNegativeZeroDividend(-i, 0, Infinity) failed, returned: " + result;

    var result = moduloWithNegativeZeroDividend(-i, 0, -Infinity);
    if (!(result === 0 && (1/result) === -Infinity))
        throw "moduloWithNegativeZeroDividend(-i, 0, -Infinity) failed, returned: " + result;

    var result = moduloWithNegativeZeroDividend(-i, 0, NaN);
    if (result === result)
        throw "moduloWithNegativeZeroDividend(-i, 0, NaN) failed, returned: " + result;
}


// In this case, the negative zero is irrelevant. The Neg Zero check can be eliminated.
function moduloWithUnusedNegativeZeroDividend(a, b, c)
{
    var temp = a * b;
    return (temp % c) | 0;
}
noInline(moduloWithUnusedNegativeZeroDividend);

for (var i = 1; i < 1e4; ++i) {
    var result = moduloWithUnusedNegativeZeroDividend(i, 5, 5);
    if (result !== 0)
        throw "moduloWithUnusedNegativeZeroDividend(i, 5, 5), returned: " + result;
}

// Produce negative zero in the multiplication.
for (var i = 1; i < 1e4; ++i) {
    var result = moduloWithUnusedNegativeZeroDividend(-i, 0, 2);
    if (!(result === 0 && (1/result) === Infinity))
        throw "moduloWithUnusedNegativeZeroDividend(-i, 0, 2) failed, returned: " + result;
}

for (var i = 1; i < 1e4; ++i) {
    var result = moduloWithUnusedNegativeZeroDividend(-i, 0, Infinity);
    if (!(result === 0 && (1/result) === Infinity))
        throw "moduloWithUnusedNegativeZeroDividend(-i, 0, Infinity) failed, returned: " + result;

    var result = moduloWithUnusedNegativeZeroDividend(-i, 0, -Infinity);
    if (!(result === 0 && (1/result) === Infinity))
        throw "moduloWithUnusedNegativeZeroDividend(-i, 0, -Infinity) failed, returned: " + result;

    var result = moduloWithUnusedNegativeZeroDividend(-i, 0, NaN);
    if (result !== 0)
        throw "moduloWithUnusedNegativeZeroDividend(-i, 0, NaN) failed, returned: " + result;
}


// The sign of the divisor is completely irrelevant. This should never fail on negative zero divisors.
function moduloWithNegativeZeroDivisor(a, b, c)
{
    var temp = a * b;
    return c % temp;
}
noInline(moduloWithNegativeZeroDivisor);

// Warm up with integers.
for (var i = 1; i < 1e4; ++i) {
    var result = moduloWithNegativeZeroDivisor(i, 2, i);
    if (result !== i)
        throw "moduloWithNegativeZeroDividend(i, 2, i), returned: " + result;

    var result = moduloWithNegativeZeroDivisor(-i, 2, i);
    if (result !== i)
        throw "moduloWithNegativeZeroDividend(-i, 2, i), returned: " + result;
}

// Produce negative zero in the multiplication.
for (var i = 1; i < 1e4; ++i) {
    var result = moduloWithNegativeZeroDivisor(-i, 0, 2);
    if (result === result)
        throw "moduloWithNegativeZeroDivisor(-i, 0, 2) failed, returned: " + result;
}