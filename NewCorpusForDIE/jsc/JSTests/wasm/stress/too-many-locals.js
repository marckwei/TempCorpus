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

import Builder from '../Builder.js'
import * as assert from '../assert.js'

{
    const b = new Builder();
    const locals = [];
    const maxFunctionLocals = 50000;
    const numLocals = maxFunctionLocals;
    for (let i = 0; i < numLocals; ++i)
        locals[i] = "i32";
    let cont = b
        .Type().End()
        .Function().End()
        .Export()
            .Function("loop")
        .End()
        .Code()
            .Function("loop", { params: ["i32"], ret: "i32" }, locals)
                .I32Const(1)
                .Return()
            .End()
        .End()

    const bin = b.WebAssembly().get();
    var exception;
    try {
        const module = new WebAssembly.Module(bin);
    } catch (e) {
        exception = "" + e;
    }

    assert.eq(exception, "CompileError: WebAssembly.Module doesn't parse at byte 100002: Function's number of locals is too big 50001 maximum 50000, in function at index 0 (evaluating 'new WebAssembly.Module(bin)')");
}
