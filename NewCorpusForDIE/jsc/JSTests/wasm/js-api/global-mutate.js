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

function createInternalGlobalModule() {
    const builder = new Builder();

    builder.Type().End()
        .Function().End()
        .Global().I32(5, "mutable").End()
        .Export()
            .Function("getGlobal")
            .Function("setGlobal")
        .End()
        .Code()

        // GetGlobal
        .Function("getGlobal", { params: [], ret: "i32" })
            .GetGlobal(0)
        .End()

        // SetGlobal
        .Function("setGlobal", { params: ["i32"] })
            .GetLocal(0)
            .SetGlobal(0)
        .End()

        .End()

    const bin = builder.WebAssembly();
    bin.trim();

    const module = new WebAssembly.Module(bin.get());
    const instance = new WebAssembly.Instance(module);
    assert.eq(instance.exports.getGlobal(), 5);
    instance.exports.setGlobal(3);
    assert.eq(instance.exports.getGlobal(), 3);
}

createInternalGlobalModule();
