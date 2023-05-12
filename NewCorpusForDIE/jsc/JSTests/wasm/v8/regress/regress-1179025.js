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

// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --wasm-staging

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addMemory(1, 1, false, true);
builder.addType(makeSig([], []));
builder.addType(makeSig([kWasmI64], [kWasmF32]));
// Generate function 1 (out of 2).
builder.addFunction(undefined, 0 /* sig */)
  .addBodyWithEnd([
// signature: v_v
// body:
kExprNop,  // nop
kExprEnd,  // end @2
]);
// Generate function 2 (out of 2).
builder.addFunction(undefined, 1 /* sig */)
  .addLocals(kWasmI64, 1)
  .addBodyWithEnd([
// signature: f_l
// body:
kExprBlock, kWasmF32,  // block @3 f32
  kExprI32Const, 0x00,  // i32.const
  kExprI32Const, 0x01,  // i32.const
  kExprIf, kWasmI64,  // if @9 i64
    kExprI64Const, 0x00,  // i64.const
  kExprElse,  // else @13
    kExprUnreachable,  // unreachable
    kExprEnd,  // end @15
  kAtomicPrefix, kExprI64AtomicStore, 0x03, 0x04,  // i64.atomic.store64
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,  // f32.const
  kExprEnd,  // end @25
kExprDrop,  // drop
kExprF32Const, 0x00, 0x00, 0x80, 0x51,  // f32.const
kExprEnd,  // end @32
]);
builder.instantiate();
