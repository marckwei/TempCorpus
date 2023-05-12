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

function assert(input, expected) {
    if (input !== expected)
        throw new Error("Bad!");
}

assert(-1n + "", "-1");
assert("" + -1n, "-1");
assert(0n + "", "0");
assert("" + 0n, "0");
assert(1n + "", "1");
assert("" + 1n, "1");
assert(123456789000000000000000n + "", "123456789000000000000000");
assert("" + 123456789000000000000000n, "123456789000000000000000");
assert(-123456789000000000000000n + "", "-123456789000000000000000");
assert("" + -123456789000000000000000n, "-123456789000000000000000");

assert([] + -123456789000000000000000n, "-123456789000000000000000");
assert(-123456789000000000000000n + [], "-123456789000000000000000");

let a = {};
assert(a + 3n, "[object Object]3");
assert(3n + a, "3[object Object]");

