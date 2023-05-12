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

/***
 * There was a bug on 32-bit builds where === with objects would not check the tag
 * when determining equality via pointer comparison.
 */

"use strict";

function Foo() {}

function checkStrictEq(a, b) {
    return a === b;
}
noInline(checkStrictEq);

function checkStrictEqOther(a, b) {
    return a === b;
}
noInline(checkStrictEqOther);

var foo = new Foo();
var address = addressOf(foo);

if (address === undefined)
    throw "Error: address should not be undefined";

if (foo === address || address === foo)
    throw "Error: an address should not be equal to it's object";

for (var i = 0; i < 10000000; i++) {
    if (checkStrictEq(foo, address))
        throw "Error: an address should not be equal to it's object";
    if (checkStrictEqOther(address,foo))
        throw "Error: an address should not be equal to it's object";
}
