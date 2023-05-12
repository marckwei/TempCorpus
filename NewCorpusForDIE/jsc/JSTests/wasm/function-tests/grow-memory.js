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

const pageSize = 64 * 1024;
const maxPageCount = (2**32) / pageSize;

function binaryShouldNotParse(builder, msg = "") {
    const bin = builder.WebAssembly().get();
    let threw = false;
    try {
        const module = new WebAssembly.Module(bin);
    } catch(e) {
        assert.truthy(e instanceof WebAssembly.CompileError);
        if (msg)
            assert.truthy(e.message.indexOf(msg) !== -1);
        threw = true;
    }
    assert.truthy(threw);
}

{
    // Can't grow_memory if no memory is defined.
    const builder = (new Builder())
        .Type().End()
        .Function().End()
        .Export().End()
        .Code()
            .Function({ret: "void", params: []})
                .I32Const(25)
                .GrowMemory(0)
                .Drop()
            .End()
        .End();

    binaryShouldNotParse(builder, "grow_memory is only valid if a memory is defined or imported");
}

{
    // Can't current_memory if no memory is defined.
    const builder = (new Builder())
        .Type().End()
        .Function().End()
        .Export().End()
        .Code()
            .Function({ret: "void", params: []})
                .I32Const(25)
                .CurrentMemory(0)
                .Drop()
            .End()
        .End();

    binaryShouldNotParse(builder, "current_memory is only valid if a memory is defined or imported");
}

{
    const builder = (new Builder())
        .Type().End()
        .Function().End()
        .Memory().InitialMaxPages(1, 1).End()
        .Export().End()
        .Code()
            .Function({ret: "void", params: []})
                .I32Const(25)
                .GrowMemory(1)
                .Drop()
            .End()
        .End();

    binaryShouldNotParse(builder, "reserved byte for grow_memory must be zero");
}

{
    const builder = (new Builder())
        .Type().End()
        .Function().End()
        .Memory().InitialMaxPages(1, 1).End()
        .Export().End()
        .Code()
            .Function({ret: "void", params: []})
                .I32Const(25)
                .CurrentMemory(1)
                .Drop()
            .End()
        .End();

    binaryShouldNotParse(builder, "reserved byte for current_memory must be zero");
}

{
    const builder = (new Builder())
        .Type().End()
        .Function().End()
        .Memory().InitialMaxPages(1, 1).End()
        .Export().End()
        .Code()
            .Function({ret: "void", params: []})
                .I32Const(25)
                .CurrentMemory(0xff)
                .Drop()
            .End()
        .End();

    binaryShouldNotParse(builder, "reserved byte for current_memory must be zero");
}

{
    const builder = (new Builder())
        .Type().End()
        .Function().End()
        .Memory().InitialMaxPages(1, 1).End()
        .Export().End()
        .Code()
            .Function({ret: "void", params: []})
                .I32Const(25)
                .GrowMemory(0xff)
                .Drop()
            .End()
        .End();

    binaryShouldNotParse(builder, "reserved byte for grow_memory must be zero");
}

{
    const memoryDescription = {initial: 20, maximum: 50};
    const builder = (new Builder())
        .Type().End()
        .Import().Memory("imp", "memory", memoryDescription).End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
            .Function("foo", { params: ["i32"], ret: "i32"})
                .GetLocal(0)
                .GrowMemory(0)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module, {imp: {memory: new WebAssembly.Memory(memoryDescription)}});
    let currentPageSize = memoryDescription.initial;
    for (let i = 0; i < memoryDescription.maximum - memoryDescription.initial; i++) {
        assert.eq(instance.exports.foo(1), currentPageSize);
        ++currentPageSize;
    }

    for (let i = 0; i < 1000; i++) {
        assert.eq(instance.exports.foo(1), -1);
        assert.eq(instance.exports.foo(0), currentPageSize);
    }
}

{
    const memoryDescription = {initial: 20, maximum: 100};
    const builder = (new Builder())
        .Type().End()
        .Import().Memory("imp", "memory", memoryDescription).End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
            .Function("foo", { params: [], ret: "i32"})
                .CurrentMemory(0)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory(memoryDescription);
    const instance = new WebAssembly.Instance(module, {imp: {memory}});
    let currentPageSize = memoryDescription.initial;
    for (let i = 0; i < memoryDescription.maximum - memoryDescription.initial; i++) {
        assert.eq(instance.exports.foo(), currentPageSize);
        ++currentPageSize;
        memory.grow(1);
    }
}

{
    const memoryDescription = {initial: 20, maximum: 100};
    const builder = (new Builder())
        .Type().End()
        .Import().Memory("imp", "memory", memoryDescription).End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
            .Function("foo", { params: [], ret: "i32"})
                .I32Const(-1)
                .GrowMemory(0)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory(memoryDescription);
    const instance = new WebAssembly.Instance(module, {imp: {memory}});
    for (let i = 0; i < 20; i++) {
        assert.eq(instance.exports.foo(), -1);
    }
}
