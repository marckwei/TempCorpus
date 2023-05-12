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
'Test for regular expressions with non-character values in them, specifically in character classes.'
);

shouldBe('"F".match(/[\\uD7FF]/)', 'null');
shouldBe('"0".match(/[\\uD800]/)', 'null');
shouldBe('"F".match(/[\\uDFFF]/)', 'null');
shouldBe('"E".match(/[\\uE000]/)', 'null');
shouldBe('"y".match(/[\\uFDBF]/)', 'null');
shouldBe('"y".match(/[\\uFDD0]/)', 'null');
shouldBe('"y".match(/[\\uFDEF]/)', 'null');
shouldBe('"y".match(/[\\uFDF0]/)', 'null');
shouldBe('"y".match(/[\\uFEFF]/)', 'null');
shouldBe('"y".match(/[\\uFEFF]/)', 'null');
shouldBe('"y".match(/[\\uFFFE]/)', 'null');
shouldBe('"y".match(/[\\uFFFF]/)', 'null');
shouldBe('"y".match(/[\\u10FFFF]/)', 'null');
shouldBe('"y".match(/[\\u110000]/)', 'null');
