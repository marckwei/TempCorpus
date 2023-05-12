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

import * as assert from '../assert.js';
{
    assert.throws(() => {
        const g = new WebAssembly.Global({value: "i32", mutable: false});
        g.type.call({});
    }, TypeError, "expected |this| value to be an instance of WebAssembly.Global");

    const i32 = new WebAssembly.Global({value: "i32", mutable: false}).type();
    assert.eq(Object.keys(i32).length, 2);
    assert.eq(i32.value, "i32");
    assert.eq(i32.mutable, false);

    const i32m = new WebAssembly.Global({value: "i32", mutable: true}).type();
    assert.eq(i32m.value, "i32");
    assert.eq(i32m.mutable, true);

    const i64 = new WebAssembly.Global({value: "i64", mutable: true}).type();
    assert.eq(i64.value, "i64");

    const f32 = new WebAssembly.Global({value: "f32", mutable: true}).type();
    assert.eq(f32.value, "f32");

    const f64 = new WebAssembly.Global({value: "f64", mutable: true}).type();
    assert.eq(f64.value, "f64");

    const f64n = new WebAssembly.Global(f64).type();
    assert.eq(f64.value, f64n.value);
    assert.eq(f64.mutable, f64n.mutable);
}