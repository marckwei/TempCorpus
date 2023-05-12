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
// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-simd

load('wasm-module-builder.js');

// Regression test to exercise Liftoff's i64x2.shr_s codegen, which back up rcx
// to a scratch register, and immediately overwrote the backup, then later
// restoring the incorrect value. See https://crbug.com/v8/10752 and
// https://crbug.com/1111522 for more.
const builder = new WasmModuleBuilder();
// i64x2.shr_s shifts a v128 (with all bits set), by 1, then drops the result.
// The function returns param 2, which should be unmodified.
builder.addFunction(undefined, kSig_i_iii).addBodyWithEnd([
  kSimdPrefix, kExprS128Const, ...new Array(16).fill(0xff),
  kExprI32Const, 0x01,
  kSimdPrefix, kExprI64x2ShrS, 0x01,
  kExprDrop,
  kExprLocalGet, 0x02,
  kExprEnd,
]);
builder.addExport('main', 0);
const instance = builder.instantiate();
assertEquals(3, instance.exports.main(1, 2, 3));
