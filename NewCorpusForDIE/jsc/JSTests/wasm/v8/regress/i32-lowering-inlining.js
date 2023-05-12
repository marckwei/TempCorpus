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

// Flags: --no-liftoff --wasm-inlining

// This tests that inlining tolerates multi-return call uses that are not
// projections after Int64Lowering.

load("wasm-module-builder.js");

let builder = new WasmModuleBuilder();

let callee1 = builder.addFunction("callee1", kSig_l_l)
    .addBody([kExprLocalGet, 0, kExprI64Const, 1, kExprI64Add]);

let callee2 = builder.addFunction("callee2", kSig_l_l)
    .addBody([kExprLocalGet, 0, kExprI64Const, 1, kExprI64Sub]);

builder.addFunction("caller", kSig_l_l)
    .addBody([kExprLocalGet, 0,
              kExprI64Const, 0,
              kExprI64GtS,
              kExprIf, kWasmI64,
                kExprLocalGet, 0, kExprCallFunction, 0,
              kExprElse,
                kExprLocalGet, 0, kExprCallFunction, 1,
              kExprEnd])
    .exportFunc();

let instance = builder.instantiate();
assertEquals(5n, instance.exports.caller(4n));
assertEquals(-9n, instance.exports.caller(-8n));
