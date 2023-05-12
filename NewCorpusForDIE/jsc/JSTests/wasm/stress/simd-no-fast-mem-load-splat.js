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

//@ requireOptions("--useWebAssemblySIMD=1", "--useWebAssemblyFastMemory=0")
//@ skip if !$isSIMDPlatform
import { instantiate } from "../wabt-wrapper.js"
import * as assert from "../assert.js"

 let wat = `
 (module
    (memory 1)

    (data (i32.const 0) "` + String.raw`\00\01\02\03\04\05\06\07\08\09\0A\0B\0C\0D\0E\0F` + `")
    (data (i32.const 65520) "` + String.raw`\10\11\12\13\14\15\16\17\18\19\1A\1B\1C\1D\1E\1F` + `")

    (func (export "v128_load8_splat") (result i32)
        (i8x16.extract_lane_s 0 (v128.load8_splat (i32.const 65535))))

 )
 `

 async function test() {
    const instance = await instantiate(wat, { imports: { } }, { simd: true })

    const {
        v128_load8_splat,
    } = instance.exports

    for (let i = 0; i < 10000; ++i) {
        assert.eq(v128_load8_splat(), 31)
    }
 }

 assert.asyncTest(test())
