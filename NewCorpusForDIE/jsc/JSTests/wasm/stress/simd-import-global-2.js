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

//@ requireOptions("--useWebAssemblySIMD=1")
//@ skip if !$isSIMDPlatform
import { instantiate } from "../wabt-wrapper.js"
import * as assert from "../assert.js"

async function test() {
    assert.throws(() => new WebAssembly.Global({ value: "v128" }), TypeError, "WebAssembly.Global expects its 'value' field to be the string 'i32', 'i64', 'f32', 'f64', 'anyfunc', 'funcref', or 'externref'")
    const exportV128 = await instantiate(`
    (module
        (global (;0;) v128 v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000)
        (export "global" (global 0))
    )`, { }, { simd: true })

    if (typeof WebAssembly.Global.prototype.type !== 'undefined')
        assert.eq(exportV128.exports.global.type().value, "v128")
    assert.throws(() => exportV128.exports.global.value, WebAssembly.RuntimeError, "Cannot get value of v128 global (evaluating 'exportV128.exports.global.value')")

    await instantiate(`
    (module
        (import "x" "v128" (global v128))
    )`, { x: { v128: exportV128.exports.global } }, { simd: true })

    const exportMutV128 = await instantiate(`
    (module
        (global (;0;) (mut v128) v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000)
        (export "global" (global 0))
    )`, { }, { simd: true })
    await instantiate(`
    (module
        (import "x" "v128" (global (mut v128)))
    )`, { x: { v128: exportMutV128.exports.global } }, { simd: true })

    await assert.throwsAsync(instantiate(`
    (module
        (import "x" "v128" (global (mut v128)))
    )`, { x: { v128: exportV128.exports.global } }, { simd: true }), WebAssembly.LinkError, "imported global x:v128 must be a same mutability (evaluating 'new WebAssembly.Instance(module, imports)')")

    await assert.throwsAsync(instantiate(`
    (module
        (import "x" "v128" (global i64))
    )`, { x: { v128: exportV128.exports.global } }, { simd: true }), WebAssembly.LinkError, "imported global x:v128 must be a same type (evaluating 'new WebAssembly.Instance(module, imports)')")

    const exportI64 = await instantiate(`
    (module
        (global i64 i64.const 0)
        (export "global" (global 0))
    )`, { }, { simd: true })
    await assert.throwsAsync(instantiate(`
    (module
        (import "x" "v128" (global v128))
    )`, { x: { v128: exportI64.exports.global } }, { simd: true }), WebAssembly.LinkError, "imported global x:v128 must be a same type (evaluating 'new WebAssembly.Instance(module, imports)')")

    const exportI64Mut = await instantiate(`
    (module
        (global i64 i64.const 0)
        (export "global" (global 0))
    )`, { }, { simd: true })
    await assert.throwsAsync(instantiate(`
    (module
        (import "x" "v128" (global (mut v128)))
    )`, { x: { v128: exportI64Mut.exports.global } }, { simd: true }), WebAssembly.LinkError, "imported global x:v128 must be a same type (evaluating 'new WebAssembly.Instance(module, imports)')")
}

assert.asyncTest(test())