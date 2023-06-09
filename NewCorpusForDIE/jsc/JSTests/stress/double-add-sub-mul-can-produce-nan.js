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

function assert(b) {
    if (!b)
        throw new Error;
}
noInline(assert);

{
    function sub(arr, b, c) {
        let x = b - c;
        arr[0] = x;
    }
    noInline(sub);


    for (let i = 0; i < 10000; ++i) {
        let arr = [];
        arr.length = 2;
        arr[1] = 10.5;
        sub(arr, 10.5, 20.5);
        assert(0 in arr);
    }

    let arr = [];
    arr.length = 2;
    arr[1] = 10.5;
    sub(arr, Infinity, Infinity);
    assert(typeof arr[0] === "number" && isNaN(arr[0]));
    assert(0 in arr);
}

{
    function mul(arr, b, c) {
        let x = b * c;
        arr[0] = x;
    }
    noInline(mul);

    for (let i = 0; i < 10000; ++i) {
        let arr = [];
        arr.length = 2;
        arr[1] = 10.5;
        mul(arr, 10.5, 20.5);
        assert(0 in arr);
    }

    let arr = [];
    arr.length = 2;
    arr[1] = 10.5;
    mul(arr, Infinity, 0);
    assert(typeof arr[0] === "number" && isNaN(arr[0]));
    assert(0 in arr);
}

{
    function add(arr, b, c) {
        let x = b + c;
        arr[0] = x;
    }
    noInline(add);

    for (let i = 0; i < 10000; ++i) {
        let arr = [];
        arr.length = 2;
        arr[1] = 10.5;
        add(arr, 10.5, 20.5);
        assert(0 in arr);
    }

    let arr = [];
    arr.length = 2;
    arr[1] = 10.5;
    add(arr, Infinity, -Infinity);
    assert(typeof arr[0] === "number" && isNaN(arr[0]));
    assert(0 in arr);
}
