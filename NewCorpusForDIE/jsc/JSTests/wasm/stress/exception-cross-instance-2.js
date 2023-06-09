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

const pageSize = 64 * 1024;
const numPages = 1;

var instA;
var instB;
var grow;
var memoryDescription = {initial: 0};
var mem = new WebAssembly.Memory(memoryDescription);

function test() {
    assert.eq(instA.exports.main(42), 42);
}

{
    const b = new Builder();
    b.Type().End()
        .Import()
            .Memory("context", "mem", memoryDescription)
            .Function("context", "grow", { params: [], ret: "void" })
        .End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export()
            .Function("trampoline")
        .End()
        .Code()
            .Function("trampoline", { params: [], ret: "void" })
                .Call(0)
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    instB = new WebAssembly.Instance(module, {
        context: {
            mem,
            grow() { instA.exports.grow(1); },
        }
    });
}

{
    const b = new Builder();
    b.Type().End()
        .Import()
            .Memory("context", "mem", memoryDescription)
            .Function("context", "trampoline", { params: [], ret: "void" })
        .End()
        .Function().End()
        .Exception().Signature({ params: []}).End()
        .Export()
            .Function("main")
            .Function("grow")
        .End()
        .Code()
            .Function("main", { params: ["i32"], ret: "i32" })
                .Try("i32")
                    .Call(0)
                    .I32Const(3)
                .CatchAll()
                    .I32Const(0)
                    .I32Load(0, 0)
                .End()
            .End()
            .Function("grow", { params: ["i32"], ret: "void" })
                .GetLocal(0)
                .GrowMemory(0)
                .I32Const(42)
                .I32Store(0, 0)
                .Throw(0)
            .End()
        .End()


    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    instA = new WebAssembly.Instance(module, {
        context: {
            mem,
            trampoline: instB.exports.trampoline,
        }
    });
}

test();
