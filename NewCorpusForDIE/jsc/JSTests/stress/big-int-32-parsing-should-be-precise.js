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

function assert(b) {
    if (!b)
        throw new Error;
}

function assertIsBigInt32(arg) {
    if (useBigInt32())
        assert(isBigInt32(arg));
    else
        assert(isHeapBigInt(arg));
}

assertIsBigInt32(2147483647n);
assertIsBigInt32(2147483646n);
assertIsBigInt32(2127483646n);
assertIsBigInt32(1127483646n);
assertIsBigInt32(-2147483648n);
assertIsBigInt32(-2147483647n);
assertIsBigInt32(-1147483647n);
assertIsBigInt32(0n);
assertIsBigInt32(1n);
assertIsBigInt32(-1n);
assertIsBigInt32(42n);

assert(isHeapBigInt(2147483648n));
assert(isHeapBigInt(-2147483649n));
assert(isHeapBigInt(3147483648n));
assert(isHeapBigInt(9147483648n));
assert(isHeapBigInt(-9147483649n));
assert(isHeapBigInt(-2147583649n));
