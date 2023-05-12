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

// Flags: --experimental-wasm-threads

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addMemory(1, 1, false, true);
builder.addGlobal(kWasmI32, 1);
builder.addGlobal(kWasmI32, 1);
builder.addType(makeSig([kWasmI32, kWasmI64, kWasmI32], []));
// Generate function 1 (out of 1).
builder.addFunction(undefined, 0 /* sig */)
  .addLocals(kWasmI32, 10)
  .addBodyWithEnd([
// signature: v_ili
// body:
kExprI32Const, 0x00,  // i32.const
kExprLocalSet, 0x04,  // local.set
kExprI32Const, 0x01,  // i32.const
kExprLocalSet, 0x05,  // local.set
kExprBlock, kWasmVoid,  // block @11
  kExprBr, 0x00,  // br depth=0
  kExprEnd,  // end @15
kExprGlobalGet, 0x01,  // global.get
kExprLocalSet, 0x03,  // local.set
kExprLocalGet, 0x03,  // local.get
kExprI32Const, 0x01,  // i32.const
kExprI32Sub,  // i32.sub
kExprLocalSet, 0x06,  // local.set
kExprI64Const, 0x01,  // i64.const
kExprLocalSet, 0x01,  // local.set
kExprI32Const, 0x00,  // i32.const
kExprI32Eqz,  // i32.eqz
kExprLocalSet, 0x07,  // local.set
kExprBlock, kWasmVoid,  // block @36
  kExprBr, 0x00,  // br depth=0
  kExprEnd,  // end @40
kExprGlobalGet, 0x01,  // global.get
kExprLocalSet, 0x08,  // local.set
kExprI32Const, 0x01,  // i32.const
kExprI32Const, 0x01,  // i32.const
kExprI32Sub,  // i32.sub
kExprLocalSet, 0x09,  // local.set
kExprLocalGet, 0x00,  // local.get
kExprLocalSet, 0x0a,  // local.set
kExprGlobalGet, 0x00,  // global.get
kExprLocalSet, 0x0b,  // local.set
kExprI32Const, 0x00,  // i32.const
kExprI32Const, 0x0f,  // i32.const
kExprI32And,  // i32.and
kExprLocalSet, 0x0c,  // local.set
kExprI32Const, 0x00,  // i32.const
kAtomicPrefix, kExprI64AtomicLoad, 0x03, 0x04,  // i64.atomic.load64
kExprDrop,  // drop
kExprUnreachable,  // unreachable
kExprEnd,  // end @75
]);
builder.toModule();
