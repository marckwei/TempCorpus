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

// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('wasm-module-builder.js');

var builder = new WasmModuleBuilder();
builder.addFunction('test', kSig_i_iii)
    .addBodyWithEnd([
      kExprI32Const, 0x00,  // i32.const 0
      kExprI32Const, 0x00,  // i32.const 0
      kExprI32Add,          // i32.add -> 0
      kExprI32Const, 0x00,  // i32.const 0
      kExprI32Const, 0x00,  // i32.const 0
      kExprI32Add,          // i32.add -> 0
      kExprI32Add,          // i32.add -> 0
      kExprI32Const, 0x01,  // i32.const 1
      kExprI32Const, 0x00,  // i32.const 0
      kExprI32Add,          // i32.add -> 1
      kExprBlock,    0x7f,  // @39 i32
      kExprI32Const, 0x00,  // i32.const 0
      kExprBr,       0x00,  // depth=0
      kExprEnd,             // @90
      kExprI32Add,          // i32.add -> 1
      kExprI32Add,          // i32.add -> 1
      kExprEnd
    ])
    .exportFunc();
var module = builder.instantiate();
assertEquals(1, module.exports.test());
