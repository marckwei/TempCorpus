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

const N = 10

let wat = `
(module
    (tag $t0 (param `

for (let i = 0; i < N; ++i)
    wat += `v128 `

wat += `))

    (func $f0 `
for (let i = 0; i < 50; ++i)
    wat += `(local v128) `
for (let i = 0; i < N; ++i)
    wat += `(local $l${i} v128) `

for (let i = 0; i < N; ++i)
    wat += `(local.set $l${i} (v128.const i64x2 0 ${i + 5})) `


for (let i = 0; i < N; ++i)
    wat += `(local.get $l${i}) `

wat += `
        (throw $t0)
    )
    (func $f1 (export "test")
      (try
        (do
            (call $f0))
        (catch $t0
            (return)
        )
      )
      (unreachable)
      (return))
)
`

async function test() {
    const instance = await instantiate(wat, {}, { simd: true, exceptions: true })
    const { test } = instance.exports

    for (let i = 0; i < 10000; ++i) {
        assert.throws(() => test(42), TypeError, "an exported wasm function cannot contain a v128 parameter or return value")
    }
}

assert.asyncTest(test())
