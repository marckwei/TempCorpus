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

function jsToWasm(func, arg0, arg1, arg2)
{
    try {
        var result = func(arg0, arg1, arg2);
        throw new Error("throwing");
    } catch (error) {
        return error;
    }
}
noInline(jsToWasm);

async function test() {
    let builder = (new Builder())
        .Type().End()
        .Import().Function("context", "callback", { params: [], ret: "void" }).End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
        .Function("foo", { params: ["i32", "i32", "i32"], ret: "i32" })
            .Call(0)
            .I32Const(42)
            .GetLocal(0)
            .GetLocal(1)
            .GetLocal(2)
            .I32Add()
            .I32Add()
            .I32Add()
            .Return()
        .End()
        .End();

    let flag = false;
    function callback() {
        if (flag)
            throw new Error("flagged");
    }

    const bin = builder.WebAssembly().get();
    const {instance} = await WebAssembly.instantiate(bin, { context: { callback } });

    for (let i = 0; i < 100000; i++)
        assert.instanceof(jsToWasm(instance.exports.foo, 1, 2, 3), Error);
    flag = true;
    assert.instanceof(jsToWasm(instance.exports.foo, 1, 2, 3), Error);
    for (let i = 0; i < 100000; i++)
        assert.instanceof(jsToWasm(instance.exports.foo, 1, 2, 3), Error);
}

assert.asyncTest(test());
