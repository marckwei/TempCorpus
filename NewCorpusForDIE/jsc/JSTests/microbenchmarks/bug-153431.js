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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
//@ runNoFTL

// Regression test for https://bugs.webkit.org/show_bug.cgi?id=153431.
// Reduced version based on the reproduction case provided by Ryan Sturgell in the bug,
// with some variable renames to read slightly better.

function assert(testedValue) {
    if (!testedValue)
        throw Error("Failed assertion");
}

function badFunc(arr, operand, resultArr) { 
    // This re-use of variable "operand" is important - rename it and the bug goes away.
    operand = arr[operand];
    if (false) {
        // If this unreachable block is removed, the bug goes away!!
    } else 
    {
        resultArr[0] = operand;
    }
}
noInline(badFunc);

function run() {
    for (var i = 0; i < 10000; i++) {
        var arr = new Uint32Array([0x80000000,1]); // Needs to be an Uint32Array.
        var resultArr = [];

        badFunc(arr, 0, resultArr);
        assert(resultArr[0] == arr[0]);
        badFunc(arr, 1, resultArr);
        assert(resultArr[0] == arr[1]);
    }
}

run();
