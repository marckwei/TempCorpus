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

var numberCount = 0;
var stringCount = 0;
var booleanCount = 0;
var symbolCount = 0;
var bigIntCount = 0;
var spy;

spy = new Proxy({}, { set: function() { numberCount += 1; return true; } });
Object.setPrototypeOf(Number.prototype, spy);
0..property = null;
shouldBe(numberCount, 1);

spy = new Proxy({}, { set: function() { stringCount += 1; return true; } });
Object.setPrototypeOf(String.prototype, spy);
"".property = null;
shouldBe(stringCount, 1);

spy = new Proxy({}, { set: function() { booleanCount += 1; return true; } });
Object.setPrototypeOf(Boolean.prototype, spy);
true.property = null;
shouldBe(booleanCount, 1);

spy = new Proxy({}, { set: function() { symbolCount += 1; return true; } });
Object.setPrototypeOf(Symbol.prototype, spy);
Symbol().property = null;
shouldBe(symbolCount, 1);


spy = new Proxy({}, { set: function() { bigIntCount += 1; return true; } });
Object.setPrototypeOf(BigInt.prototype, spy);
(1n).property = null;
shouldBe(bigIntCount, 1);
