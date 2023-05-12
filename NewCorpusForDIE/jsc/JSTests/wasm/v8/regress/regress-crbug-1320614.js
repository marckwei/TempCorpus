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

// Flags: --expose-gc

load("wasm-module-builder.js");

var builder = new WasmModuleBuilder();
let gc_func = builder.addImport("imports", "gc", { params: [], results: [] });
let callee = builder.addFunction('callee', {
  params: [
    // More tagged parameters than we can pass in registers on any platform.
    kWasmExternRef, kWasmExternRef, kWasmExternRef, kWasmExternRef,
    kWasmExternRef,
    // An untagged parameter to trip up the stack walker.
    kWasmI32, kWasmExternRef,
  ],
  results: [kWasmI64]  // An i64 to trigger replacement.
}).addBody([kExprCallFunction, gc_func, kExprI64Const, 0]);

builder.addFunction("main", { params: [], results: [] }).addBody([
  kExprRefNull, kExternRefCode,
  kExprRefNull, kExternRefCode,
  kExprRefNull, kExternRefCode,
  kExprRefNull, kExternRefCode,
  kExprRefNull, kExternRefCode,
  kExprI32Const, 0xf,
  kExprRefNull, kExternRefCode,
  kExprCallFunction, callee.index, kExprDrop
]).exportFunc();

var instance = builder.instantiate({ imports: { gc: () => { gc(); } } });
instance.exports.main();
