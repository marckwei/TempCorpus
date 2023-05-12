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
builder.addGlobal(kWasmI32, 1);
builder.addFunction(undefined, kSig_v_i)
  .addLocals(kWasmI32, 5)
  .addBody([
// signature: v_i
// body:
kExprGlobalGet, 0x00,  // global.get
kExprI32Const, 0x10,  // i32.const
kExprI32Sub,  // i32.sub
kExprLocalTee, 0x02,  // local.tee
kExprGlobalSet, 0x00,  // global.set
kExprBlock, kWasmVoid,  // block @12
  kExprLocalGet, 0x00,  // local.get
  kExprI32LoadMem, 0x02, 0x00,  // i32.load
  kExprI32Eqz,  // i32.eqz
  kExprIf, kWasmVoid,  // if @20
    kExprLocalGet, 0x02,  // local.get
    kExprI32Const, 0x00,  // i32.const
    kExprI32StoreMem, 0x02, 0x0c,  // i32.store
    kExprLocalGet, 0x00,  // local.get
    kExprI32Const, 0x20,  // i32.const
    kExprI32Add,  // i32.add
    kExprLocalSet, 0x05,  // local.set
    kExprLocalGet, 0x00,  // local.get
    kExprI32Const, 0x00,  // i32.const
    kExprI32Const, 0x01,  // i32.const
    kAtomicPrefix, kExprI32AtomicCompareExchange, 0x02, 0x20,  // i32.atomic.cmpxchng32
]);
assertThrows(() => builder.toModule(), WebAssembly.CompileError);
