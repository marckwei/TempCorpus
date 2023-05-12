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

function testSimpleTryCatch(){
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
                .Throw(0)
                .I32Const(1)
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

function testSimpleTryCatchAll(){
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
                .Throw(0)
                .I32Const(1)
            .CatchAll()
                .I32Const(2)
            .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testCallTryCatch(){
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
                .Throw(0)
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testCallTryCatchAll(){
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
                .Throw(0)
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testSimpleTryCatchValue(){
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: ["i32"]}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
            .Try("i32")
                .I32Const(2)
                .Throw(0)
            .Catch(0)
            .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testCallTryCatchValue(){
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: ["i32"]}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
            .Try("i32")
                .Call(1)
            .Catch(0)
            .End()
            .End()

            .Function("call2", { params: [], ret: "i32" })
                .I32Const(2)
                .Throw(0)
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testStackTryCatch(){
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: ["i32"]}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
            .I32Const(2)
            // TODO: builder error
            .Try({ params: ["i32"], ret: "i32" })
                .Throw(0)
            .Catch(0)
            .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testLiveAfterTryCatch() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: [] }).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .I32Const(2)
                .Try("void")
                    .Throw(0)
                .Catch(0)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testLiveAfterTryCatchAll() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: [] }).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .I32Const(2)
                .Try("void")
                    .Throw(0)
                .CatchAll()
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testUnifyTryCatchCatch() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception()
            .Signature({ params: [] })
            .Signature({ params: [] })
        .End()
        .Export()
            .Function("call")
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .Throw(1)
                .Catch(0)
                    .I32Const(1)
                .Catch(1)
                    .I32Const(2)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testUnifyTryCatchCatchAll() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception()
            .Signature({ params: [] })
            .Signature({ params: [] })
        .End()
        .Export()
            .Function("call")
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .Throw(1)
                .Catch(0)
                    .I32Const(1)
                .CatchAll()
                    .I32Const(2)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testUnifyTryNoThrow() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception()
            .Signature({ params: [] })
            .Signature({ params: [] })
        .End()
        .Export()
            .Function("call")
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .I32Const(2)
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

function testUnifyTryNoCatch() {
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception()
            .Signature({ params: [] })
            .Signature({ params: [] })
        .End()
        .Export()
            .Function("call")
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
                .Try("i32")
                    .I32Const(2)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { });

    assert.eq(instance.exports.call(), 2, "catching an exported wasm tag thrown from JS should be possible");
}

function testNestedCatch (){
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
        .End()
        .Code()
            .Function("call", { params: ["i32"], ret: "i32" })
                .GetLocal(0)
                .Try("void")
                    .Throw(0)
                .CatchAll()
                    .Try("void")
                        .Throw(0)
                    .CatchAll()
                        .Throw(0)
                    .End()
                .End()
            .End()
        .End()

    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module);

    assert.throws(instance.exports.call, WebAssembly.Exception, "wasm exception");
}

testSimpleTryCatch();
testSimpleTryCatchAll();
testSimpleTryCatchValue();
testCallTryCatch();
testCallTryCatchAll();
testCallTryCatchValue();
testLiveAfterTryCatch();
testLiveAfterTryCatchAll();
testUnifyTryCatchCatch();
testUnifyTryCatchCatchAll();
testUnifyTryNoThrow();
testUnifyTryNoCatch();

// TODO: enable this test
// testStackTryCatch();
