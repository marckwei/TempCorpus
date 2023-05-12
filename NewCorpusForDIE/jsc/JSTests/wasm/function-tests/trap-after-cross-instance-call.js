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
const numPages = 10;

const builder = (new Builder())
    .Type().End()
    .Import()
        .Memory("a", "b", {initial: numPages})
        .Function("foo", "bar", { params: [], ret: "void" })
    .End()
    .Function().End()
    .Export().Function("foo").End()
    .Code()
        .Function("foo", {params: ["i32"], ret: "i32"})
            .Call(0)
            .GetLocal(0)
            .I32Load(2, 0)
            .Return()
        .End()
    .End();

const bin = builder.WebAssembly().get();
const module = new WebAssembly.Module(bin);

let importObject = {a: {b: new WebAssembly.Memory({initial: numPages})}};

{
    const builder = (new Builder())
          .Type().End()
          .Import()
              .Memory("a", "b", {initial: numPages})
          .End()
          .Function().End()
          .Export().Function("bar").End()
          .Code()
              .Function("bar", { params: [], ret: "void" })
                  .Return()
              .End()
          .End();

    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);

    importObject.foo = new WebAssembly.Instance(module, {a: {b: new WebAssembly.Memory({initial: numPages})}}).exports
}

let foo1 = new WebAssembly.Instance(module, importObject).exports.foo;
importObject.foo = { bar() { } };
let foo2 = new WebAssembly.Instance(module, importObject).exports.foo;


function wasmFrameCountFromError(e) {
    let stackFrames = e.stack.split("\n").filter((s) => s.indexOf("wasm-") !== -1);
    return stackFrames.length;
}

for (let i = 0; i < 1000; i++) {
    const e1 = assert.throws(() => foo1(numPages * pageSize + 1), WebAssembly.RuntimeError, "Out of bounds memory access");
    assert.eq(wasmFrameCountFromError(e1), 1);
    const e2 = assert.throws(() => foo2(numPages * pageSize + 1), WebAssembly.RuntimeError, "Out of bounds memory access");
    assert.eq(wasmFrameCountFromError(e2), 1);
}
