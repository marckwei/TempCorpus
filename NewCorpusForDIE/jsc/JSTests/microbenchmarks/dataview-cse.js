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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
"use strict";

function assert(b) {
    if (!b)
        throw new Error;
}

function test(dv, littleEndian) {
    return dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
    + dv.getInt32(0, littleEndian)
}
noInline(test);

let ab = new ArrayBuffer(4);
let dv = new DataView(ab);
dv.setInt32(0, 10, true);
for (let i = 0; i < 1000000; ++i) {
    let result = test(dv, true);
    assert(result === 10*10);
}
