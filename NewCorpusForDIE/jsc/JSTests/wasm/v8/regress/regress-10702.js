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

// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addGlobal(kWasmI32, true, wasmI32Const(35));
builder.addType(makeSig([], [kWasmI32]));
builder.addType(makeSig([kWasmI32, kWasmI32], [kWasmI32]));
// Generate function 1 (out of 3).
builder.addFunction(undefined, 0 /* sig */).addBody([
  // signature: i_v
  // body:
  kExprI32Const, 1,  // i32.const
]);
// Generate function 2 (out of 3).
builder.addFunction(undefined, 0 /* sig */).addBody([
  // signature: i_v
  // body:
  kExprI32Const, 0,  // i32.const
]);
// Generate function 3 (out of 3).
builder.addFunction(undefined, 1 /* sig */).addBody([
  // signature: i_ii
  // body:
  kExprBlock, kWasmI32,                   // block @1 i32
  kExprF64Const, 0, 0, 0, 0, 0, 0, 0, 0,  // f64.const
  kExprI32SConvertF64,                    // i32.trunc_f64_s
  kExprCallFunction, 1,                   // call function #1: i_v
  kExprBrIf, 0,                           // br_if depth=0
  kExprGlobalGet, 0,                      // global.get
  kExprCallFunction, 0,                   // call function #0: i_v
  kExprBrIf, 0,                           // br_if depth=0
  kExprI32ShrS,                           // i32.shr_s
  kExprEnd,                               // end @24
]);
builder.addExport('f', 2);
const instance = builder.instantiate();
assertEquals(35, instance.exports.f(0, 0));
