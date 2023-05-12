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

const count = 10;
const pages = 6;
const memoryDescription = {initial:1};
const pageSize = 64 * 1024;

function createWasmInstance(memory) {
    const builder = new Builder()
        .Type().End()
        .Import()
            .Memory("imp", "memory", memoryDescription)
        .End()
        .Function().End()
        .Export()
            .Function("current")
            .Function("get")
            .Function("grow")
        .End()
        .Code()
            .Function("current", { params: [], ret: "i32" })
                .CurrentMemory(0)
                .Return()
            .End()
            .Function("get", { params: ["i32"], ret: "i32" })
                .GetLocal(0)
                .I32Load(2, 0)
                .Return()
            .End()
            .Function("grow", { params: ["i32"], ret: "i32" })
                .GetLocal(0)
                .GrowMemory(0)
                .Return()
            .End()
        .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    return new WebAssembly.Instance(module, {imp: {memory}});
}

function doFillMemory(mem, length) {
    const buf = new Uint32Array(mem.buffer);

    for (let i = 0; i < length; ++i) {
        buf[i * 4] = i + 1;
    }
}

function doCheckTrap(instances, mem, numPages, length) {
    const buf = new Uint32Array(mem.buffer);

    for (let instance of instances) {
        const foo = instance.exports.get;
        for (let i = 0; i < length; i++) {
            assert.eq(foo(i * 4), buf[i]);
        }
        assert.throws(() => foo(numPages * pageSize + 1), WebAssembly.RuntimeError, "Out of bounds memory access");
    }
}

function doCheckNoTrap(instances, mem, numPages, length) {
    const buf = new Uint32Array(mem.buffer);

    for (let instance of instances) {
        const foo = instance.exports.get;
        for (let i = 0; i < length; i++) {
            assert.eq(foo(i * 4), buf[i]);
        }
        assert.eq(foo(numPages * pageSize + 1), 0);
    }
}

function doMemoryGrow(instances) {
    const instance = instances[0]; // Take first instance and grow shared memory
    instance.exports.grow(1);
}

function doCheck(mem, instances, numPages) {
    const length = mem.buffer.byteLength / 4;
    
    doFillMemory(mem, length);
    doCheckTrap(instances, mem, numPages, length);
    doMemoryGrow(instances);
    doCheckNoTrap(instances, mem, numPages, length);
}

function checkWasmInstancesWithSharedMemory() {
    const mem = new WebAssembly.Memory(memoryDescription);

    const instances = [];
    for (let i = 0; i < count; i++) {
        instances.push(createWasmInstance(mem));
    }

    for(let i = 1; i < pages; i++) {
        doCheck(mem, instances, i);
    }

    let instance;
    for (let i = 0; i < count; i++) {
        instance = instances.shift();
    }

    fullGC();

    const survivedInstances =  [ instance ]; // Should survive only one instance after full GC

    doCheck(mem, survivedInstances, pages); // Recheck only for survie instances
}

checkWasmInstancesWithSharedMemory();
