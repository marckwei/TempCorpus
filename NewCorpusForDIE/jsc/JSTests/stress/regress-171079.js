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

function assert(actual, expected) {
    if (actual != expected)
        throw("FAILED: actual " + actual + ", expected " + expected);
}

Object.defineProperty(this, "t0", { 
    get: function() {
        "use strict";
        return t2.subarray(4, 7);
    }
});

t2 = new Uint16Array();

var exception;
function test() {
    exception = void 0;
    try {
        return t0;
    } catch (e) {
        exception = e;
    }
}

for (var i = 0; i < 100; ++i) {
    test();
    assert(exception, void 0);
}

t2.__proto__ = {
    subarray: 1
};

test();
assert(exception, "TypeError: t2.subarray is not a function. (In 't2.subarray(4, 7)', 't2.subarray' is 1)");

test();
assert(exception, "TypeError: t2.subarray is not a function. (In 't2.subarray(4, 7)', 't2.subarray' is 1)");
