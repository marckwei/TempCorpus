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
        throw new Error('bad value: ' + actual + " " + expected);
}
shouldBe(new Intl.NumberFormat("en", { minimumFractionDigits: 3, maximumFractionDigits: 3, roundingIncrement: 10 }).format(55555555555.555555), `55,555,555,555.560`);
shouldBe(new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2, roundingIncrement: 100 }).format(55555555555.555555), `55,555,555,556.00`);
shouldBe(new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 4, roundingIncrement: 1000 }).format(55555555555.555555), `55,555,555,555.6000`);
shouldBe(new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2, roundingIncrement: 1000 }).format(55555555555.555555), `55,555,555,560.00`);
shouldBe(new Intl.NumberFormat("en", { minimumFractionDigits: 1, maximumFractionDigits: 1, roundingIncrement: 1000 }).format(55555555555.555555), `55,555,555,600.0`);
