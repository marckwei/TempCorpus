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

//@ requireOptions("--useWebAssemblySIMD=1")
//@ skip if !$isSIMDPlatform
// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

let builder = new WasmModuleBuilder();
let sig = makeSig(
  [kWasmS128, kWasmS128, kWasmS128, kWasmF64,  // Use up 7 param registers.
   kWasmS128, kWasmS128,  // Allocated by Liftoff into d8 through d11.
   kWasmS128,  // This will use d7, thinking it's still free.
   kWasmF64],  // This will get d7 as its linkage location.
  [kWasmF64]);

let func = builder.addFunction('crash', sig).addBody([
  kExprLocalGet, 7
]);

builder.addFunction('main', makeSig([], [kWasmF64])).exportFunc().addBody([
  ...wasmS128Const(Math.PI, Math.E),
  ...wasmS128Const(Math.PI, Math.E),
  ...wasmS128Const(Math.PI, Math.E),
  ...wasmF64Const(Infinity),
  ...wasmS128Const(Math.PI, Math.E),
  ...wasmS128Const(Math.PI, Math.E),
  ...wasmS128Const(Math.PI, Math.E),
  ...wasmF64Const(42),
  kExprCallFunction, func.index,
]);

assertEquals(42, builder.instantiate().exports.main());
