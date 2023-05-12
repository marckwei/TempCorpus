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
    (func (export "test_i32") (local i32 i32)
        i32.const 42
        local.set 1

        block (result i32)
            block (result i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
                local.get 0 ;; 32 locals should use up all GPRs on all platforms
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 1 ;; here's the value we actually care about
            end

            i32.const 1
            i32.add
            br 0
        end

        i32.const 43
        i32.eq
        br_if 0
        unreachable
    )

    (func (export "test_f32") (local f32 f32)
        f32.const 42.0
        local.set 1

        block (result f32)
            block (result f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32 f32)
                local.get 0 ;; 32 locals should use up all FPRs on all platforms
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 0
                local.get 1 ;; here's the value we actually care about
            end
            f32.neg
            br 0
        end

        f32.const -42.0
        f32.eq
        br_if 0
        unreachable
    )
)
`

async function test() {
    const instance = await instantiate(wat, {}, { simd: true });
    const { test_i32, test_f32 } = instance.exports;
    test_i32();
    test_f32();
}

assert.asyncTest(test())
