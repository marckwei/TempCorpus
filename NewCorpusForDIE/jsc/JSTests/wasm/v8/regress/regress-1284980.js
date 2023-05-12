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
builder.addType(makeSig([kWasmI32, kWasmI32, kWasmI32], []));
builder.addType(makeSig([kWasmS128], []));
builder.addType(makeSig([], [kWasmF64, kWasmF64]));
builder.addTag(makeSig([], []));
// Generate function 1 (out of 3).
builder.addFunction(undefined, 0 /* sig */)
  .addLocals(kWasmI32, 2).addLocals(kWasmF32, 1).addLocals(kWasmI32, 1).addLocals(kWasmF64, 1)
  .addBody([
    kExprTry, kWasmVoid,  // try i32
      kExprCallFunction, 2,  // call function #2
      kExprI32Const, 0,  // i32.const
      kExprSelect,  // select
      kExprI32SConvertF64,  // i32.trunc_f64_s
      kExprI32Const, 0x00,  // i32.const
      kSimdPrefix, kExprI8x16Splat,  // i8x16.splat
      kSimdPrefix, kExprS128Store8Lane, 0x00, 0x00, 0x00,  // s128.store8_lane
    kExprCatch, 0,  // catch
    kExprCatchAll,  // catch-all
      kExprEnd,  // end
    kExprI32Const, 0x00,  // i32.const
    kSimdPrefix, kExprI8x16Splat,  // i8x16.splat
    kExprCallFunction, 1,  // call function #1
]);
// Generate function 2 (out of 3).
builder.addFunction(undefined, 1 /* sig */).addBody([kExprUnreachable]);
// Generate function 3 (out of 3).
builder.addFunction(undefined, 2 /* sig */).addBody([kExprUnreachable]);
builder.toModule();
