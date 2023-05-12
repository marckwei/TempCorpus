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

function testCatchWithExceptionThrownFromFunctionReturningTuple() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()

            .Function("call", { params: ["i32", "i32"], ret: "i32" })
                .GetLocal(0)
                .GetLocal(1)
                .Try("i32")
                    .Call(1)
                    .Drop()
                    .Drop()
                .Catch(0)
                    .I32Const(2)
                .End()
                .Drop()
                .I32Add()
            .End()

            .Function("call2", { params: [], ret: ["i32", "i32", "i32"] })
                .Throw(0)
            .End()
        .End();

    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    for (let i = 0; i < 1000; ++i)
        assert.eq(instance.exports.call(42, 5), 47, "catching an exported wasm tag thrown from JS should be possible");
}

function testCatchWithExceptionThrownFromFunctionReturningTuple2() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()

            .Function("call", { params: ["i32", "i32"], ret: "i32" })
                .GetLocal(0)
                .GetLocal(1)
                .Try("f32")
                    .I32Const(10)
                    .I32Const(10)
                    .Call(1)
                    .Drop()
                    .Drop()
                    .Drop()
                    .Drop()
                .Catch(0)
                    .F32Const(2)
                .End()
                .Drop()
                .I32Add()
            .End()

            .Function("call2", { params: ["i32", "i32"], ret: ["f32", "f32", "f32", "f32", "f32"] })
                .Throw(0)
            .End()
        .End();

    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    for (let i = 0; i < 1000; ++i)
        assert.eq(instance.exports.call(42, 5), 47, "catching an exported wasm tag thrown from JS should be possible");
}

testCatchWithExceptionThrownFromFunctionReturningTuple();
testCatchWithExceptionThrownFromFunctionReturningTuple2();
