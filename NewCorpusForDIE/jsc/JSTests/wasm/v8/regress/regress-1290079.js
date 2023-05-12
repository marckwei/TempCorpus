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
// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --no-liftoff --turbo-force-mid-tier-regalloc

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addFunction(undefined, makeSig([], [kWasmS128]))
  .addBody([
...wasmS128Const(new Array(16).fill(0)),  // s128.const
...wasmS128Const(new Array(16).fill(0)),  // s128.const
...wasmS128Const(new Array(16).fill(0)),  // s128.const
kExprI32Const, 0x00,  // i32.const
kSimdPrefix, kExprI8x16ReplaceLane, 0x00,  // i8x16.replace_lane
kSimdPrefix, kExprI8x16GtS,  // i8x16.gt_s
kSimdPrefix, kExprI16x8Ne,  // i16x8.ne
...wasmS128Const(new Array(16).fill(1)),  // s128.const
kExprI32Const, 0x00,  // i32.const
kSimdPrefix, kExprI8x16ReplaceLane, 0x00,  // i8x16.replace_lane
kExprI32Const, 0x00,  // i32.const
kSimdPrefix, kExprI8x16ReplaceLane, 0x00,  // i8x16.replace_lane
...wasmS128Const(new Array(16).fill(2)),  // s128.const
kSimdPrefix, kExprI16x8Eq,  // i16x8.eq
kSimdPrefix, kExprI16x8Ne,  // i16x8.ne
...wasmS128Const(new Array(16).fill(1)),  // s128.const
...wasmS128Const(new Array(16).fill(1)),  // s128.const
...wasmS128Const(new Array(16).fill(0)),  // s128.const
kSimdPrefix, kExprI16x8AddSatU, 0x01,  // i16x8.add_sat_u
...wasmS128Const(new Array(16).fill(0)),  // s128.const
...wasmS128Const(new Array(16).fill(0)),  // s128.const
kSimdPrefix, kExprI16x8Sub, 0x01,  // i16x8.sub
kSimdPrefix, kExprI64x2ExtMulHighI32x4U, 0x01,  // i64x2.extmul_high_i32x4_u
kSimdPrefix, kExprI64x2ExtMulLowI32x4S, 0x01,  // i64x2.extmul_low_i32x4_s
kExprF32Const, 0x00, 0x00, 0x00, 0x00,  // f32.const
kExprF32Const, 0x00, 0x00, 0x00, 0x00,  // f32.const
kExprF32Mul,  // f32.mul
kExprF32Const, 0x00, 0x00, 0x00, 0x00,  // f32.const
...wasmS128Const(new Array(16).fill(0)),  // s128.const
kSimdPrefix, kExprI16x8ExtractLaneS, 0x00,  // i16x8.extract_lane_s
kExprSelect,  // select
kNumericPrefix, kExprI32SConvertSatF32,  // i32.trunc_sat_f32_s
kSimdPrefix, kExprI8x16ReplaceLane, 0x00,  // i8x16.replace_lane
kSimdPrefix, kExprI16x8Ne,  // i16x8.ne
]);
builder.toModule();
