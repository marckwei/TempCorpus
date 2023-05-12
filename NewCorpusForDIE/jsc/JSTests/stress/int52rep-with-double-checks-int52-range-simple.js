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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var doubleArray = [3, 1, 2, 3, 4, 5.5];
doubleArray[0] = 3; // Break CoW.

function test(array)
{
    return fiatInt52(array[0]);
}
noInline(test);

for (var i = 0; i < 1e7; ++i)
    shouldBe(test(doubleArray), 3);
doubleArray[0] = 0x7ffffffffffff;
shouldBe(test(doubleArray), 0x7ffffffffffff);
doubleArray[0] = 0x8000000000000;
shouldBe(test(doubleArray), 0x8000000000000);
doubleArray[0] = -0x8000000000000;
shouldBe(test(doubleArray), -0x8000000000000);
doubleArray[0] = -0x8000000000001;
shouldBe(test(doubleArray), -0x8000000000001);
doubleArray[0] = 1.3;
shouldBe(test(doubleArray), 1.3);
doubleArray[0] = Number.NaN;
shouldBe(Number.isNaN(test(doubleArray)), true);
doubleArray[0] = Number.POSITIVE_INFINITY;
shouldBe(test(doubleArray), Number.POSITIVE_INFINITY);
doubleArray[0] = Number.NEGATIVE_INFINITY;
shouldBe(test(doubleArray), Number.NEGATIVE_INFINITY);

doubleArray[0] = 3;
shouldBe(test(doubleArray), 3);
