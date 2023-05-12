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

// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addGlobal(kWasmI32, 1);
sig0 = makeSig([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]);
builder.addFunction(undefined, sig0)
  .addBody([
kExprF32Const, 0x01, 0x00, 0x00, 0x00,
kExprF32Const, 0x00, 0x00, 0x00, 0x00,
kExprF32Eq,  // --> i32:0
kExprF32Const, 0xc9, 0xc9, 0x69, 0xc9,
kExprF32Const, 0xc9, 0xc9, 0xc9, 0x00,
kExprF32Eq,  // --> i32:0 i32:0
kExprIf, kWasmF32,
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,
kExprElse,   // @32
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,
  kExprEnd,   // --> i32:0 f32:0
kExprF32Const, 0xc9, 0x00, 0x00, 0x00,
kExprF32Const, 0xc9, 0xc9, 0xc9, 0x00,
kExprF32Const, 0xc9, 0xc9, 0xa0, 0x00, // --> i32:0 f32:0 f32 f32 f32
kExprF32Eq,  // --> i32:0 f32:0 f32 i32:0
kExprIf, kWasmF32,
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,
kExprElse,
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,
  kExprEnd,  // --> i32:0 f32:0 f32 f32:0
kExprF32Eq,  // --> i32:0 f32:0 i32:0
kExprIf, kWasmF32,
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,
kExprElse,
  kExprF32Const, 0x00, 0x00, 0x00, 0x00,
  kExprEnd,   // --> i32:0 f32:0 f32:0
kExprF32Const, 0xc9, 0xc9, 0xff, 0xff,  // --> i32:0 f32:0 f32:0 f32
kExprF32Eq,  // --> i32:0 f32:0 i32:0
kExprDrop,
kExprDrop, // --> i32:0
kExprI32Const, 1, // --> i32:0 i32:1
kExprI32GeU,  // --> i32:0
          ]);
builder.addExport('main', 0);
const instance = builder.instantiate();
assertEquals(0, instance.exports.main(1, 2, 3));
