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

function tail(a, b) { }
noInline(tail);

var obj = {
    method: function (x) {
        return tail(x, x);
    },

    get fromNative() { return tail(0, 0); }
};
noInline(obj.method);

function getThis(x) { return this; }
noInline(getThis);

for (var i = 0; i < 10000; ++i) {
    var that = getThis(obj.method(42));

    if (!Object.is(that, undefined))
        throw new Error("Wrong 'this' value in call, expected undefined but got " + that);

    that = getThis(obj.method(...[42]));
    if (!Object.is(that, undefined))
        throw new Error("Wrong 'this' value in varargs call, expected undefined but got " + that);

    if (!Object.is(obj.fromNative, undefined))
        throw new Error("Wrong 'fromNative' value, expected undefined but got " + obj.fromNative);
}
