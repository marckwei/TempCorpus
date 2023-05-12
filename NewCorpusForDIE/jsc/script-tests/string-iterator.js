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

description("Verify the various properties of String.prototype[Symbol.iterator]");


debug("Iterator object properties");
shouldBeEqualToString("typeof String.prototype[Symbol.iterator]", "function");
shouldBeEqualToString("String.prototype[Symbol.iterator].name", "[Symbol.iterator]");
shouldBe("String.prototype[Symbol.iterator].length", "0");
shouldBeTrue("Object.getOwnPropertyDescriptor(String.prototype, Symbol.iterator).configurable");
shouldBeFalse("Object.getOwnPropertyDescriptor(String.prototype, Symbol.iterator).enumerable");
shouldBeTrue("Object.getOwnPropertyDescriptor(String.prototype, Symbol.iterator).writable");
shouldBeFalse("String.prototype[Symbol.iterator]() === String.prototype[Symbol.iterator]()");

debug("Iterating a simple string.");
let iterator = "WebKit"[Symbol.iterator]();

let next = iterator.next();
shouldBeEqualToString("next.value", "W");
shouldBeFalse("next.done");
next = iterator.next();
shouldBeEqualToString("next.value", "e");
shouldBeFalse("next.done");
next = iterator.next();
shouldBeEqualToString("next.value", "b");
shouldBeFalse("next.done");
next = iterator.next();
shouldBeEqualToString("next.value", "K");
shouldBeFalse("next.done");
next = iterator.next();
shouldBeEqualToString("next.value", "i");
shouldBeFalse("next.done");
next = iterator.next();
shouldBeEqualToString("next.value", "t");
shouldBeFalse("next.done");
next = iterator.next();
shouldBe("next.value", "undefined");
shouldBeTrue("next.done");
next = iterator.next();
shouldBe("next.value", "undefined");
shouldBeTrue("next.done");
