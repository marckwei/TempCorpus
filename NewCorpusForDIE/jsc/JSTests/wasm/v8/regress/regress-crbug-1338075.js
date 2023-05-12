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

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

let builder = new WasmModuleBuilder();
builder.addMemory(1, 10, true);

builder.addFunction("crash", kSig_i_i)
  .exportFunc()
  .addLocals(kWasmI32, 10)
  .addBody([
    kExprBlock, kWasmVoid,
      kExprLoop, kWasmVoid,
        kExprLoop, kWasmVoid,
          kExprLocalGet, 1,
          kExprLocalGet, 2,
          kExprLocalGet, 3,
          kExprLocalGet, 4,
          kExprLocalGet, 5,
          kExprLocalGet, 6,
          kExprLocalGet, 7,
          kExprLocalGet, 8,
          kExprLocalGet, 9,
          kExprLocalGet, 10,
          kExprDrop,
          kExprDrop,
          kExprDrop,
          kExprDrop,
          kExprDrop,
          kExprDrop,
          kExprDrop,
          kExprDrop,
          kExprDrop,
          kExprDrop,
          kExprLocalGet, 0,
          kExprI32Const, 1,
          kExprI32Sub,
          kExprLocalTee, 0,
          kExprBrTable, 2, 2, 1, 0,
          kExprBr, 0,
        kExprEnd,  // loop
      kExprEnd,  // loop
    kExprEnd,  // block
    kExprLocalGet, 0,
])

let instance = builder.instantiate();
let result = instance.exports.crash(5);
