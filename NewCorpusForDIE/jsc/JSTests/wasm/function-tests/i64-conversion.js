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

const builder = (new Builder())
    .Type().End()
    .Import()
        .Function("import", "sideEffects", {params: [], ret: "void"})
    .End()
    .Function().End()
    .Export()
        .Function("foo")
        .Function("bar")
    .End()
    .Code()
        .Function("foo", {params: ["i64"], ret: "void"})
            .Call(0)
            .Return()
        .End()
        .Function("bar", {params: [], ret: "i64"})
            .Call(0)
            .I32Const(25)
            .I64ExtendUI32()
            .Return()
        .End()
    .End();

const bin = builder.WebAssembly().get();
const module = new WebAssembly.Module(bin);
let called = false;
const imp = {
    import: { 
        sideEffects() { called = true; }
    }
};

const instance = new WebAssembly.Instance(module, imp);
assert.throws(() => instance.exports.foo(20), TypeError, "Invalid argument type in ToBigInt operation");
assert.eq(instance.exports.foo(20n), undefined);
assert.truthy(called);
called = false;
let convertCalled = false;
assert.eq(instance.exports.foo({valueOf() { convertCalled = true; return 20n; }}), undefined);
assert.truthy(convertCalled);
assert.truthy(called);
called = false;
assert.eq(instance.exports.bar(), 25n);
assert.truthy(called, false);
