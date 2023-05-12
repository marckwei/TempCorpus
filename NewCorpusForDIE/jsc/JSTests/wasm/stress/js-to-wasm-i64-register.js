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

import * as assert from '../assert.js';
import Builder from '../Builder.js';

async function test() {
    let params = [];
    for (let i = 0; i < 1; ++i)
        params.push('i64');

    let cont = (new Builder())
        .Type().End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
        .Function("foo", { params: params, ret: "i64" });
    for (let i = 0; i < 1; ++i)
        cont = cont.GetLocal(i);
    let builder = cont.Return()
        .End()
        .End();

    const bin = builder.WebAssembly().get();
    const {instance} = await WebAssembly.instantiate(bin, {});

    for (let i = 0; i < 100000; i++) {
        assert.eq(instance.exports.foo(0n), 0n);
        assert.eq(instance.exports.foo(-1n), -1n);
        assert.eq(instance.exports.foo(0xffffffffn), 0xffffffffn);
        assert.eq(instance.exports.foo(0xffffffffffffffffn), -1n);
        assert.eq(instance.exports.foo(0xffffffffffffffffffffn), -1n);
        assert.eq(instance.exports.foo(-0xffffffffn), -0xffffffffn);
        assert.eq(instance.exports.foo(-0xffffffffffffffffn), 1n);
        assert.eq(instance.exports.foo(-0xffffffffffffffffffffn), 1n);
        assert.eq(instance.exports.foo(0x80000000n), 0x80000000n);
        assert.eq(instance.exports.foo(-0x80000000n), -0x80000000n);
        assert.eq(instance.exports.foo(0x8000000000000000n), -9223372036854775808n);
        assert.eq(instance.exports.foo(-0x8000000000000000n), -0x8000000000000000n);
    }
}

assert.asyncTest(test());
