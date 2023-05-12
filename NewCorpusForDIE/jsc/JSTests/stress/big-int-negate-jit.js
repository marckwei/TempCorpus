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

//@ skip if not $jitTests
//@ runDefault("--useConcurrentJIT=0")

function assert(a, b) {
    if (a !== b)
        throw new Error("Bad!");
}

function negateBigInt(n) {
    return -n;
}
noInline(negateBigInt);

for (let i = 0; i < 100000; i++) {
    assert(negateBigInt(100n), -100n);
    assert(negateBigInt(-0x1fffffffffffff01n), 0x1fffffffffffff01n);
}

if (numberOfDFGCompiles(negateBigInt) > 1)
    throw "Failed negateBigInt(). We should have compiled a single negate for the BigInt type.";

function negateBigIntSpecializedToInt(n) {
    return -n;
}
noInline(negateBigIntSpecializedToInt);

for (let i = 0; i < 100000; i++) {
    negateBigIntSpecializedToInt(100);
}

assert(negateBigIntSpecializedToInt(100n), -100n);

// Testing case mixing int and BigInt speculations
function mixedSpeculationNegateBigInt(n, arr) {
    return -(-(-n));
}
noInline(mixedSpeculationNegateBigInt);

for (let i = 0; i < 100000; i++) {
    if (i % 2)
        assert(mixedSpeculationNegateBigInt(100), -100);
    else
        assert(mixedSpeculationNegateBigInt(-0x1fffffffffffff01n), 0x1fffffffffffff01n);
}

if (numberOfDFGCompiles(mixedSpeculationNegateBigInt) > 1)
    throw "Failed mixedSpeculationNegateBigInt(). We should have compiled a single negate for the BigInt type.";

