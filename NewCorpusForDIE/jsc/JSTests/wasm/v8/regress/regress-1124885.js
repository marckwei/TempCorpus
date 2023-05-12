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
// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-simd

// This exercises an bug in scalar-lowering for load transforms. In
// particular, if the index input to v128.load32_splat was a extract_lane, the
// input wasn't correctly lowered. This caused the extract_lane node to stick
// around until code-generator, where we hit a mismatch in the register types.
load('wasm-module-builder.js');
(function() {
  const builder = new WasmModuleBuilder();
  builder.addMemory(1, 1);
  builder.addFunction(undefined, kSig_i_ii)
    .addBodyWithEnd([
      kExprI32Const, 0,
      kExprLocalGet, 0,
      kExprI32StoreMem, 0, 0,

      kExprI32Const, 4,
      kExprLocalGet, 0,
      kExprI32StoreMem, 0, 0,

      kExprI32Const, 8,
      kExprLocalGet, 0,
      kExprI32StoreMem, 0, 0,

      kExprI32Const, 12,
      kExprLocalGet, 0,
      kExprI32StoreMem, 0, 0,
      // Memory now looks like (in bytes):
      // [4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0]

      kExprI32Const, 0,
      kSimdPrefix, kExprS128LoadMem, 0, 0,

      kSimdPrefix, kExprI32x4ExtractLane, 0,
      // load 32-bit from byte 4, then splat to all lanes.
      kSimdPrefix, kExprS128Load32Splat, 0, 0,
      kSimdPrefix, kExprI32x4ExtractLane, 3,
      kExprEnd,
    ])
    .exportAs('main');
  const instance = builder.instantiate();
  assertEquals(4, instance.exports.main(4));
})();
