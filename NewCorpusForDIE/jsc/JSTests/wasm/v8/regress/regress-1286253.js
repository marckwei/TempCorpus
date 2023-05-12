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
builder.addFunction(undefined, kSig_i_iii)
  .addBody([
    ...wasmS128Const(new Array(16).fill(0)),    // s128.const
    kSimdPrefix, kExprI8x16ExtractLaneU, 0x00,  // i8x16.extract_lane_u
    ...wasmS128Const(new Array(16).fill(0)),    // s128.const
    kSimdPrefix, kExprF32x4ExtractLane, 0x00,   // f32x4.extract_lane
    kNumericPrefix, kExprI64SConvertSatF32,     // i64.trunc_sat_f32_s
    kExprF32Const, 0x13, 0x00, 0x00, 0x00,      // f32.const
    kNumericPrefix, kExprI64SConvertSatF32,     // i64.trunc_sat_f32_s
    kExprI64Ior,                                // i64.or
    kExprI32ConvertI64,                         // i32.wrap_i64
    ...wasmF32Const(0),                         // f32.const
    kNumericPrefix, kExprI64SConvertSatF32,     // i64.trunc_sat_f32_s
    kExprI32ConvertI64,                         // i32.wrap_i64
    kExprSelect,                                // select
]);
builder.toModule();
