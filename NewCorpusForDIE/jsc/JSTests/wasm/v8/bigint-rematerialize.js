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

//@ requireOptions("--useBBQJIT=1", "--useWasmLLInt=1", "--wasmLLIntTiersUpToBBQ=1")
// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax --turbofan --no-always-turbofan --turbo-inline-js-wasm-calls

load("wasm-module-builder.js");

let builder = new WasmModuleBuilder();

builder
    .addFunction("f", kSig_l_v) // () -> i64
    .addBody([
      kExprI64Const, 0,
      kExprI64Const, 1,
      kExprI64Sub, // -1
    ])
    .exportFunc();

let module = builder.instantiate();

function f(x) {
  let y = module.exports.f();
  try {
    return x + y;
  } catch(_) {
    return y;
  }
}

assertEquals(0n, f(1n));
assertEquals(1n, f(2n));
for (var i = 0; i < 10000; ++i) {
    f(1n);
    f(2n);
}
assertEquals(0n, f(1n));
// After optimization, the result of the js wasm call is stored in word64 and
// passed to StateValues without conversion. Rematerialization will happen
// in deoptimizer.
assertEquals(-1n, f(0));
