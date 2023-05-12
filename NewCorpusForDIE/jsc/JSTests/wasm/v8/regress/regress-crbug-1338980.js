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

const kSmallValue = 0x02;
const kBigValue = 0x04;  // "Big" is relative.

const min = kExprF64x2Pmin;
const max = kExprF64x2Pmax;

function GetFunctionName(instruction, flags) {
  return [instruction == min ? "min" : "max", flags].join("_");
}

function AddFunction(instruction, flags) {
  // Liftoff's register management won't reuse an input as the output when
  // the same value has another use, such as a local.
  const pin_left = (flags & 1) != 0;
  const pin_right = (flags & 2) != 0;
  // Test both possible permutations of the inputs.
  const small_left = (flags & 4) != 0;
  let body = [].concat(
      [
        kExprI64Const, small_left ? kSmallValue : kBigValue,
        kSimdPrefix, kExprI64x2Splat,
      ],
      pin_left ? [kExprLocalSet, 0,
                  kExprLocalGet, 0] : [],
      [
        kExprI64Const, small_left ? kBigValue : kSmallValue,
        kSimdPrefix,kExprI64x2Splat,
      ],
      pin_right ? [kExprLocalSet, 1,
                   kExprLocalGet, 1] : [],
      [
        kSimdPrefix, instruction, 0x01,
        kSimdPrefix, kExprI64x2ExtractLane, 0x00,
      ]);
  builder.addFunction(GetFunctionName(instruction, flags), kSig_l_v)
      .exportFunc()
      .addLocals(kWasmS128, 2)
      .addBody(body);
}

for (let instruction of [min, max]) {
  for (let flags = 0; flags <= 7; flags++) {
    AddFunction(instruction, flags);
  }
}

let instance = builder.instantiate();

for (let instruction of [min, max]) {
  let expected = instruction == min ? kSmallValue : kBigValue;
  for (let flags = 0; flags <= 7; flags++) {
    let actual = instance.exports[GetFunctionName(instruction, flags)]();
    assertEquals(BigInt(expected), actual);
  }
}
