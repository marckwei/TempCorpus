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
const testValue = Object.freeze({});

function assert(x, key) {
    if (!x)
        throw new Error(`Key: "${key}". Bad assertion!`);
}

function* testCases() {
    for (const key of ["description"])
        yield [$vm.createGlobalObject().Symbol.prototype, key];
    for (const key of ["buffer", "byteLength", "byteOffset"])
        yield [$vm.createGlobalObject().DataView.prototype, key];
    for (const key of ["baseName", "caseFirst", "hourCycle", "numeric", "region"])
        yield [$vm.createGlobalObject().Intl.Locale.prototype, key];

    for (const key of ["testStaticAccessorDontEnum", "testStaticAccessorReadOnly"])
        yield [$vm.createStaticCustomAccessor(), key];
    yield [$vm.createStaticCustomValue(), "testStaticValueReadOnly"];
}

for (const [object, key] of testCases()) {
    const target = {};
    assert(!Reflect.set(target, key, testValue, object), key);
    assert(!target.hasOwnProperty(key), key);
    assert(Object.getOwnPropertyDescriptor(object, key).value !== testValue, key);
}

for (const [object, key] of testCases()) {
    Object.defineProperty(object, key, { value: {}, writable: false });
    const target = {};
    assert(!Reflect.set(target, key, testValue, object), key);
    assert(!target.hasOwnProperty(key), key);
    assert(Object.getOwnPropertyDescriptor(object, key).value !== testValue, key);
}

for (const [object, key] of testCases()) {
    Object.defineProperty(object, key, { value: {}, writable: true, configurable: false });
    object[key] = testValue;

    const desc = Object.getOwnPropertyDescriptor(object, key);
    assert(desc.value === testValue, key);
    assert(desc.writable, key);
    assert(!desc.enumerable, key);
    assert(!desc.configurable, key);
}

for (const [object, key] of testCases()) {
    Object.defineProperty(object, key, { value: {}, writable: true, enumerable: true });
    const target = {};
    assert(Reflect.set(target, key, testValue, object), key);

    const desc = Object.getOwnPropertyDescriptor(object, key);
    assert(desc.value === testValue, key);
    assert(desc.writable, key);
    assert(desc.enumerable, key);
    assert(desc.configurable, key);
}
