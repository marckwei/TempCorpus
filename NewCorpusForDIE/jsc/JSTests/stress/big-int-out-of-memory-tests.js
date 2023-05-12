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

//@ runDefault("--useDFGJIT=false")

function assert(a, message) {
    if (!a)
        throw new Error(message);
}

let a = (1n << 1048575n) - 1n;
a = (a << 1n) | 1n;

try {
    let b = a + 1n;
    assert(false, "Should throw OutOfMemoryError, but executed without exception");
} catch(e) {
    assert(e.message == "Out of memory: BigInt generated from this operation is too big", "Expected OutOfMemoryError, but got: " + e);
}

try {
    let b = a - (-1n);
    assert(false, "Should throw OutOfMemoryError, but executed without exception");
} catch(e) {
    assert(e.message == "Out of memory: BigInt generated from this operation is too big", "Expected OutOfMemoryError, but got: " + e);
}

try {
    let b = a * (-1n);
    assert(false, "Should throw OutOfMemoryError, but executed without exception");
} catch(e) {
    assert(e.message == "Out of memory: BigInt generated from this operation is too big", "Expected OutOfMemoryError, but got: " + e);
}

try {
    let b = a / a;
    assert(false, "Should throw OutOfMemoryError, but executed without exception");
} catch(e) {
    assert(e.message == "Out of memory: BigInt generated from this operation is too big", "Expected OutOfMemoryError, but got: " + e);
}

try {
    let b = -a & -1n;
    assert(false, "Should throw OutOfMemoryError, but executed without exception");
} catch(e) {
    assert(e.message == "Out of memory: BigInt generated from this operation is too big", "Expected OutOfMemoryError, but got: " + e);
}

try {
    let b = a ^ -1n;
    assert(false, "Should throw OutOfMemoryError, but executed without exception");
} catch(e) {
    assert(e.message == "Out of memory: BigInt generated from this operation is too big", "Expected OutOfMemoryError, but got: " + e);
}

