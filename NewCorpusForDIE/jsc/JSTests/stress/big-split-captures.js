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

var bigString = "xyz";
while (bigString.length < 200000)
    bigString = bigString + bigString;

if (bigString.length != 393216)
    throw "Error: bad string length: " + bigString.length;

var result = /(x)(y)(z)/[Symbol.split](bigString);

if (result.length != 524289)
    throw "Error: bad result array length: " + result.length;

if (result[0] != "")
    throw "Error: array does not start with an empty string.";

for (var i = 1; i < result.length; i += 4) {
    if (result[i + 0] != "x")
        throw "Error: array does not contain \"x\" at i = " + i + " + 0: " + result[i + 0];
    if (result[i + 1] != "y")
        throw "Error: array does not contain \"y\" at i = " + i + " + 1: " + result[i + 1];
    if (result[i + 2] != "z")
        throw "Error: array does not contain \"z\" at i = " + i + " + 2: " + result[i + 2];
    if (result[i + 3] != "")
        throw "Error: array does not contain \"\" at i = " + i + " + 3: " + result[i + 3];
}
