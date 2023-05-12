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

import { instantiate } from "../wabt-wrapper.js"
import * as assert from "../assert.js"

let wat = `
(module
    (global $1 i64 i64.const 1)
    (global $2 i64 i64.const 2)

    (func $shl (param i64 i64) (result i64)
        local.get 0
        local.get 1
        i64.shl
    )
    (func $shr_s (param i64 i64) (result i64)
        local.get 0
        local.get 1
        i64.shr_s
    )
    (func $shr_u (param i64 i64) (result i64)
        local.get 0
        local.get 1
        i64.shr_u
    )
    (func $rotl (param i64 i64) (result i64)
        local.get 0
        local.get 1
        i64.rotl
    )
    (func $rotr (param i64 i64) (result i64)
        local.get 0
        local.get 1
        i64.rotr
    )
    (func $assert_eq (param i64 i64)
        local.get 0
        local.get 1
        i64.eq
        br_if 0
        unreachable
    )
    (func (export "test_constant")
        global.get $1
        i64.const 63
        i64.shl
        i64.const 0x8000000000000000
        call $assert_eq ;; 1 << 63 == INT64_MIN

        global.get $1
        i64.const 63
        i64.shl
        i64.const 63
        i64.shr_u
        i64.const 1
        call $assert_eq ;; (1u << 63) >> 63 == 1

        global.get $1
        i64.const 63
        i64.shl
        i64.const 63
        i64.shr_s
        i64.const -1
        call $assert_eq ;; (1 << 63) >> 63 == -1
        
        global.get $2
        i64.const 63
        i64.rotl
        i64.const 1
        call $assert_eq ;; 2 rotl 63 == 1
        
        global.get $2
        i64.const 63
        i64.rotr
        i64.const 4
        call $assert_eq ;; 2 rotr 63 == 4

        global.get $1
        i64.const 32
        i64.rotl
        global.get $1
        i64.const 32
        i64.rotr
        call $assert_eq ;; 1 rotl 32 == 1 rotr 32

        global.get $2
        i64.const 32
        i64.rotl
        global.get $2
        i64.const 32
        i64.rotr
        call $assert_eq ;; 2 rotl 32 == 2 rotr 32
    )
    (func (export "test_non_constant")
        global.get $1
        i64.const 63
        call $shl
        i64.const 0x8000000000000000
        call $assert_eq ;; 1 << 63 == INT64_MIN

        global.get $1
        i64.const 63
        call $shl
        i64.const 63
        call $shr_u
        i64.const 1
        call $assert_eq ;; (1u << 63) >> 63 == 1

        global.get $1
        i64.const 63
        call $shl
        i64.const 63
        call $shr_s
        i64.const -1
        call $assert_eq ;; (1 << 63) >> 63 == -1
        
        global.get $2
        i64.const 63
        call $rotl
        i64.const 1
        call $assert_eq ;; 2 rotl 63 == 1
        
        global.get $2
        i64.const 63
        call $rotr
        i64.const 4
        call $assert_eq ;; 2 rotr 63 == 4

        global.get $1
        i64.const 32
        call $rotl
        global.get $1
        i64.const 32
        call $rotr
        call $assert_eq ;; 1 rotl 32 == 1 rotr 32

        global.get $2
        i64.const 32
        call $rotl
        global.get $2
        i64.const 32
        call $rotr
        call $assert_eq ;; 2 rotl 32 == 2 rotr 32
    )
)
`

async function test() {
    const instance = await instantiate(wat, {}, { simd: true });
    const { test_constant, test_non_constant } = instance.exports;
    test_constant();
    test_non_constant();
}

assert.asyncTest(test())
