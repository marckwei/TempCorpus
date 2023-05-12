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
    (import "memory" "memory" (memory $mem 1))

    (func (export "load_simple") (result i32)
        (v128.load (i32.const 8))
        (i8x16.extract_lane_u 5)
        (return)
    )

    (func (export "load_simple2") (result i32)
        (i64.store (i32.const 0) (i64.const 0xABCD))
        (i64.store (i32.const 8) (i64.const 0xEFBD))

        (v128.load (i32.const 0))
        (i8x16.extract_lane_u 1)

        (return)
    )

    (func (export "store_simple") (result i64)
        (v128.store (i32.const 0) (v128.const i64x2 0xABCD 0xEFBD))

        (i64.load (i32.const 8))

        (return)
    )
)
`

async function test() {
    let memory = new WebAssembly.Memory({ initial: 1, maximum: 1 })
    let u8 = new Uint8Array(memory.buffer);
    const instance = await instantiate(wat, { imports: { ident: (x) => x }, memory: { memory } }, { simd: true })
    function dump() {
        for (let i = 0; i < 16; ++i)
            print(u8[i].toString(16))
    }
    const { 
        load_simple, 
        load_simple2, 
        store_simple,
    } = instance.exports

    function deBruijin() {
        const data = [
            0x00, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 
            0x88, 0x98, 0xA8, 0xB8, 0xC8, 0xD8, 0xE8, 0xF9, 
            0x29, 0x39, 0x59, 0x69, 0x79, 0x9A, 0x9B, 0x9D, 
            0x9E, 0x9F, 0xAA, 0xEB, 0x6B, 0xED, 0xEE, 0xFF
        ]
        for (let i = 0; i < data.length; ++i)
            u8[i] = data[i]
    }

    for (let i = 0; i < 10000; ++i) {
        deBruijin()
        assert.eq(load_simple(), 0xD8)
        assert.eq(load_simple2(), 0xAB)
        assert.eq(store_simple(), 0xEFBDn)
    }
}

assert.asyncTest(test())
