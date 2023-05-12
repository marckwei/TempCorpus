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

function testSimpleThrowDelegate() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .Try("void")
                        .Throw(0)
                    .Delegate(0)
                    .I32Const(42)
                .Catch(0)
                    .I32Const(2)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testSimpleThrowDelegateIllegal() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .Try("void")
                        .Throw(0)
                    .Delegate(0)
                .Catch(0)
                    .I32Const(2)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    assert.throws(() => {
        const module = new WebAssembly.Module(bin);
    }, WebAssembly.CompileError, `WebAssembly.Module doesn't validate:  block with type: () -> [I32] returns: 1 but stack has: 0 values, in function at index 0 (evaluating 'new WebAssembly.Module(bin)')`);
}

function testThrowDelegateSkip() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .Try("i32")
                        .Try("void")
                            .Throw(0)
                        .Delegate(1)
                        .I32Const(42)
                    .Catch(0)
                        .I32Const(1)
                    .End()
                .Catch(0)
                    .I32Const(2)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testThrowDelegateSkipIllegal() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .Try("i32")
                        .Try("void")
                            .Throw(0)
                        .Delegate(1)
                    .Catch(0)
                        .I32Const(1)
                    .End()
                .Catch(0)
                    .I32Const(2)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    assert.throws(() => {
        const module = new WebAssembly.Module(bin);
    }, WebAssembly.CompileError, `WebAssembly.Module doesn't validate:  block with type: () -> [I32] returns: 1 but stack has: 0 values, in function at index 0 (evaluating 'new WebAssembly.Module(bin)')`);
}

function testDelegateCaller() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .Call(1)
                .Catch(0)
                    .I32Const(2)
                .End()
            .End()

            .Function("call2", { params: [], ret: "i32" })
                .Try("i32")
                    .Try("void")
                        .Throw(0)
                    .Delegate(1)
                    .I32Const(42)
                .Catch(0)
                    .I32Const(1)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testDelegateCallerIllegal() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .Call(1)
                .Catch(0)
                    .I32Const(2)
                .End()
            .End()

            .Function("call2", { params: [], ret: "i32" })
                .Try("i32")
                    .Try("void")
                        .Throw(0)
                    .Delegate(1)
                .Catch(0)
                    .I32Const(1)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    assert.throws(() => {
        const module = new WebAssembly.Module(bin);
    }, WebAssembly.CompileError, `WebAssembly.Module doesn't validate:  block with type: () -> [I32] returns: 1 but stack has: 0 values, in function at index 1 (evaluating 'new WebAssembly.Module(bin)')`);
}

function testSimpleDelegateMerge(){
 const b = new Builder();
    b.Type().End()
        .Function().End()
        .Export()
            .Function("call")
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .I32Const(3)
                 .Delegate(0)
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });
    assert.eq(instance.exports.call(), 3);
}

testSimpleThrowDelegate();
testSimpleThrowDelegateIllegal();
testThrowDelegateSkip();
testThrowDelegateSkipIllegal();
testDelegateCaller();
testDelegateCallerIllegal();
testSimpleDelegateMerge();
