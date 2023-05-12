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

const tag = new WebAssembly.Tag({ parameters: ["i32"] });

let wat = `
(module
    (import "m" "tag" (tag $e-i32 (param i32)))

    (func $test_throw (export "test_throw") (param $sz i32)
        (local $i i32)
        (local.set $i (i32.const 0))

        (loop $loop
            local.get $i
            i32.const 1
            i32.add
            local.set $i

            local.get $i
            local.get $sz
            (if (i32.eq) (then (throw $e-i32 (local.get $i))))

            local.get $i
            i32.const 1000
            i32.lt_s
            br_if $loop)
    )

    (func $test_catch (export "test_catch") (result i32)
        (v128.const i32x4 1337 1337 1337 1337)
        (try
            (do 
                (call $test_throw (i32.const 500)))
        (catch $e-i32
            (i32.const 500)
            (if (i32.ne) (then (unreachable)))
        ))

        (i32x4.extract_lane 3))
)
`

async function test() {
    const instance = await instantiate(wat, { m: { tag } }, { simd: true, exceptions: true })
    const { test_throw, test_catch } = instance.exports

    for (let i = 0; i < 10000; ++i) {
        try {
            test_throw(42)
            assert.truthy(false)
        } catch (e) {
            assert.truthy(e.is(tag))
            assert.eq(e.getArg(tag, 0), 42)
        }
        assert.eq(test_catch(), 1337)
    }
}

assert.asyncTest(test())
