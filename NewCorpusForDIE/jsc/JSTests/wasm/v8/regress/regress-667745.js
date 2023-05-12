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

// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load("wasm-module-builder.js");

(function() {
  var builder = new WasmModuleBuilder();
  builder.addMemory(0, 0, false);
  builder.addFunction("test", kSig_i_iii)
    .addBody([
kExprI32Const, 0x0b,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x67,
kExprI32Const, 0x07,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Eq,
kExprI32RemU,
kExprI32Clz,
kExprI32Const, 0x25,
kExprI32Const, 0x82, 0x6c,
kExprI32Add,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Const, 0x70,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x70,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x67,
kExprI32Clz,
kExprI32Clz,
kExprI32GeS,
kExprI32Const, 0x67,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprDrop,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprCallFunction, 0x00, // function #0
kExprCallFunction, 0x00, // function #0
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Const, 0x01,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprSelect,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x0e,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprCallFunction, 0x00, // function #0
kExprCallFunction, 0x00, // function #0
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Const, 0x01,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprSelect,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x0e,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprCallFunction, 0x00, // function #0
kExprCallFunction, 0x00, // function #0
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Const, 0x01,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprSelect,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x0e,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprCallFunction, 0x00, // function #0
kExprCallFunction, 0x00, // function #0
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Const, 0x01,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprSelect,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x41,
kExprI32Const, 0x0e,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprCallFunction, 0x00, // function #0
kExprCallFunction, 0x00, // function #0
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x4a,
kExprI32Const, 0x41,
kExprI32LtU,
kExprI32Const, 0x67,
kExprI32Clz,
kExprI32GtS,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Ne,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprI32Const, 0x1a,
kExprI32Const, 0x71,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32ShrS,
kExprI32Clz,
kExprCallFunction, 0x00, // function #0
kExprCallFunction, 0x00, // function #0
kExprI32Clz,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Const, 0x4a,
kExprI32Const, 0x41,
kExprI32LtU,
kExprI32Const, 0x67,
kExprI32Clz,
kExprI32GtS,
kExprI32Const, 0x41,
kExprI32Const, 0x41,
kExprI32Ne,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Const, 0x41,
kExprI32Const, 0x1a,
kExprI32Const, 0x71,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32And,
kExprI32ShrS,
kExprI32Clz,
kExprCallFunction, 0x00, // function #0
kExprCallFunction, 0x00, // function #0
kExprI32Clz,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprI32Clz,
kExprUnreachable,
kExprCallFunction, 0x00, // function #0
kExprCallFunction, 0x00, // function #0
kExprNop,
kExprNop,
kExprNop,
kExprNop,
kExprReturn
            ])
            .exportFunc();
  var module = builder.instantiate();
  assertTrue(module != undefined);
})();
