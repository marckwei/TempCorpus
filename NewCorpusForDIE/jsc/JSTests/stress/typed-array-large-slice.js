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

//@ skip if $memoryLimited or $addressBits <= 32

let giga = 1024 * 1024 * 1024;

let array = new Int8Array(4 * giga);
array[0] = 1;
array[giga] = 2;
array[2 * giga] = 3;
array[3 * giga] = 4;

function expect(base, index, expected, string)
{
    let result = base [index]
    if (result != expected)
        throw "Expected " + expected + " but got " + result + " while testing " + string;
}

let slice0 = array.slice(giga);
expect(slice0, 0, 2, "slice0");
expect(slice0, giga, 3, "slice0");
expect(slice0, 2*giga, 4, "slice0");

let subslice0 = slice0.slice(giga);
expect(subslice0, 0, 3, "subslice0");
expect(subslice0, giga, 4, "subslice0");

let slice1 = array.slice(giga, 2 * giga);
expect(slice1, 0, 2, "slice1");

let slice2 = array.slice(3 * giga);
expect(slice2, 0, 4, "slice2");

let slice3 = array.slice(4 * giga);
let subSlice3 = slice3.slice(0);

