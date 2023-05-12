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

(function() {
  const builder = new WasmModuleBuilder();
  builder.addType(makeSig([kWasmF64, kWasmF64, kWasmI32, kWasmI32], [kWasmI32]));
  builder.addType(makeSig([], [kWasmF64]));
  // Generate function 1 (out of 2).
  builder.addFunction(undefined, 0 /* sig */)
    .addBodyWithEnd([
// signature: i_ddii
// body:
kExprI32Const, 0x01,
kExprEnd,   // @3
            ]);
  // Generate function 2 (out of 2).
  builder.addFunction(undefined, 1 /* sig */)
    .addLocals(kWasmF64, 8)
    .addBodyWithEnd([
// signature: d_v
// body:
kExprBlock, kWasmF64,   // @3 f64
  kExprBlock, kWasmVoid,   // @5
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x3f,
    kExprLocalTee, 0x00,
    kExprLocalTee, 0x01,
    kExprLocalTee, 0x02,
    kExprLocalTee, 0x03,
    kExprLocalTee, 0x04,
    kExprLocalTee, 0x05,
    kExprLocalTee, 0x06,
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x3f,
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x3f,
    kExprLocalTee, 0x07,
    kExprI32Const, 0x00,
    kExprIf, kWasmI32,   // @52 i32
      kExprI32Const, 0x00,
    kExprElse,   // @56
      kExprI32Const, 0x00,
      kExprEnd,   // @59
    kExprBrIf, 0x01,   // depth=1
    kExprI32UConvertF64,
    kExprI32Const, 0x00,
    kExprCallFunction, 0x00, // function #0: i_ddii
    kExprDrop,
    kExprUnreachable,
    kExprEnd,   // @70
  kExprUnreachable,
  kExprEnd,   // @72
kExprEnd,   // @73
            ]);
  assertDoesNotThrow(function() { builder.instantiate(); });
})();
