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

// Flags: --wasm-staging

// This is a fuzzer-generated test case that exposed a bug in Liftoff that only
// affects ARM, where the fp register aliasing is different from other archs.
// We were inncorrectly clearing the the high fp register in a LiftoffRegList
// indicating registers to load, hitting a DCHECK.
load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addMemory(19, 32, false);
builder.addGlobal(kWasmI32, 0);
builder.addType(makeSig([], []));
builder.addType(makeSig([kWasmI64, kWasmS128, kWasmF32], [kWasmI32]));
// Generate function 1 (out of 5).
builder.addFunction(undefined, 0 /* sig */)
  .addBodyWithEnd([
// signature: v_v
// body:
kExprI32Const, 0x05,  // i32.const
kExprReturn,  // return
kExprUnreachable,  // unreachable
kExprEnd,  // end @5
]);
// Generate function 4 (out of 5).
builder.addFunction(undefined, 1 /* sig */)
  .addBodyWithEnd([
// signature: i_lsf
// body:
kExprLocalGet, 0x01,  // local.get
kExprLocalGet, 0x01,  // local.get
kExprGlobalGet, 0x00,  // global.get
kExprDrop,  // drop
kExprLoop, kWasmVoid,  // loop @8
  kExprLoop, 0x00,  // loop @10
    kExprI32Const, 0x01,  // i32.const
    kExprMemoryGrow, 0x00,  // memory.grow
    kExprI64LoadMem8U, 0x00, 0x70,  // i64.load8_u
    kExprLoop, 0x00,  // loop @19
      kExprCallFunction, 0x00,  // call function #0: v_v
      kExprEnd,  // end @23
    kExprI64Const, 0xf1, 0x24,  // i64.const
    kExprGlobalGet, 0x00,  // global.get
    kExprDrop,  // drop
    kExprBr, 0x00,  // br depth=0
    kExprEnd,  // end @32
  kExprEnd,  // end @33
kExprI32Const, 0x5b,  // i32.const
kExprReturn,  // return
kExprEnd,  // end @37
]);
// Instantiation is enough to cause a crash.
const instance = builder.instantiate();
