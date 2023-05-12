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

"use strict"

// Trivial case where everything could be eliminated.
function iterateEmptyArray()
{
    const array = new Array();
    for (let i = 0; i < 100; ++i) {
        if (array[i] !== undefined)
            throw "Unexpected value in empty array at index i = " + i;
    }
}
noInline(iterateEmptyArray);

for (let i = 1e4; i--;) {
    iterateEmptyArray();
}

// Trivial case but the array needs to be checked.
function getArrayOpaque()
{
    return new Array(10);
}
noInline(getArrayOpaque);

function iterateOpaqueEmptyArray()
{
    const array = getArrayOpaque();
    for (let i = 0; i < 100; ++i) {
        if (array[i] !== undefined)
            throw "Unexpected value in empty array at index i = " + i;
    }
}
noInline(iterateEmptyArray);

for (let i = 1e4; i--;) {
    iterateOpaqueEmptyArray();
}