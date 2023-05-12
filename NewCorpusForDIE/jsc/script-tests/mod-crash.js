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

description(
"This test checks that n % 0 doesn't crash with a floating-point exception."
);

shouldBe("2 % 0", "NaN");

var n = 2;
shouldBe("n % 0", "NaN");

function f()
{
    return 2 % 0;
}

shouldBe("f()", "NaN");

function g()
{
    var n = 2;
    return n % 0;
}

shouldBe("g()", "NaN");

// Test that reusing a floating point value after use in a modulus works correctly.
function nonSpeculativeModReuseInner(argument, o1, o2)
{
 	// The + operator on objects is a reliable way to avoid the speculative JIT path for now at least.
    o1 + o2;

    var knownDouble = argument - 0;
    return knownDouble % 1 + knownDouble;
}
function nonSpeculativeModReuse(argument)
{
    return nonSpeculativeModReuseInner(argument, {}, {});
}

shouldBe("nonSpeculativeModReuse(0.5)", "1");
