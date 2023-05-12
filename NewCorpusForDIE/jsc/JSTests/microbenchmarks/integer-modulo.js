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
// This tests that integer modulo is appropriately optimized

function myMod(a, b) {
    return a % b;
}

function myModByPos2(a) {
    return a % 2;
}

function myModByPos5(a) {
    return a % 5;
}

function myModByPos8(a) {
    return a % 8;
}

function myModByNeg1(a) {
    return a % -1;
}

function myModByNeg4(a) {
    return a % -4;
}

function myModByNeg81(a) {
    return a % -81;
}

var t = 10;
var v = 2;
var w = 4;
var x = 65535;
var y = -131071;
var z = 3;

var result = 0;

// Use a loop to ensure we cover all three tiers of optimization.
for (var i = 0; i < 2000; ++i) {
    result += myMod(x, t);
    result += myMod(y, t);
    result += myMod(x, z);
    result += myMod(y, z);
    result += myModByPos2(x);
    result += myModByPos2(y);
    result += myModByPos5(x);
    result += myModByPos5(y);
    result += myModByPos8(x);
    result += myModByPos8(y);
    result += myModByNeg1(x);
    result += myModByNeg1(y);
    result += myModByNeg4(x);
    result += myModByNeg4(y);
    result += myModByNeg81(x);
    result += myModByNeg81(y);

    if (i > 100) {
        v = x;
        w = y;
    }

    result += myMod(v, t);
    result += myMod(w, t);
    result += myModByPos2(v);
    result += myModByPos2(w);
    result += myModByPos5(v);
    result += myModByPos5(w);
    result += myModByPos8(v);
    result += myModByPos8(w);
    result += myModByNeg1(v);
    result += myModByNeg1(w);
    result += myModByNeg4(v);
    result += myModByNeg4(w);
    result += myModByNeg81(v);
    result += myModByNeg81(w);
}

if (result != -14970) {
    throw "Bad result: " + result;
}
