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
const sig0 = builder.addType(makeSig([kWasmF32], [kWasmI32]));
const sig1 = builder.addType(makeSig([kWasmI64, kWasmI32, kWasmI64, kWasmF32, kWasmI64], [kWasmF32]));
const sig2 = builder.addType(makeSig([kWasmF32], [kWasmF32]));
// Generate function 1 (out of 3).
builder.addFunction(undefined, sig0).addBody([kExprI32Const, 0x00]);
// Generate function 2 (out of 3).
builder.addFunction(undefined, sig1)
  .addBody([
    // signature: f_lilfl
    kExprBlock, kWasmF32,   // @1 f32
    kExprI32Const, 0x00,
    kExprIf, kWasmVoid,   // @5
      kExprLoop, kWasmVoid,   // @7
        kExprBlock, kWasmI32,   // @9 i32
          kExprF32Const, 0x00, 0x00, 0x80, 0xc1,
          kExprF32Const, 0x00, 0x00, 0x80, 0x45,
          kExprCallFunction, 0x00, // function #0: i_f
          kExprBrIf, 0x03,   // depth=3
          kExprDrop,
          kExprI32Const, 0xd8, 0x00,
          kExprEnd,   // @29
        kExprBrIf, 0x00,   // depth=0
        kExprEnd,   // @32
      kExprF32Const, 0x00, 0x00, 0x80, 0x3f,
      kExprF32Const, 0x00, 0x00, 0x80, 0xc6,
      kExprBlock, kWasmI32,   // @43 i32
        kExprF32Const, 0x00, 0x00, 0x80, 0x3f,
        kExprCallFunction, 0x02, // function #2: f_f
        kExprDrop,
        kExprI32Const, 0x68,
        kExprEnd,   // @55
      kExprBrIf, 0x01,   // depth=1
      kExprI32Const, 0x00,
      kExprSelect,
      kExprDrop,
      kExprUnreachable,
    kExprElse,   // @63
      kExprNop,
      kExprEnd,   // @65
    kExprF32Const, 0x00, 0x00, 0x69, 0x43,
    kExprEnd   // @71
]);
// Generate function 3 (out of 3).
builder.addFunction(undefined, sig2).addBody([
  kExprF32Const, 0x00, 0x00, 0x80, 0x3f
]);
builder.instantiate();
