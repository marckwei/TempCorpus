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

typedArrays = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];

function assert(cond) {
    if (!cond)
        throw new Error("bad assertion!");
}

function assertThrows(thunk, error) {
    let failed = true;
    try {
        thunk();
    } catch (e) {
        if (error && e != error)
            throw new Error("bad assertion!");
        failed = false;
    }
    if (failed)
        throw new Error("bad assertion!");
}

function makeDescriptor(accessor, configurable, writable, enumerable) {
    let o = {writable, configurable, enumerable}
    if (accessor)
        o.get = () => 1;
    else
        o.value = 1;
    return o;
}

let bools = [true, false];

function test(array, a, c, error ) {
    for (w of bools) {
        for (e of bools) {
            assertThrows(() => Object.defineProperty(a, 0, makeDescriptor(a, c, w, e), error));
        }
    }
}

function foo() {
    for (constructor of typedArrays) {
        let a = new constructor(10);
        Object.defineProperty(a, 0, makeDescriptor(false, true, true, true));
        assert(a[0] === 1);
        assertThrows(() => Object.defineProperty(a, 0, makeDescriptor(false, true, true, false), "TypeError: Attempting to store non-enumerable indexed property on a typed array."));
        assertThrows(() => Object.defineProperty(a, 0, makeDescriptor(false, true, false, false), "TypeError: Attempting to store non-enumerable indexed property on a typed array."));
        assertThrows(() => Object.defineProperty(a, 0, makeDescriptor(false, true, false, true), "TypeError: Attempting to store non-writable indexed property on a typed array."));

        test(a, false, false, "TypeError: Attempting to store non-configurable property.");
        for (c of bools) {
            test(a, true, c, "TypeError: Attempting to store accessor indexed property on a typed array.")
        }
    }
}

for (let i = 0; i < 100; i++)
    foo();
