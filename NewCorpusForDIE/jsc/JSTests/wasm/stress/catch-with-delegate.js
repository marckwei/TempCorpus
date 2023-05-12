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
        .Import().Function("context", "callback", { params: [], ret: "void" }).End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 0)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
            .Try("i32")
            .Try("i32")
                .Call(0)
                .I32Const(1)
            .Delegate(0)
            .Catch(0)
                .I32Const(3)
            .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, { context: { callback }});

    let tag = instance.exports.foo;

    function callback() {
        throw new WebAssembly.Exception(tag, []);
    }

    assert.eq(instance.exports.call(), 3);

    tag = new WebAssembly.Tag({ parameters: [] });

    assert.throws(instance.exports.call, WebAssembly.Exception);
}


{
    const b = new Builder();
    b.Type().End()
        .Import()
            .Function("context", "callback", { params: [], ret: "void" })
            .Exception("context", "tag", { params: ["i32"], ret: "void" })
        .End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export().Function("call")
            .Exception("foo", 1)
        .End()
        .Code()
            .Function("call", { params: [], ret: "i32" })
            .Try("i32")
            .Try("i32")
                .Call(0)
                .I32Const(1)
            .Delegate(0)
            .Catch(1)
                .I32Const(3)
            .End()
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    let otherTag = new WebAssembly.Tag({ parameters: ["i32"]})
    const instance = new WebAssembly.Instance(module, { context: { callback, tag: otherTag }});

    let tag = instance.exports.foo;
    let args = [];

    function callback() {
        throw new WebAssembly.Exception(tag, args);
    }

    assert.eq(instance.exports.call(), 3);

    tag = otherTag;
    args = [100];

    let exn = assert.throws(instance.exports.call, WebAssembly.Exception);
    assert.eq(exn.getArg(tag, 0), 100);
}
