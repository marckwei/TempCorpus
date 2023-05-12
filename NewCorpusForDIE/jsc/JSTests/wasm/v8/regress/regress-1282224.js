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
builder.addType(makeSig([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]));
builder.addFunction(undefined, 0 /* sig */)
  .addLocals(kWasmS128, 2)
  .addBody([
    ...wasmF32Const(0),                       // f32.const
    ...wasmI32Const(0),                       // f32.const
    kExprF32SConvertI32,                      // f32.convert_i32_s
    kExprLocalGet, 3,                         // local.get
    kSimdPrefix, kExprI64x2AllTrue, 0x01,     // i64x2.all_true
    kExprSelect,                              // select
    kExprLocalGet, 4,                         // local.get
    ...wasmS128Const(new Array(16).fill(0)),  // s128.const
    kSimdPrefix, kExprI8x16Eq,                // i8x16.eq
    kSimdPrefix, kExprI64x2AllTrue, 0x01,     // i64x2.all_true
    kExprF32SConvertI32,                      // f32.convert_i32_s
    ...wasmS128Const(new Array(16).fill(0)),  // s128.const
    kSimdPrefix, kExprI64x2AllTrue, 0x01,     // i64x2.all_true
    kExprSelect,                              // select
    kExprF32Const, 0x00, 0x00, 0x80, 0x3f,    // f32.const
    kExprF32Ge,                               // f32.ge
]);
builder.toModule();
