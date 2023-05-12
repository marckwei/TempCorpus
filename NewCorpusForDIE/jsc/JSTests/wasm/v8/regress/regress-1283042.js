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
builder.addMemory(16, 32, false);
builder.addFunction(undefined, kSig_i_iii)
  .addBody([
    ...wasmS128Const(new Array(16).fill(0)),        // s128.const
    kSimdPrefix, kExprF64x2ConvertLowI32x4U, 0x01,  // f64x2.convert_low_i32x4_u
    kSimdPrefix, kExprI64x2UConvertI32x4Low, 0x01,  // i64x2.convert_i32x4_low_u
    kSimdPrefix, kExprI64x2BitMask, 0x01,           // i64x2.bitmask
    ...wasmF64Const(0),                             // f64.const
    kNumericPrefix, kExprI32SConvertSatF64,         // i32.trunc_sat_f64_s
    ...wasmI32Const(0),                             // i32.const
    kExprCallFunction, 0,                           // call
    kExprDrop,                                      // drop
    ...wasmI32Const(0),                             // i32.const
    ...wasmI64Const(0),                             // i64.const
    kExprI64StoreMem16, 0x00, 0x00,                 // i64.store16
    ...wasmF32Const(0),                             // f32.const
    kExprF32Sqrt,                                   // f32.sqrt
    kExprI32UConvertF32,                            // i32.trunc_f32_u
]);
builder.toModule();
