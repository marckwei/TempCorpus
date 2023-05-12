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

'use strict';
const TypedArrays = [Uint8ClampedArray, Uint8Array, Uint16Array, Uint32Array, Int8Array, Int16Array, Int32Array, Float32Array, Float64Array];
const canonicalNumericIndexStrings = ['-0', '-1', '-3.14', 'Infinity', '-Infinity', 'NaN', '0.5', '4294967295', '4294967296'];

function assert(x, key) {
    if (!x)
        throw new Error(`Bad assertion! Key: '${key}'`);
}

for (const TypedArray of TypedArrays) {
    for (const key of canonicalNumericIndexStrings) {
        const assertPrototypePropertyIsUnreachable = () => {
            {
                const tA = new TypedArray;
                tA[key] = 1;
                assert(!tA.hasOwnProperty(key), key);
            }

            {
                const tA = new TypedArray;
                const heir = Object.create(tA);
                heir[key] = 2;

                assert(!tA.hasOwnProperty(key), key);
                assert(!heir.hasOwnProperty(key), key);
            }

            {
                const target = {};
                const receiver = new TypedArray;

                assert(!Reflect.set(target, key, 3, receiver), key);
                assert(!target.hasOwnProperty(key), key);
                assert(!receiver.hasOwnProperty(key), key);
            }

            {
                const tA = new TypedArray;
                const target = Object.create(tA);
                const receiver = {};

                assert(Reflect.set(target, key, 4, receiver), key);
                assert(!tA.hasOwnProperty(key), key);
                assert(!target.hasOwnProperty(key), key);
                assert(!receiver.hasOwnProperty(key), key);
            }
        };

        Object.defineProperty(TypedArray.prototype, key, {
            set() { throw new Error(`${TypedArray.name}.prototype['${key}'] setter should be unreachable!`); },
            configurable: true,
        });
        assertPrototypePropertyIsUnreachable();

        Object.defineProperty(TypedArray.prototype, key, { writable: false });
        assertPrototypePropertyIsUnreachable();
    }
}
