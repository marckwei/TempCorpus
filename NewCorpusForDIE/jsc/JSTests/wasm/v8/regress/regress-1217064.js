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

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addMemory(16, 32, false);
builder.addType(makeSig([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]));
builder.addFunction(undefined, 0 /* sig */).addBody([
  kExprI64Const,    0x7a,                          // i64.const
  kExprI64Const,    0x42,                          // i64.const
  kExprI64Const,    0xb4, 0xbd, 0xeb, 0xb5, 0x72,  // i64.const
  kExprI32Const,    0x37,                          // i32.const
  kExprI32Const,    0x67,                          // i32.const
  kExprI32Const,    0x45,                          // i32.const
  kExprLoop,        0,                             // loop
  kExprLocalGet,    0,                             // local.get
  kExprBrIf,        1,                             // br_if depth=1
  kExprLocalGet,    1,                             // local.get
  kExprLocalGet,    0,                             // local.get
  kExprMemorySize,  0,                             // memory.size
  kExprLocalTee,    0,                             // local.tee
  kExprLocalGet,    0,                             // local.get
  kExprBrIf,        0,                             // br_if depth=0
  kExprUnreachable,                                // unreachable
  kExprEnd,                                        // end
  kExprUnreachable,                                // unreachable
]);
builder.addExport('main', 0);
const instance = builder.instantiate();
assertEquals(16, instance.exports.main(0, 0, 0));
