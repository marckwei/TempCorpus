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
//@ skip
// Skipping this test due to the following issues:
// call to %IsLiftoffFunction()

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax --wasm-dynamic-tiering --liftoff
// Flags: --no-wasm-tier-up
// Make the test faster:
// Flags: --wasm-tiering-budget=1000

// This test busy-waits for tier-up to be complete, hence it does not work in
// predictable more where we only have a single thread.
// Flags: --no-predictable

load("wasm-module-builder.js");

const num_functions = 2;

const builder = new WasmModuleBuilder();
for (let i = 0; i < num_functions; ++i) {
  let kFunction = builder.addFunction('f' + i, kSig_i_v)
    .addBody(wasmI32Const(i))
    .exportAs('f' + i)
}

let instance = builder.instantiate();

// The first few calls happen with Liftoff code.
for (let i = 0; i < 3; ++i) {
  instance.exports.f0();
  instance.exports.f1();
}
assertTrue(%IsLiftoffFunction(instance.exports.f0));
assertTrue(%IsLiftoffFunction(instance.exports.f1));

// Keep calling the function until it gets tiered up.
while (%IsLiftoffFunction(instance.exports.f1)) {
  instance.exports.f1();
}
assertTrue(%IsLiftoffFunction(instance.exports.f0));
