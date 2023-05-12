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

//@ skip if $memoryLimited

import Builder from '../Builder.js';
import * as assert from '../assert.js';

function escape(){}
noInline(escape);

for (let i = 0; i < 10; ++i) {
    const max = 1024*2;
    const memoryDescription = {initial: 0, maximum: max};
    const growMemoryAmount = 256;

    const builder = (new Builder())
        .Type().End()
        .Import()
            .Function("imp", "func", {params: [], ret: "void"})
            .Memory("imp", "memory", memoryDescription)
        .End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
            .Function("foo", {params: [], ret: "i32"})
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .I32Const(1)
                .Call(2)
                .I32Const(growMemoryAmount)
                .GrowMemory(0)
                .Return()
            .End()
            .Function("bar", {params: ["i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32"], ret: "void"})
                .Call(0)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory(memoryDescription);

    function func() { }

    const instance = new WebAssembly.Instance(module, {imp: {memory, func}});
    for (let i = 0; i < max/growMemoryAmount; ++i) {
        instance.exports.foo();
    }
}
