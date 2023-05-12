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
// This uses gc-js-interop-helpers.js which has %calls that haven't been resolved.

// Copyright 2022 the V8 project authors. All rights reserved.
// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-gc --allow-natives-syntax

load("gc-js-interop-helpers.js");

let {struct, array} = CreateWasmObjects();
for (const wasm_obj of [struct, array]) {

  // Test numeric operators.
  testThrowsRepeated(() => ++wasm_obj, TypeError);
  testThrowsRepeated(() => wasm_obj--, TypeError);
  testThrowsRepeated(() => +wasm_obj, TypeError);
  testThrowsRepeated(() => -wasm_obj, TypeError);
  testThrowsRepeated(() => ~wasm_obj, TypeError);
  testThrowsRepeated(() => wasm_obj - 2, TypeError);
  testThrowsRepeated(() => wasm_obj * 2, TypeError);
  testThrowsRepeated(() => wasm_obj / 2, TypeError);
  testThrowsRepeated(() => wasm_obj ** 2, TypeError);
  testThrowsRepeated(() => wasm_obj << 2, TypeError);
  testThrowsRepeated(() => wasm_obj >> 2, TypeError);
  testThrowsRepeated(() => 2 >>> wasm_obj, TypeError);
  testThrowsRepeated(() => 2 % wasm_obj, TypeError);
  testThrowsRepeated(() => wasm_obj | 1, TypeError);
  testThrowsRepeated(() => 1 & wasm_obj, TypeError);
  testThrowsRepeated(() => wasm_obj ^ wasm_obj, TypeError);
  testThrowsRepeated(() => wasm_obj += 1, TypeError);
  let tmp = 1;
  testThrowsRepeated(() => tmp += wasm_obj, TypeError);
  testThrowsRepeated(() => tmp <<= wasm_obj, TypeError);
  testThrowsRepeated(() => tmp &= wasm_obj, TypeError);
  testThrowsRepeated(() => tmp **= wasm_obj, TypeError);

  // Test numeric functions of the global object.
  testThrowsRepeated(() => isFinite(wasm_obj), TypeError);
  testThrowsRepeated(() => isNaN(wasm_obj), TypeError);
  testThrowsRepeated(() => parseFloat(wasm_obj), TypeError);
  testThrowsRepeated(() => parseInt(wasm_obj), TypeError);

  // Test Number.
  repeated(() => assertFalse(Number.isFinite(wasm_obj)));
  repeated(() => assertFalse(Number.isInteger(wasm_obj)));
  repeated(() => assertFalse(Number.isNaN(wasm_obj)));
  repeated(() => assertFalse(Number.isSafeInteger(wasm_obj)));
  testThrowsRepeated(() => Number.parseFloat(wasm_obj), TypeError);
  testThrowsRepeated(() => Number.parseInt(wasm_obj), TypeError);

  // Test BigInt.
  testThrowsRepeated(() => BigInt.asIntN(2, wasm_obj), TypeError);
  testThrowsRepeated(
      () => BigInt.asUintN(wasm_obj, 123n), TypeError);

  // Test Math.
  testThrowsRepeated(() => Math.abs(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.acos(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.acosh(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.asin(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.asinh(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.atan(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.atanh(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.atan2(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.cbrt(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.ceil(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.clz32(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.cos(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.cosh(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.exp(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.expm1(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.floor(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.fround(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.hypot(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.imul(wasm_obj, wasm_obj), TypeError);
  testThrowsRepeated(() => Math.log(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.log1p(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.log10(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.log2(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.max(2, wasm_obj), TypeError);
  testThrowsRepeated(() => Math.min(2, wasm_obj), TypeError);
  testThrowsRepeated(() => Math.pow(2, wasm_obj), TypeError);
  testThrowsRepeated(() => Math.pow(wasm_obj, 2), TypeError);
  testThrowsRepeated(() => Math.round(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.sign(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.sin(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.sinh(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.sqrt(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.tan(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.tanh(wasm_obj), TypeError);
  testThrowsRepeated(() => Math.trunc(wasm_obj), TypeError);

  // Test boolean.
  repeated(() => assertFalse(!wasm_obj));
  repeated(() => assertTrue(wasm_obj ? true : false));
  tmp = true;
  repeated(() => assertSame(wasm_obj, tmp &&= wasm_obj));
  tmp = 0;
  repeated(() => assertSame(wasm_obj, tmp ||= wasm_obj));
  tmp = null;
  repeated(() => assertSame(wasm_obj, tmp ??= wasm_obj));

  // Ensure no statement re-assigned wasm_obj by accident.
  assertTrue(wasm_obj == struct || wasm_obj == array);
}
