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

function assert(x, y) {
    if (x != y)
        throw(" Expect: " + y + ", actual: " + x);
}

s1 = "";
for (var k = 0; k < 2000; ++k)
    s1 += "z";
var expectedLength = 2000;
assert(s1.length, 2000);

s2 = 'x';
expectedLength = 1;
assert(s2.length, expectedLength);

for (var i = 0; i < 22; ++i) {
    expectedLength += expectedLength;
    s2 += s2;
    assert(s2.length, expectedLength);
}

var caughtException;
try {
    expectedLength = ((s1.length - 1) * s2.length) + 1;
    result = Array.prototype.join.apply(s1, [s2]);
    assert(result.length, expectedLength);
} catch (e) {
    caughtException = e;
}

if (!caughtException)
    throw("Array.prototype.join should have thrown an exception when string length overflows");
assert(caughtException, "RangeError: Out of memory");
