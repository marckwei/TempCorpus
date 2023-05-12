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

// Flags: --wasm-staging

// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('wasm-module-builder.js')

const builder = new WasmModuleBuilder();
builder.addMemory(0, 0, false);
builder.addType(makeSig([kWasmF32, kWasmF32, kWasmF64], [kWasmF64]));
// Generate function 1 (out of 1).
builder.addFunction(undefined, 0 /* sig */)
  .addBodyWithEnd([
// signature: d_ffdl
// body:
kExprLoop, kWasmF64,   // @15 f64
  kExprLoop, kWasmF64,   // @17 f64
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    kExprI32Const, 0,
    kExprIf, kWasmF64,   // @251 f64
      kExprLoop, kWasmF64,   // @253 f64
        kExprI32Const, 0,
        kExprIf, kWasmI32,   // @267 i32
          kExprMemorySize, 0x00,
          kExprMemoryGrow, 0x00,
        kExprElse,   // @273
          kExprF32Const, 0x00, 0x00, 0x00, 0x00,
          kExprI32SConvertF32,
          kExprEnd,   // @282
        kExprDrop,
        kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        kExprI32Const, 0x00,
        kExprBrIf, 0x01,   // depth=1
        kExprI32SConvertF64,
        kExprF64SConvertI32,
        kExprEnd,   // @311
    kExprElse,   // @312
      kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      kExprEnd,   // @322
    kExprF64Max,
    kExprF64Max,
    kExprF32Const, 0x00, 0x00, 0x00, 0x00,
    kExprF32Const, 0x00, 0x00, 0x00, 0x00,
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    kExprCallFunction, 0x00, // function #0: d_ffdl
    kExprF64Max,
    kExprF64Max,
    kExprF64Max,
    kExprI32Const, 0x00,
    kExprF64SConvertI32,
    kExprF64Const, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    kExprF64Max,
    kExprF64Max,
    kExprEnd,   // @1374
  kExprEnd,   // @1375
kExprEnd,   // @1376
    ]);
builder.addExport('main', 0);
builder.toModule();
