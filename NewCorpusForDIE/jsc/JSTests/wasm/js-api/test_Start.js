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
import Builder from '../Builder.js';

(function StartNamedFunction() {
    const b = (new Builder())
        .Type().End()
        .Import()
            .Function("imp", "func", { params: ["i32"] })
        .End()
        .Function().End()
        .Start("foo").End()
        .Code()
            .Function("foo", { params: [] })
                .I32Const(42)
                .Call(0) // Calls func(42).
            .End()
        .End();
    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    let value = 0;
    const setter = v => value = v;
    const instance = new WebAssembly.Instance(module, { imp: { func: setter } });
    assert.eq(value, 42);
})();

(function InvalidStartFunctionIndex() {
    const b = (new Builder())
        .setChecked(false)
        .Type().End()
        .Function().End()
        .Start(0).End() // Invalid index.
        .Code().End();
    const bin = b.WebAssembly().get();
    assert.throws(() => new WebAssembly.Module(bin), Error, `WebAssembly.Module doesn't parse at byte 17: Start index 0 exceeds function index space 0 (evaluating 'new WebAssembly.Module(bin)')`);
})();
