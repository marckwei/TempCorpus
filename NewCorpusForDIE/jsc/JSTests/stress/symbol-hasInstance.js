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

// This file tests the functionality of Symbol.hasInstance.


// Test a custom Symbol.hasInstance on a function object.
function Constructor(x) {}
foo = new Constructor();

if (!(foo instanceof Constructor))
    throw "should be instanceof";

Object.defineProperty(Constructor, Symbol.hasInstance, {value: function(value) {
    if (this !== Constructor)
        throw "|this| should be Constructor";
    if (value !== foo)
        throw "first argument should be foo";
    return false;
} });


if (foo instanceof Constructor)
    throw "should not be instanceof";


// Test Symbol.hasInstance on an ordinary object.
ObjectClass = {}
ObjectClass[Symbol.hasInstance] = function (value) {
    return value !== null && (typeof value === "object" || typeof value === "function");
}

if (!(foo instanceof ObjectClass))
    throw "foo should be an instanceof ObjectClass";

if (!(Constructor instanceof ObjectClass))
    throw "Constructor should be an instanceof ObjectClass";

NumberClass = {}
NumberClass[Symbol.hasInstance] = function (value) {
    return typeof value === "number";
}

if (!(1 instanceof NumberClass))
    throw "1 should be an instanceof NumberClass";

if (foo instanceof NumberClass)
    throw "foo should be an instanceof NumberClass";


// Test the Function.prototype[Symbol.hasInstance] works when actually called.
descriptor = Object.getOwnPropertyDescriptor(Function.prototype, Symbol.hasInstance);
if (descriptor.writable !== false || descriptor.configurable !== false || descriptor.enumerable !== false)
    throw "Function.prototype[Symbol.hasInstance] has a bad descriptor";

if (!Function.prototype[Symbol.hasInstance].call(Constructor, foo))
    throw "Function.prototype[Symbol.hasInstance] should claim that foo is an instanceof Constructor";
