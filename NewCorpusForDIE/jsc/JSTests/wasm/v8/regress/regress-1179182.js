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
builder.addMemory(28, 32, false);
builder.addFunction(undefined, kSig_i_v)
  .addLocals(kWasmI32, 61)
  .addBody([
kExprI64Const, 0x0,  // i64.const
kExprI32Const, 0x0,  // i32.const
kExprIf, kWasmVoid,  // if
  kExprI32Const, 0x0,  // i32.const
  kExprI32LoadMem, 0x01, 0x23,  // i32.load
  kExprBrTable, 0x01, 0x00, 0x00, // br_table
  kExprEnd,  // end
kExprI64SExtendI16,  // i64.extend16_s
kExprI32Const, 0x00,  // i32.const
kExprLocalGet, 0x00,  // local.get
kExprI32StoreMem16, 0x00, 0x10,  // i32.store16
kExprUnreachable,  // unreachable
]).exportAs('main');
const instance = builder.instantiate();
assertThrows(instance.exports.main, WebAssembly.RuntimeError, /Unreachable/);
