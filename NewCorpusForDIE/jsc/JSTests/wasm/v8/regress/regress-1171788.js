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
builder.addType(makeSig(
    [
      kWasmI32, kWasmI32, kWasmI32, kWasmI32, kWasmFuncRef, kWasmI32, kWasmI32,
      kWasmI32, kWasmI32, kWasmI32
    ],
    [kWasmF64]));
// Generate function 1 (out of 1).
builder.addFunction(undefined, 0 /* sig */)
  .addBodyWithEnd([
// signature: d_iiiiniiiii
// body:
kExprLocalGet, 0x03,  // local.get
kExprLocalGet, 0x08,  // local.get
kExprLocalGet, 0x00,  // local.get
kExprI32Const, 0x01,  // i32.const
kExprLocalGet, 0x04,  // local.get
kExprLocalGet, 0x05,  // local.get
kExprLocalGet, 0x06,  // local.get
kExprLocalGet, 0x00,  // local.get
kExprLocalGet, 0x07,  // local.get
kExprLocalGet, 0x06,  // local.get
kExprCallFunction, 0x00,  // call function #0: d_iiiiniiiii
kExprLocalGet, 0x00,  // local.get
kExprLocalGet, 0x01,  // local.get
kExprLocalGet, 0x00,  // local.get
kExprLocalGet, 0x08,  // local.get
kExprLocalGet, 0x01,  // local.get
kExprLocalGet, 0x00,  // local.get
kExprLocalGet, 0x01,  // local.get
kExprLocalGet, 0x07,  // local.get
kExprLocalGet, 0x08,  // local.get
kExprLocalGet, 0x09,  // local.get
kExprCallFunction, 0x00,  // call function #0: d_iiiiniiiii
kExprUnreachable,  // unreachable
kExprEnd,  // end @46
]);
assertThrows(function() { builder.instantiate(); }, WebAssembly.CompileError);
