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
//@ skip if $architecture != "arm64" && $architecture != "x86_64"
// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-simd

load("wasm-module-builder.js");

(function MultiReturnS128Test() {
  // print("MultiReturnS128Test");
  // Most backends only support 2 fp return registers, so the third v128
  // onwards here will written to caller stack slot.
  let builder = new WasmModuleBuilder();
  let sig_v_sssss = builder.addType(
    makeSig([], [kWasmS128, kWasmS128, kWasmS128, kWasmS128, kWasmS128]));
  let sig_iiiiiiiiii_v = builder.addType(
    makeSig([], [kWasmI32, kWasmI32, kWasmI32, kWasmI32, kWasmI32, kWasmI32,
      kWasmI32, kWasmI32, kWasmI32, kWasmI32] ));

  let callee = builder.addFunction("callee", sig_v_sssss)
    .addBody([
      kExprI32Const, 0,
      kSimdPrefix, kExprI32x4Splat,
      kExprI32Const, 1,
      kSimdPrefix, kExprI32x4Splat,
      kExprI32Const, 2,
      kSimdPrefix, kExprI32x4Splat,
      kExprI32Const, 3,
      kSimdPrefix, kExprI32x4Splat,
      kExprI32Const, 4,
      kSimdPrefix, kExprI32x4Splat,
      kExprReturn]);
  // For each v128 on the stack, we return the first and last lane. This help
  // catch bugs with reading/writing the wrong stack slots.
  builder.addFunction("main", sig_iiiiiiiiii_v)
    .addLocals(kWasmI32, 10).addLocals(kWasmS128, 1)
    .addBody([
      kExprCallFunction, callee.index,

      kExprLocalTee, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 0,
      kExprLocalSet, 0,
      kExprLocalGet, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 3,
      kExprLocalSet, 1,

      kExprLocalTee, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 0,
      kExprLocalSet, 2,
      kExprLocalGet, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 3,
      kExprLocalSet, 3,

      kExprLocalTee, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 0,
      kExprLocalSet, 4,
      kExprLocalGet, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 3,
      kExprLocalSet, 5,

      kExprLocalTee, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 0,
      kExprLocalSet, 6,
      kExprLocalGet, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 3,
      kExprLocalSet, 7,

      kExprLocalTee, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 0,
      kExprLocalSet, 8,
      kExprLocalGet, 10,
      kSimdPrefix, kExprI32x4ExtractLane, 3,
      kExprLocalSet, 9,

      // Return all the stored locals.
      kExprLocalGet, 0,
      kExprLocalGet, 1,
      kExprLocalGet, 2,
      kExprLocalGet, 3,
      kExprLocalGet, 4,
      kExprLocalGet, 5,
      kExprLocalGet, 6,
      kExprLocalGet, 7,
      kExprLocalGet, 8,
      kExprLocalGet, 9,
    ])
    .exportAs("main");

  let module = new WebAssembly.Module(builder.toBuffer());
  let instance = new WebAssembly.Instance(module);
  assertEquals(instance.exports.main(), [4, 4, 3, 3, 2, 2, 1, 1, 0, 0]);
})();
