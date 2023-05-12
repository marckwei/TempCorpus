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

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addType(makeSig([], [kWasmS128, kWasmF64, kWasmS128, kWasmF64, kWasmF64, kWasmF32, kWasmF64, kWasmS128, kWasmF32]));
builder.addFunction('foo', kSig_v_v)
  .addBody([
kExprBlock, /* sig */ 0,                                          // block
  kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // f64.const
  kExprI32Const, 0x00,                                            // i32.const
  kSimdPrefix, kExprI8x16Splat,                                   // i8x16.splat
  kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // f64.const
  kExprI32Const, 0x00,                                            // i32.const
  kSimdPrefix, kExprI8x16Splat,                                   // i8x16.splat
  kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // f64.const
  kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // f64.const
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,                          // f32.const
  kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // f64.const
  kExprI32Const, 0x00,                                            // i32.const
  kSimdPrefix, kExprI8x16Splat,                                   // i8x16.splat
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,                          // f32.const
  kExprBr, 0,                                                     // br depth=0
  kExprUnreachable,                                               // unreachable
  kExprEnd,                                                       // end
kExprUnreachable,                                                 // unreachable
]);
builder.toModule();
