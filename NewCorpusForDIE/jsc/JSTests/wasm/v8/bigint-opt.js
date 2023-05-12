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
// call to %OptimizeFunctionOnNextCall()
// call to %PrepareFunctionForOptimization()

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax --turbofan --no-always-turbofan --turbo-inline-js-wasm-calls

load("wasm-module-builder.js");

let builder = new WasmModuleBuilder();

builder
    .addFunction("f", kSig_v_l) // i64 -> ()
    .addBody([])
    .exportFunc();

let module = builder.instantiate();

function TestBigIntTruncatedToWord64(x) {
  return module.exports.f(x + x);
}

let bi = (2n ** (2n ** 29n + 2n ** 29n - 1n));

// Expect BigIntTooBig for adding bi to itself
assertThrows(() => TestBigIntTruncatedToWord64(bi), RangeError);

%PrepareFunctionForOptimization(TestBigIntTruncatedToWord64);
TestBigIntTruncatedToWord64(1n);
TestBigIntTruncatedToWord64(2n);
%OptimizeFunctionOnNextCall(TestBigIntTruncatedToWord64);

// After optimization, bi should be checked as BigInt and
// truncated to Word64, which is then passed to Int64Add.
// Thus no BigIntTooBig exception is expected.
TestBigIntTruncatedToWord64(bi);
assertOptimized(TestBigIntTruncatedToWord64);
