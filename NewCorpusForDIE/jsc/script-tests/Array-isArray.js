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

description("Test to ensure correct behaviour of Array.array");

shouldBeTrue("Array.isArray([])");
shouldBeTrue("Array.isArray(new Array)");
shouldBeTrue("Array.isArray(Array())");
shouldBeTrue("Array.isArray('abc'.match(/(a)*/g))");
shouldBeFalse("(function(){ return Array.isArray(arguments); })()");
shouldBeFalse("Array.isArray()");
shouldBeFalse("Array.isArray(null)");
shouldBeFalse("Array.isArray(undefined)");
shouldBeFalse("Array.isArray(true)");
shouldBeFalse("Array.isArray(false)");
shouldBeFalse("Array.isArray('a string')");
shouldBeFalse("Array.isArray({})");
shouldBeFalse("Array.isArray({length: 5})");
shouldBeFalse("Array.isArray({__proto__: Array.prototype, length:1, 0:1, 1:2})");
