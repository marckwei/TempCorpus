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
builder.addMemory(16, 32, false);
builder.addType(makeSig([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]));
// Generate function 1 (out of 4).
builder.addFunction(undefined, 0 /* sig */).addBodyWithEnd([
  // signature: i_iii
  // body:
  kExprI32Const, 0x00,  // i32.const
  kExprMemoryGrow, 0x00,  // memory.grow
  kExprI32Const, 0xd3, 0xe7, 0x03,  // i32.const
  kSimdPrefix, kExprI8x16Splat,  // i8x16.splat
  kExprI32Const, 0x84, 0x80, 0xc0, 0x05,  // i32.const
  kSimdPrefix, kExprI8x16Splat,  // i8x16.splat
  kExprI32Const, 0x84, 0x81, 0x80, 0xc8, 0x01,  // i32.const
  kSimdPrefix, kExprI8x16Splat,  // i8x16.splat
  kExprI32Const, 0x19,  // i32.const
  kSimdPrefix, kExprI8x16Splat,  // i8x16.splat
  kSimdPrefix, kExprI8x16Shuffle,
  0x00, 0x00, 0x17, 0x00, 0x04, 0x04, 0x04, 0x04,
  0x04, 0x10, 0x01, 0x00, 0x04, 0x04, 0x04, 0x04,  // i8x16.shuffle
  kSimdPrefix, kExprI8x16Shuffle,
  0x04, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  // i8x16.shuffle
  kSimdPrefix, kExprI8x16LeU,  // i8x16.le_u
  kSimdPrefix, kExprV128AnyTrue,  // v128.any_true
  kExprMemoryGrow, 0x00,  // memory.grow
  kExprDrop,
  kExprEnd,  // end @233
]);
builder.addExport('main', 0);
builder.instantiate();
