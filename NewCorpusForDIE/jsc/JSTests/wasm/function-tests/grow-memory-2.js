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

import Builder from '../Builder.js';
import * as assert from '../assert.js';

{
    const memoryDescription = {initial: 0, maximum: 2};
    const builder = (new Builder())
        .Type().End()
        .Import()
            .Memory("imp", "memory", memoryDescription)
            .Function("imp", "func", {params: [], ret: "void"})
        .End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
            .Function("foo", {params: ["i32"], ret: "i32"})
                .Call(0)
                .GetLocal(0)
                .I32Load(0, 0)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory(memoryDescription);

    const func = () => {
        memory.grow(1);
        (new Uint32Array(memory.buffer))[0] = 42;
    };

    const instance = new WebAssembly.Instance(module, {imp: {memory, func}});
    assert.eq(instance.exports.foo(0), 42);
}

{
    const memoryDescription = {initial: 0, maximum: 2};
    const tableDescription = {initial: 1, maximum: 1, element: "funcref"};
    const builder = (new Builder())
        .Type()
            .Func([], "void")
        .End()
        .Import()
            .Memory("imp", "memory", memoryDescription)
            .Function("imp", "func", {params: [], ret: "void"})
            .Table("imp", "table", tableDescription)
        .End()
        .Function().End()
        .Export()
            .Function("foo")
            .Function("bar")
        .End()
        .Code()
            .Function("foo", {params: ["i32"], ret: "i32"})
                .I32Const(0)
                .CallIndirect(0, 0) // call [] => void
                .GetLocal(0)
                .I32Load(0, 0)
                .Return()
            .End()
            .Function("bar", {params: [], ret: "void"})
                .Call(0)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory(memoryDescription);
    const table = new WebAssembly.Table(tableDescription);

    const func = () => {
        memory.grow(1);
        (new Uint32Array(memory.buffer))[0] = 0xbadbeef;
    };

    const instance = new WebAssembly.Instance(module, {imp: {memory, func, table}});
    table.set(0, instance.exports.bar);
    assert.eq(instance.exports.foo(0), 0xbadbeef);
}
