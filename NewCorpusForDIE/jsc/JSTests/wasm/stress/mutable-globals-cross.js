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
    const global = new WebAssembly.Global({ value: 'i32', mutable: true }, 42);
    const instance1 = (function () {
        const b = new Builder();
        let cont = b
            .Type().End()
            .Import()
                .Global()
                    .I32("imp", "i32", "mutable")
                .End()
            .End()
            .Function().End()
            .Export()
                .Global("i32", 0)
                .Function("getI32")
                .Function("setI32")
            .End()
            .Code()
                .Function("getI32", { params: [], ret: "i32" }, [])
                    .GetGlobal(0)
                    .Return()
                .End()
                .Function("setI32", { params: ["i32"], ret: "void" }, [])
                    .GetLocal(0)
                    .SetGlobal(0)
                    .Return()
                .End()
            .End()

        const bin = b.WebAssembly().get();
        const module = new WebAssembly.Module(bin);
        return new WebAssembly.Instance(module, {
            imp: {
                i32: global
            }
        });
    }());
    const instance2 = (function () {
        const b = new Builder();
        let cont = b
            .Type().End()
            .Import()
                .Global()
                    .I32("imp", "i32", "mutable")
                .End()
            .End()
            .Function().End()
            .Export()
                .Global("i32", 0)
                .Function("getI32")
                .Function("setI32")
            .End()
            .Code()
                .Function("getI32", { params: [], ret: "i32" }, [])
                    .GetGlobal(0)
                    .Return()
                .End()
                .Function("setI32", { params: ["i32"], ret: "void" }, [])
                    .GetLocal(0)
                    .SetGlobal(0)
                    .Return()
                .End()
            .End()

        const bin = b.WebAssembly().get();
        const module = new WebAssembly.Module(bin);
        return new WebAssembly.Instance(module, {
            imp: {
                i32: global
            }
        });
    }());

    assert.eq(global.value, 42);

    for (var i = 0; i < 1e3; ++i) {
        let binding1 = instance1.exports.i32;
        let binding2 = instance2.exports.i32;
        assert.eq(binding1.value, 42);
        assert.eq(binding2.value, 42);
        assert.eq(instance1.exports.getI32(), 42);
        assert.eq(instance2.exports.getI32(), 42);
        assert.eq(global.value, 42);

        binding1.value = 41;
        assert.eq(binding1.value, 41);
        assert.eq(binding2.value, 41);
        assert.eq(instance1.exports.getI32(), 41);
        assert.eq(instance2.exports.getI32(), 41);
        assert.eq(global.value, 41);

        binding2.value = -40;
        assert.eq(binding1.value, -40);
        assert.eq(binding2.value, -40);
        assert.eq(instance1.exports.getI32(), -40);
        assert.eq(instance2.exports.getI32(), -40);
        assert.eq(global.value, -40);

        instance1.exports.setI32(20);
        assert.eq(instance1.exports.getI32(), 20);
        assert.eq(instance2.exports.getI32(), 20);
        assert.eq(binding1.value, 20);
        assert.eq(binding2.value, 20);
        assert.eq(global.value, 20);

        instance2.exports.setI32(1000);
        assert.eq(instance1.exports.getI32(), 1000);
        assert.eq(instance2.exports.getI32(), 1000);
        assert.eq(binding1.value, 1000);
        assert.eq(binding2.value, 1000);
        assert.eq(global.value, 1000);

        binding1.value = 42;
    }
}
