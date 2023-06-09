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

function shouldThrow(func, expectedMessage) {
    var errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (String(error) !== expectedMessage)
            throw new Error(`Bad error: ${error}`)
    }
    if (!errorThrown)
        throw new Error("Didn't throw!");
}

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}!`);
}

for (const key of ["Infinity", "NaN", "undefined"]) {
    const value = globalThis[key];
    Object.defineProperty(globalThis, key, {});
    shouldBe(Reflect.defineProperty(globalThis, key, { value }), true);
    Object.defineProperty(globalThis, key, { value, writable: false });
    shouldBe(Reflect.defineProperty(globalThis, key, { value, writable: false, enumerable: false }), true);
    Object.defineProperty(globalThis, key, { value, writable: false, enumerable: false, configurable: false });

    shouldBe(Reflect.defineProperty(globalThis, key, { value: {} }), false);
    shouldThrow(() => { Object.defineProperty(globalThis, key, { writable: true }); }, "TypeError: Attempting to change writable attribute of unconfigurable property.");
    shouldBe(Reflect.defineProperty(globalThis, key, { enumerable: true }), false);
    shouldThrow(() => { Object.defineProperty(globalThis, key, { configurable: true }); }, "TypeError: Attempting to change configurable attribute of unconfigurable property.")
    shouldBe(Reflect.defineProperty(globalThis, key, { get() {} }), false);
    shouldThrow(() => { Object.defineProperty(globalThis, key, { get() {}, set() {} }); }, "TypeError: Attempting to change access mechanism for an unconfigurable property.");
}

var foo = 1;
var bar;
function func() {}

for (const key of ["foo", "bar", "func"]) {
    const value = globalThis[key];
    Object.defineProperty(globalThis, key, {});
    shouldBe(Reflect.defineProperty(globalThis, key, { value }), true);
    Object.defineProperty(globalThis, key, { value, writable: true });
    shouldBe(Reflect.defineProperty(globalThis, key, { value, writable: true, enumerable: true }), true);
    Object.defineProperty(globalThis, key, { value, writable: true, enumerable: true, configurable: false });

    shouldBe(Reflect.defineProperty(globalThis, key, { value: key }), true);
    shouldBe(Object.getOwnPropertyDescriptor(globalThis, key).value, key);
    shouldBe(globalThis[key], key);

    Object.defineProperty(globalThis, key, { writable: false });
    shouldBe(Reflect.getOwnPropertyDescriptor(globalThis, key).writable, false);
    shouldThrow(() => { globalThis[key] = {}; }, "TypeError: Attempted to assign to readonly property.");
    shouldBe(globalThis[key], key);

    shouldBe(Reflect.defineProperty(globalThis, key, { writable: true }), false);
    shouldThrow(() => { Object.defineProperty(globalThis, key, { value: {} }); }, "TypeError: Attempting to change value of a readonly property.");
    shouldBe(globalThis[key], key);

    shouldThrow(() => { Object.defineProperty(globalThis, key, { enumerable: false }); }, "TypeError: Attempting to change enumerable attribute of unconfigurable property.");
    shouldBe(Reflect.defineProperty(globalThis, key, { configurable: true }), false);
    shouldThrow(() => { Object.defineProperty(globalThis, key, { get() {}, set() {} }); }, "TypeError: Attempting to change access mechanism for an unconfigurable property.");
    shouldBe(Reflect.defineProperty(globalThis, key, { get() {}, set() {} }), false);
}
