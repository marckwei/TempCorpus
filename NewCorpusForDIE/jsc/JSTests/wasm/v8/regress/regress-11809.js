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

// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//
// Flags: --enable-testing-opcode-in-wasm --nowasm-tier-up
// Flags: --wasm-tier-mask-for-testing=2

load("wasm-module-builder.js");

function InstanceMaker(offset) {
  var builder = new WasmModuleBuilder();
  builder.addMemory(1, 1, false /* exported */);

  var sig_index = builder.addType(makeSig(
      [kWasmI32, kWasmI32, kWasmI32, kWasmI32, kWasmI32, kWasmI32, kWasmI32,
       kWasmI32],
      [kWasmI32]));
  var sig_three = builder.addType(makeSig(
      [kWasmI64, kWasmI64, kWasmI64, kWasmI64, kWasmI64, kWasmI64, kWasmI64,
       kWasmI64],
      []));

  var zero = builder.addFunction("zero", kSig_i_i);
  var one = builder.addFunction("one", sig_index);
  var two = builder.addFunction("two", kSig_v_i);
  var three = builder.addFunction("three", sig_three).addBody([]);

  zero.addBody([kExprLocalGet, 0, kExprI32LoadMem, 0, offset]);

  one.addBody([
    kExprLocalGet, 7,
    kExprCallFunction, zero.index]);

  two.addBody([
      kExprI64Const, 0x81, 0x80, 0x80, 0x80, 0x10,
      kExprI64Const, 0x81, 0x80, 0x80, 0x80, 0x10,
      kExprI64Const, 0x81, 0x80, 0x80, 0x80, 0x10,
      kExprI64Const, 0x81, 0x80, 0x80, 0x80, 0x10,
      kExprI64Const, 0x81, 0x80, 0x80, 0x80, 0x10,
      kExprI64Const, 0x81, 0x80, 0x80, 0x80, 0x10,
      kExprI64Const, 0x81, 0x80, 0x80, 0x80, 0x10,
      kExprI64Const, 0x81, 0x80, 0x80, 0x80, 0x10,
      kExprCallFunction, three.index,
      kExprI32Const, 0,
      kExprI32Const, 0,
      kExprI32Const, 0,
      kExprI32Const, 0,
      kExprI32Const, 0,
      kExprI32Const, 0,
      kExprI32Const, 0,
      kExprI32Const, 0,
      kExprCallFunction, one.index,
      kExprDrop,
    ]).exportFunc();

  return builder.instantiate({});
}

var instance = InstanceMaker(0);
instance.exports.two();

// Regression test for crbug.com/1224882.
var instance_with_offset = InstanceMaker(4);
instance_with_offset.exports.two();
