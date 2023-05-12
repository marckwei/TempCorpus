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

import * as assert from '../assert.js'
import Builder from '../Builder.js'

const b = new Builder();
b.Type().End()
    .Function().End()
    .Export()
        .Function("foo")
        .Function("bar")
    .End()
    .Code()
    .Function("bar", { params: ["f32", "f32"], ret: "f32" }, [])
    .GetLocal(0)
    .GetLocal(1)
    .F32Sub()
    .Return()
    .End()

    .Function("foo", { params: ["f32", "f32"], ret: "f32" }, [])
    .GetLocal(0)
    .GetLocal(1)
    .Call(0)
    .Return()
    .End()
    .End()

const bin = b.WebAssembly()
bin.trim();
const instance = new WebAssembly.Instance(new WebAssembly.Module(bin.get()));

let x = new Float32Array(3);
x[0] = 0;
x[1] = 1.5;
x[2] = x[0] - x[1];
assert.eq(instance.exports.bar(x[0], x[1]), x[2]);
assert.eq(instance.exports.foo(x[0], x[1]), x[2]);

x[0] = 100.1234
x[1] = 12.5;
x[2] = x[0] - x[1];
assert.eq(instance.exports.bar(x[0], x[1]), x[2]);
assert.eq(instance.exports.foo(x[0], x[1]), x[2]);
