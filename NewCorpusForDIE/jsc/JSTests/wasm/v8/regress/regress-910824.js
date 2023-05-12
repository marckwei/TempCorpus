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
builder.addGlobal(kWasmI32, 1);
builder.addGlobal(kWasmF32, 1);
builder.addType(makeSig([kWasmI32, kWasmF32, kWasmF32, kWasmF64], [kWasmI32]));
builder.addFunction(undefined, 0 /* sig */)
  .addLocals(kWasmI32, 504)
  .addBody([
kExprGlobalGet, 0x00,
kExprLocalSet, 0x04,
kExprLocalGet, 0x04,
kExprI32Const, 0x01,
kExprI32Sub,
kExprGlobalGet, 0x00,
kExprI32Const, 0x00,
kExprI32Eqz,
kExprGlobalGet, 0x00,
kExprI32Const, 0x01,
kExprI32Const, 0x01,
kExprI32Sub,
kExprGlobalGet, 0x00,
kExprI32Const, 0x00,
kExprI32Eqz,
kExprGlobalGet, 0x00,
kExprI32Const, 0x00,
kExprI32Const, 0x01,
kExprI32Sub,
kExprGlobalGet, 0x01,
kExprUnreachable,
]);
builder.instantiate();
