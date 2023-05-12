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

function assert(b) {
    if (!b)
        throw new Error("bad assertion.");
}

let targets = [Function, String, Array, Set, Map, WeakSet, WeakMap, RegExp, Number, Promise, Date, Boolean, Error, TypeError, SyntaxError, ArrayBuffer, Int32Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Uint32Array, Float32Array, Float64Array, DataView];
for (let target of targets) {
    let error = null;
    let called = false;
    let handler = {
        get: function(theTarget, propName) {
            assert(propName === "prototype");
            error = new Error;
            called = true;
            throw error;
        }
    };

    let proxy = new Proxy(target, handler);

    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            if (target === Promise)
                new proxy(function() {});
            else
                new proxy;
        } catch(e) {
            threw = true;
            assert(e === error);
            error = null;
        }
        assert(threw);
        assert(called);
        called = false;
    }
}
