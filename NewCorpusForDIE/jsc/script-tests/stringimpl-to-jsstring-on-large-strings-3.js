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

//@ skip if $memoryLimited

"use strict"

// This test passes if it does not crash.
function createStrings() {
    let a = "a".repeat(0x7fffffff);
    if (a.length !== 0x7fffffff)
        debug("Failed to create a string of length 0x7ffffffff");

    a = "a".repeat(0x80000000);
    if (a.length !== 0x80000000)
        debug("Failed to create a string of length 0x80000000");

    a = "a".repeat(0x7fffffff - 2);
    if (a.length != 0x7fffffff - 2)
        debug("Failed to create a string of length 0x7fffffff - 2");

    let b = [a, 'b'];
    let c = b.toString();
    if (b.length !== 0x7ffffffff)
        debug("Failed to join a string of length 0x7ffffffff");

    a = "a".repeat(0x7fffffff - 1);
    if (a.length != 0x7fffffff - 1)
        debug("Failed to create a string of length 0x7fffffff - 1");

    b = [a, 'b'];
    c = b.toString();
    if (b.length !== 0x80000000)
        debug("Failed to join a string of length 0x80000000");
    return [a, b, c];
}
try {
    createStrings();
} catch (e) { }

debug("PASS: the test did not crash")

