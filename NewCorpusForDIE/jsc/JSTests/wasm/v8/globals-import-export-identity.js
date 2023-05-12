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
// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

const global1 = new WebAssembly.Global({value: 'i32', mutable: true}, 14);
const global2 = new WebAssembly.Global({value: 'i32', mutable: true}, 15);
const global3 = new WebAssembly.Global({value: 'i32', mutable: true}, 32);

const builder = new WasmModuleBuilder();

// Two additional globals, so that global-index != export-index.
builder.addImportedGlobal('module', 'global1', kWasmI32, true);
builder.addImportedGlobal('module', 'global2', kWasmI32, true);
const globalIndex =
    builder.addImportedGlobal('module', 'global3', kWasmI32, true);
builder.addExportOfKind('exportedGlobal', kExternalGlobal, globalIndex);

const buffer = builder.toBuffer();

const module = new WebAssembly.Module(buffer);
const instance = new WebAssembly.Instance(module, {
  'module': {
    'global1': global1,
    'global2': global2,
    'global3': global3,
  }
});

assertEquals(global3, instance.exports.exportedGlobal);
