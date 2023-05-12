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
// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-simd --wasm-lazy-compilation

// Test case copied from clusterfuzz, this exercises a bug in WasmCompileLazy
// where we are not correctly pushing the full 128-bits of a SIMD register.
load('wasm-module-builder.js');

const __v_0 = new WasmModuleBuilder();
__v_0.addImportedMemory('m', 'imported_mem');
__v_0.addFunction('main', makeSig([], [])).addBodyWithEnd([
  kExprI32Const, 0, kSimdPrefix, kExprS128LoadMem, 0, 0, kExprCallFunction,
  0x01, kExprEnd
]);
__v_0.addFunction('function2', makeSig([kWasmS128], [])).addBodyWithEnd([
  kExprI32Const, 17, kExprLocalGet, 0, kSimdPrefix, kExprS128StoreMem, 0, 0,
  kExprI32Const, 9, kExprLocalGet, 0, kExprCallFunction, 0x02, kExprEnd
]);
__v_0.addFunction('function3', makeSig([kWasmI32, kWasmS128], []))
    .addBodyWithEnd([
      kExprI32Const, 32, kExprLocalGet, 1, kSimdPrefix, kExprS128StoreMem, 0, 0,
      kExprEnd
    ]);
__v_0.addExport('main');
var __v_1 = new WebAssembly.Memory({
  initial: 1,
});
const __v_2 = __v_0.instantiate({m: {imported_mem: __v_1}});
const __v_3 = new Uint8Array(__v_1.buffer);
for (let __v_4 = 0; __v_4 < 16; __v_4++) {
  __v_3[__v_4] = __v_4 * 2;
}
__v_2.exports.main();
for (let __v_5 = 0; __v_5 < 16; __v_5++) {
  assertEquals(__v_3[__v_5], __v_3[__v_5 + 32]);
}
