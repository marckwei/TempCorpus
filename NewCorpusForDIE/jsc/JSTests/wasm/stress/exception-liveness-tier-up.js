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
    b.Type().End()
        .Function().End()
        .Exception()
            .Signature({ params: ["i32"]})
        .End()
        .Export()
            .Function("call")
            .Exception("tag", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" }, ["i32"])
                .I32Const(1e6)
                .SetLocal(0)
                .Try("i32")
                    .I32Const(42)
                    .Throw(0)
                .Catch(0)
                    .Loop("void")
                        .Block("void", b =>
                               b.GetLocal(0)
                               .I32Eqz()
                               .BrIf(0)
                               .GetLocal(0)
                               .I32Const(1)
                               .I32Sub()
                               .SetLocal(0)
                               .Br(1)
                              )
                    .End()
                    .Rethrow(0)
                .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module);
    const tag = instance.exports.tag;

    assert.throws(instance.exports.call, WebAssembly.Exception, "wasm exception");
    try {
        instance.exports.call();
    } catch (e) {
        assert.truthy(e.is(tag));
        assert.eq(e.getArg(tag, 0), 42);
    }
}

{
    const b = new Builder();
    b.Type().End()
        .Import().Function("context", "callback", { params: [], ret: "i32" }).End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
        .End()
        .Code()
            .Function("call", { params: ["i32"], ret: "i32" })
                .GetLocal(0)
                .Loop("void")
                    .Call(2)
                    .Try("void")
                        .Throw(0)
                    .CatchAll()
                        .Call(0)
                        .I32Eqz()
                        .BrIf(1)
                    .End()
                .End()
            .End()
            .Function("wrapper", { params: [], ret: "void" })
            .End()
        .End()

    var counter = 1e5;
    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { context: { callback: function() { if (!--counter) return true;} } });

    assert.eq(instance.exports.call(), 0);
}
