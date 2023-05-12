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

let wat = `
(module
    (func $js_ident (import "imports" "ident") (param i32) (result i32))

    (func $ident128 (param $f f32) (param $v v128) (result v128)
        (return (local.get $v))
    )

    (func $ident32 (param $f f32) (param $v v128) (result f32)
        (return (local.get $f))
    )

    (func (export "test_wasm_call_clobber_width") (result f32)
        (local $a v128)
        (local $b f32)
        (local.set $a (v128.const f32x4 1 2 3 4))
        (local.set $b (f32.const 1337.0))

        (local.get $b)

        (f32x4.extract_lane 3 
            (call $ident128
                (f32.const 42.42) 
                (v128.const f32x4 5 6 7 8)))

        (call $ident32
            (f32.const 42.0)
            (v128.const f32x4 5 6 7 8))

        (f32x4.extract_lane 3 (local.get $a))

        (f32.add)
        (f32.add)
        (f32.add)
        
        (return)
    )
)
`

async function test() {
    const instance = await instantiate(wat, { imports: { ident: (x) => x } }, { simd: true })
    const { test_wasm_call_clobber_width } = instance.exports

    for (let i = 0; i < 10000; ++i) {
        assert.eq(test_wasm_call_clobber_width(), 1337.0 + 8.0 + 42.0 + 4.0)
    }
}

assert.asyncTest(test())
