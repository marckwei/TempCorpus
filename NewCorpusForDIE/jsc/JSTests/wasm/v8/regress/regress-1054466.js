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
// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-simd

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addType(makeSig([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]));
// Generate function 1 (out of 1).
builder.addFunction(undefined, 0 /* sig */)
  .addLocals(kWasmI32, 2).addLocals(kWasmF32, 2)
  .addBodyWithEnd([
// signature: i_iii
// body:
kExprI32Const, 0x00,  // i32.const
kExprI32Const, 0x00,  // i32.const
kExprI32Const, 0xf9, 0x00,  // i32.const
kExprI32Ior,  // i32.or
kExprI32Eqz,  // i32.eqz
kExprI32Add,  // i32.Add
kSimdPrefix, kExprI32x4Splat,  // i32x4.splat
kExprF32Const, 0x46, 0x5d, 0x00, 0x00,  // f32.const
kExprI32Const, 0x83, 0x01,  // i32.const
kExprI32Const, 0x83, 0x01,  // i32.const
kExprI32Const, 0x83, 0x01,  // i32.const
kExprI32Add,  // i32.Add
kExprI32Add,  // i32.Add
kExprIf, kWasmI32,  // if @33 i32
  kExprI32Const, 0x00,  // i32.const
kExprElse,  // else @37
  kExprI32Const, 0x00,  // i32.const
  kExprEnd,  // end @40
kExprIf, kWasmI32,  // if @41 i32
  kExprI32Const, 0x00,  // i32.const
kExprElse,  // else @45
  kExprI32Const, 0x00,  // i32.const
  kExprEnd,  // end @48
kExprF32ReinterpretI32,  // f32.reinterpret_i32
kExprF32Max,  // f32.max
kSimdPrefix, kExprF32x4Splat,  // f32x4.splat
kExprI32Const, 0x83, 0x01,  // i32.const
kSimdPrefix, kExprI32x4Splat,  // i32x4.splat
kSimdPrefix, kExprI32x4Eq,  // i32x4.eq
kSimdPrefix, kExprI32x4Eq,  // i32x4.eq
kSimdPrefix, kExprV128AnyTrue,  // v128.any_true
kExprEnd,  // end @64
]);
builder.addExport('main', 0);
const instance = builder.instantiate();
instance.exports.main(1, 2, 3);
