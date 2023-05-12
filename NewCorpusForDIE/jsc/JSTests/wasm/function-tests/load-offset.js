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
    const builder = (new Builder())
        .Type().End()
        .Import()
            .Memory("imp", "mem", {initial: 1})
        .End()
        .Function().End()
        .Export().Function("foo").End()
        .Code()
            .Function("foo", {params: ["i32"], ret: "i32"})
                .GetLocal(0)
                .I32Load(2, 4)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory({initial: 1});
    const instance = new WebAssembly.Instance(module, {imp: {mem: memory}});
    
    const number = 0x0abbccdd;
    (new Uint32Array(memory.buffer))[1] = number;
    assert.eq(instance.exports.foo(0), number);
}

{
    const builder = (new Builder())
        .Type().End()
        .Import()
            .Memory("imp", "mem", {initial: 1})
        .End()
        .Function().End()
        .Export().Function("foo").End()
        .Code()
            .Function("foo", {params: ["i32"], ret: "i32"})
                .GetLocal(0)
                .I64Load32U(2, 4)
                .I64Popcnt()
                .I32WrapI64()
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory({initial: 1});
    const instance = new WebAssembly.Instance(module, {imp: {mem: memory}});
    
    const number = 2**32 - 1;
    (new Uint32Array(memory.buffer))[1] = number;
    assert.eq(instance.exports.foo(0), 32);
}

{
    const builder = (new Builder())
        .Type().End()
        .Import()
            .Memory("imp", "mem", {initial: 1})
        .End()
        .Function().End()
        .Export().Function("foo").End()
        .Code()
            .Function("foo", {params: ["i32"], ret: "i32"})
                .GetLocal(0)
                .I64Load32S(2, 4)
                .I64Popcnt()
                .I32WrapI64()
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory({initial: 1});
    const instance = new WebAssembly.Instance(module, {imp: {mem: memory}});
    
    const number = 2**32 - 1;
    (new Uint32Array(memory.buffer))[1] = number;
    assert.eq(instance.exports.foo(0), 64);
}

{
    const builder = (new Builder())
        .Type().End()
        .Import()
            .Memory("imp", "mem", {initial: 1})
        .End()
        .Function().End()
        .Export().Function("foo").End()
        .Code()
            .Function("foo", {params: ["i32"], ret: "i32"})
                .GetLocal(0)
                .I64Load(2, 4)
                .I64Popcnt()
                .I32WrapI64()
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory({initial: 1});
    const instance = new WebAssembly.Instance(module, {imp: {mem: memory}});
    
    const number = 2**32 - 1;
    (new Uint32Array(memory.buffer))[1] = number;
    (new Uint32Array(memory.buffer))[2] = 0xff00ff00;
    assert.eq(instance.exports.foo(0), 32 + 16);
}

{
    const builder = (new Builder())
        .Type().End()
        .Import()
            .Memory("imp", "mem", {initial: 1})
        .End()
        .Function().End()
        .Export().Function("foo").End()
        .Code()
            .Function("foo", {params: ["i32"], ret: "f32"})
                .GetLocal(0)
                .F32Load(2, 4)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory({initial: 1});
    const instance = new WebAssembly.Instance(module, {imp: {mem: memory}});
    
    const number = Math.PI;
    (new Float32Array(memory.buffer))[1] = number;
    assert.eq(instance.exports.foo(0), Math.fround(number));
}

{
    const builder = (new Builder())
        .Type().End()
        .Import()
            .Memory("imp", "mem", {initial: 1})
        .End()
        .Function().End()
        .Export().Function("foo").End()
        .Code()
            .Function("foo", {params: ["i32"], ret: "f64"})
                .GetLocal(0)
                .F64Load(2, 8)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const memory = new WebAssembly.Memory({initial: 1});
    const instance = new WebAssembly.Instance(module, {imp: {mem: memory}});
    
    const number = Math.PI;
    (new Float64Array(memory.buffer))[1] = number;
    assert.eq(instance.exports.foo(0), number);
}
