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

function shouldThrow(func, errorMessage, key) {
    let errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (String(error) !== errorMessage)
            throw new Error(`Key: "${key}". Bad error: ${error}`);
    }
    if (!errorThrown)
        throw new Error(`Key: "${key}". Didn't throw!`);
}

function* testCases() {
    // hasSetterOrReadonlyProperties: false
    for (const key of ["isFinite", "eval", "globalThis", "parseInt", "EvalError", "JSON", "Uint8ClampedArray", "WeakMap"])
        yield [$vm.createGlobalObject(), key];
    for (const key of ["seal", "is", "values", "fromEntries", "defineProperty", "setPrototypeOf"])
        yield [$vm.createGlobalObject().Object, key];
    for (const key of ["apply", "construct", "has", "preventExtensions", "getPrototypeOf"])
        yield [$vm.createGlobalObject().Reflect, key];
    for (const key of ["toDateString", "toLocaleString", "getUTCMonth", "getDay", "setUTCMinutes", "setMonth"])
        yield [$vm.createGlobalObject().Date.prototype, key];
    for (const key of ["concat", "match", "padStart", "bold", "fixed", "small", "sub"])
        yield [$vm.createGlobalObject().String.prototype, key];

    // hasSetterOrReadonlyProperties: true
    for (const key of ["getUint16", "setInt8", "getFloat32", "setBigUint64"])
        yield [$vm.createGlobalObject().DataView.prototype, key];
    for (const key of ["toString", "valueOf"])
        yield [$vm.createGlobalObject().Symbol.prototype, key];
    for (const key of ["formatRange", "formatToParts", "resolvedOptions"])
        yield [$vm.createGlobalObject().Intl.DateTimeFormat.prototype, key];
    for (const key of ["formatToParts", "resolvedOptions"])
        yield [$vm.createGlobalObject().Intl.NumberFormat.prototype, key];
    for (const key of ["maximize", "minimize", "toString"])
        yield [$vm.createGlobalObject().Intl.Locale.prototype, key];

    yield [$vm.createStaticCustomValue(), "testStaticValueNoSetter"];
}

for (const [object, key] of testCases()) {
    object[key] = testValue;

    const desc = Object.getOwnPropertyDescriptor(object, key);
    assert(desc.value === testValue, key);
    assert(desc.writable, key);
    assert(!desc.enumerable, key);
    assert(desc.configurable, key);
}

for (const [object, key] of testCases()) {
    Object.preventExtensions(object);
    object[key] = testValue;

    const desc = Object.getOwnPropertyDescriptor(object, key);
    assert(desc.value === testValue, key);
    assert(desc.writable, key);
    assert(!desc.enumerable, key);
    assert(desc.configurable, key);
}

for (const [object, key] of testCases()) {
    Object.defineProperty(object, key, { enumerable: true, configurable: false });
    object[key] = testValue;

    const desc = Object.getOwnPropertyDescriptor(object, key);
    assert(desc.value === testValue, key);
    assert(desc.writable, key);
    assert(desc.enumerable, key);
    assert(!desc.configurable, key);
}

for (const [object, key] of testCases()) {
    Object.defineProperty(object, key, { writable: false });
    shouldThrow(() => { object[key] = testValue; }, "TypeError: Attempted to assign to readonly property.", key);

    const desc = Object.getOwnPropertyDescriptor(object, key);
    assert(desc.value !== testValue, key);
    assert(!desc.writable, key);
    assert(!desc.enumerable, key);
    assert(desc.configurable, key);
}

for (const [object, key] of testCases()) {
    const heir = Object.create(object);
    heir[key] = testValue;

    const desc = Object.getOwnPropertyDescriptor(heir, key);
    assert(desc.value === testValue, key);
    assert(desc.writable, key);
    assert(desc.enumerable, key);
    assert(desc.configurable, key);
    assert(object[key] !== testValue, key);
}

for (const [object, key] of testCases()) {
    const prototype = Object.getPrototypeOf(object);
    if (prototype !== null) {
        Object.defineProperty(prototype, key, {
            set() { throw new Error(`"${key}" setter should be unreachable!`); },
        });
    }

    const heir = Object.create(object);
    heir[key] = testValue;

    const desc = Object.getOwnPropertyDescriptor(heir, key);
    assert(desc.value === testValue, key);
    assert(desc.writable, key);
    assert(desc.enumerable, key);
    assert(desc.configurable, key);
    assert(object[key] !== testValue, key);
}

for (const [object, key] of testCases()) {
    const heir = Object.create(object);
    Object.preventExtensions(heir);

    shouldThrow(() => { heir[key] = testValue; }, "TypeError: Attempting to define property on object that is not extensible.", key);
    assert(heir[key] !== testValue, key);
    assert(object[key] !== testValue, key);
}

for (const [object, key] of testCases()) {
    const target = {};
    assert(Reflect.set(target, key, testValue, object), key);
    assert(!target.hasOwnProperty(key), key);

    const desc = Object.getOwnPropertyDescriptor(object, key);
    assert(desc.value === testValue, key);
    assert(desc.writable, key);
    assert(!desc.enumerable, key);
    assert(desc.configurable, key);
}
