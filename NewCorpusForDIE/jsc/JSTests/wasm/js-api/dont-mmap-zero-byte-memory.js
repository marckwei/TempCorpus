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

let mems = [];
function makeMem(initial) {
    const desc = {initial};
    mems.push([desc, new WebAssembly.Memory(desc)]);
}
for (let i = 0; i < 100; ++i) {
    makeMem(1);
}

// This loop should not OOM! This tests a bug where we
// would call mmap with zero bytes if we ran out of
// fast memories but created a slow memory with zero
// initial page count.
for (let i = 0; i < 100; ++i) {
    makeMem(0);
}

function testMems() {
    for (const [memDesc, mem] of mems) {
        const builder = (new Builder())
            .Type().End()
            .Import()
                .Memory("imp", "memory", memDesc)
            .End()
            .Function().End()
            .Export()
                .Function("foo")
            .End()
            .Code()
                .Function("foo", { params: [], ret: "i32" })
                    .I32Const(0)
                    .I32Load8U(0, 0)
                    .Return()
                .End()
            .End();
        const bin = builder.WebAssembly().get();
        const module = new WebAssembly.Module(bin);
        const instance = new WebAssembly.Instance(module, {imp: {memory: mem}});
        if (mem.buffer.byteLength > 0)
            assert.eq(instance.exports.foo(), 0);
        else
            assert.throws(() => instance.exports.foo(), WebAssembly.RuntimeError, "Out of bounds memory access");
    }
}

testMems();

for (const [_, mem] of mems)
    mem.grow(1);

testMems();
