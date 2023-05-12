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
    .Import().End()
    .Function().End()
    .Export()
        .Function("fac")
    .End()
    .Code()
        .Function("fac", { params: ["i32"], ret: "i32" })
            .GetLocal(0)
            .I32Const(0)
            .I32Eq()
            .If("void", b =>
                b.I32Const(1)
                .Return()
               )
                .GetLocal(0)
            .GetLocal(0)
            .I32Const(1)
            .I32Sub()
            .Call(0)
            .I32Mul()
            .Return()
        .End()
    .End()

const m = new WebAssembly.Module(b.WebAssembly().get());
const fac = (new WebAssembly.Instance(m)).exports.fac;
assert.eq(fac(0), 1);
assert.eq(fac(1), 1);
assert.eq(fac(2), 2);
assert.eq(fac(4), 24);
assert.throws(() => fac(1e7), RangeError, "Maximum call stack size exceeded.");
