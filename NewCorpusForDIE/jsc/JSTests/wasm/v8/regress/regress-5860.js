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
//
// Flags: --expose-wasm

load('wasm-module-builder.js');

let module1 = (() => {
  let builder = new WasmModuleBuilder();
  builder.addMemory(1, 1);
  builder.addFunction('load', kSig_i_i)
      .addBody([kExprI32Const, 0, kExprI32LoadMem, 0, 0])
      .exportAs('load');
  return new WebAssembly.Module(builder.toBuffer());
})();

let module2 = (() => {
  let builder = new WasmModuleBuilder();
  builder.addMemory(1, 1);
  builder.addImport('A', 'load', kSig_i_i);
  builder.addExportOfKind('load', kExternalFunction, 0);
  return new WebAssembly.Module(builder.toBuffer());
})();

let instance1 = new WebAssembly.Instance(module1);
let instance2 = new WebAssembly.Instance(module2, {A: instance1.exports});

assertEquals(0, instance2.exports.load());
