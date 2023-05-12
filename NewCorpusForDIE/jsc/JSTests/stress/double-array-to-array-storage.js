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

"use strict";

function assert(b, msg) {
    if (!b)
        throw new Error(msg);
}

var arr = [];

function test()
{
    arr = [0, 2147483648]; // NOTE: the second number is greater than INT_MAX

    assert(arr[0] === 0, "arr[0] should be 0, but is " + arr[0]);
    assert(arr[1] === 2147483648, "arr[1] should be 2147483648, but is " + arr[1]);
    assert(arr.length === 2, "Length should be 2, but is " + arr.length);

    arr.shift();

    assert(arr[0] === 2147483648, "arr[0] should be 2147483648, but is " + arr[0]);
    assert(arr[1] === undefined, "arr[1] should be undefined, but is " + arr[1]);
    assert(arr.length === 1, "Length should be 2, but is " + arr.length);

    arr[1] = 1;

    assert(arr[0] === 2147483648, "arr[0] should be 2147483648, but is " + arr[0]);
    assert(arr[1] === 1, "arr[1] should be 1, but is " + arr[1]);
    assert(arr.length === 2, "Length should be 2, but is " + arr.length);
}

for (let i = 0; i < 10000; i++)
    test();

