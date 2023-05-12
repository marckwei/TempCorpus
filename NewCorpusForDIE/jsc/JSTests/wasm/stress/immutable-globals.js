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
    const b = new Builder();
    let cont = b
        .Type().End()
        .Function().End()
        .Global()
            .I32(0, "immutable")
            .I64(0, "immutable")
            .F32(0, "immutable")
            .F64(0, "immutable")
            .RefNull("externref", "immutable")
            .RefNull("funcref", "immutable")
        .End()
        .Export()
            .Global("i32", 0)
            .Global("i64", 1)
            .Global("f32", 2)
            .Global("f64", 3)
            .Global("externref", 4)
            .Global("funcref", 5)
            .Function("getI32")
            .Function("getI64AsI32")
            .Function("getF32")
            .Function("getF64")
            .Function("getExternref")
            .Function("getFuncref")
        .End()
        .Code()
            .Function("getI32", { params: [], ret: "i32" }, [])
                .GetGlobal(0)
                .Return()
            .End()
            .Function("getI64AsI32", { params: [], ret: "i32" }, [])
                .GetGlobal(1)
                .I32WrapI64()
                .Return()
            .End()
            .Function("getF32", { params: [], ret: "f32" }, [])
                .GetGlobal(2)
                .Return()
            .End()
            .Function("getF64", { params: [], ret: "f64" }, [])
                .GetGlobal(3)
                .Return()
            .End()
            .Function("getExternref", { params: [], ret: "externref" }, [])
                .GetGlobal(4)
                .Return()
            .End()
            .Function("getFuncref", { params: [], ret: "funcref" }, [])
                .GetGlobal(5)
                .Return()
            .End()
        .End()

    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module);

    for (var i = 0; i < 1e3; ++i) {
        {
            let binding = instance.exports.i32;
            assert.eq(binding.value, 0);
            assert.eq(instance.exports.getI32(), 0);
            assert.throws(() => binding.value = 42, TypeError, `WebAssembly.Global.prototype.value attempts to modify immutable global value`);
            assert.eq(binding.value, 0);
            assert.eq(instance.exports.getI32(), 0);
        }
        {
            let binding = instance.exports.f32;
            assert.eq(binding.value, 0);
            assert.eq(instance.exports.getF32(), 0);
            assert.throws(() => binding.value = 42.5, TypeError, `WebAssembly.Global.prototype.value attempts to modify immutable global value`);
            assert.eq(binding.value, 0);
            assert.eq(instance.exports.getF32(), 0);
        }
        {
            let binding = instance.exports.f64;
            assert.eq(binding.value, 0);
            assert.eq(instance.exports.getF64(), 0);
            assert.throws(() => binding.value = 42.5, TypeError, `WebAssembly.Global.prototype.value attempts to modify immutable global value`);
            assert.eq(binding.value, 0);
            assert.eq(instance.exports.getF64(), 0);
        }
        {
            let binding = instance.exports.i64;
            assert.eq(binding.value, 0n);
            assert.throws(() => binding.value = 42n, TypeError, `WebAssembly.Global.prototype.value attempts to modify immutable global value`);
            assert.eq(instance.exports.getI64AsI32(), 0);
        }
        {
            let binding = instance.exports.externref;
            assert.eq(binding.value, null);
            assert.eq(instance.exports.getExternref(), null);

            let list = [
                undefined,
                null,
                0,
                5.4,
                "Hey",
                {},
                function () { },
                Symbol("Cocoa"),
                false,
            ];
            for (let value of list) {
                assert.throws(() => binding.value = value, TypeError, `WebAssembly.Global.prototype.value attempts to modify immutable global value`);
                assert.eq(binding.value, null);
            }
        }
        {
            let binding = instance.exports.funcref;
            assert.eq(binding.value, null);
            assert.eq(instance.exports.getFuncref(), null);

            let list = [
                undefined,
                0,
                5.4,
                "Hey",
                {},
                function () { },
                Symbol("Cocoa"),
                false,
            ];
            for (let value of list) {
                assert.throws(() => binding.value = value, TypeError, `WebAssembly.Global.prototype.value attempts to modify immutable global value`);
                assert.eq(binding.value, null);
            }
        }
    }
}
