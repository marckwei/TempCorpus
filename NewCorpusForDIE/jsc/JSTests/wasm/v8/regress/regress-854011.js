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

// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();
builder.addFunction('main', kSig_d_d)
    .addBody([
      // Call with param 0 (converted to i64), to fill the stack with non-zero
      // values.
      kExprLocalGet, 0, kExprI64SConvertF64,  // arg 0
      kExprLocalGet, 0, kExprI64SConvertF64,  // arg 1
      kExprLocalGet, 0, kExprI64SConvertF64,  // arg 2
      kExprLocalGet, 0, kExprI64SConvertF64,  // arg 3
      kExprLocalGet, 0, kExprI64SConvertF64,  // arg 4
      kExprLocalGet, 0, kExprI64SConvertF64,  // arg 5
      kExprLocalGet, 0, kExprI64SConvertF64,  // arg 6
      kExprLocalGet, 0, kExprI64SConvertF64,  // arg 7
      kExprCallFunction, 1,                   // call #1
      // Now call with 0 constants.
      // The bug was that they were written out as i32 values, thus the upper 32
      // bit were the previous values on that stack memory.
      kExprI64Const, 0,      // i64.const 0  [0]
      kExprI64Const, 0,      // i64.const 0  [1]
      kExprI64Const, 0,      // i64.const 0  [2]
      kExprI64Const, 0,      // i64.const 0  [3]
      kExprI64Const, 0,      // i64.const 0  [4]
      kExprI64Const, 0,      // i64.const 0  [5]
      kExprI64Const, 0,      // i64.const 0  [6]
      kExprI64Const, 0,      // i64.const 0  [7]
      kExprCallFunction, 1,  // call #1
      // Return the sum of the two returned values.
      kExprF64Add
    ])
    .exportFunc();
builder.addFunction(undefined, makeSig(new Array(8).fill(kWasmI64), [kWasmF64]))
    .addBody([
      kExprLocalGet, 7,     // get_local 7 (last parameter)
      kExprF64SConvertI64,  // f64.convert_s/i64
    ]);
const instance = builder.instantiate();
const big_num_1 = 2 ** 48;
const big_num_2 = 2 ** 56 / 3;
assertEquals(big_num_1, instance.exports.main(big_num_1));
assertEquals(big_num_2, instance.exports.main(big_num_2));
