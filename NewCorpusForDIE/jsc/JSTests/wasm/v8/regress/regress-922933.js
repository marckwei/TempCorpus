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

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
const sig = builder.addType(makeSig([kWasmI64], [kWasmI64]));
builder.addFunction(undefined, sig)
  .addLocals(kWasmI32, 14).addLocals(kWasmI64, 17).addLocals(kWasmF32, 14)
  .addBody([
    kExprBlock, kWasmVoid,
      kExprBr, 0x00,
      kExprEnd,
    kExprBlock, kWasmVoid,
      kExprI32Const, 0x00,
      kExprLocalSet, 0x09,
      kExprI32Const, 0x00,
      kExprIf, kWasmVoid,
        kExprBlock, kWasmVoid,
          kExprI32Const, 0x00,
          kExprLocalSet, 0x0a,
          kExprBr, 0x00,
          kExprEnd,
        kExprBlock, kWasmVoid,
          kExprBlock, kWasmVoid,
            kExprLocalGet, 0x00,
            kExprLocalSet, 0x12,
            kExprBr, 0x00,
            kExprEnd,
          kExprLocalGet, 0x16,
          kExprLocalSet, 0x0f,
          kExprLocalGet, 0x0f,
          kExprLocalSet, 0x17,
          kExprLocalGet, 0x0f,
          kExprLocalSet, 0x18,
          kExprLocalGet, 0x17,
          kExprLocalGet, 0x18,
          kExprI64ShrS,
          kExprLocalSet, 0x19,
          kExprUnreachable,
          kExprEnd,
        kExprUnreachable,
      kExprElse,
        kExprUnreachable,
        kExprEnd,
      kExprUnreachable,
      kExprEnd,
    kExprUnreachable
]);
builder.instantiate();
