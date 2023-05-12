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

// Flags: --expose-wasm --allow-natives-syntax

load('wasm-module-builder.js');

let importingModuleBinary1 = (() => {
  var builder = new WasmModuleBuilder();
  builder.addImport('', 'f', kSig_i_v);
  return new Int8Array(builder.toBuffer());
})();

let importingModuleBinary2 = (() => {
  var builder = new WasmModuleBuilder();
  builder.addImport('', 'f', kSig_i_v);
  builder.addFunction('g', kSig_v_v)
    .addBody([kExprNop]);
  return new Int8Array(builder.toBuffer());
})();

let importingModuleBinary3 = (() => {
  var builder = new WasmModuleBuilder();
  builder.addImport('', 'f', kSig_i_v);
  builder.addImport('', 'f2', kSig_i_v);
  builder.addFunction('g', kSig_v_v)
    .addBody([kExprNop]);
  return new Int8Array(builder.toBuffer());
})();

let importingModuleBinary4 = (() => {
  var builder = new WasmModuleBuilder();
  builder.addFunction('g', kSig_v_v)
    .addBody([kExprNop]);
  return new Int8Array(builder.toBuffer());
})();

const complexImportingModuleBinary1 = (() => {
  let builder = new WasmModuleBuilder();

  builder.addImport('a', 'b', kSig_v_v);
  builder.addImportedMemory('c', 'd', 1);
  builder.addImportedTable('e', 'f', 1);
  builder.addImportedGlobal('g', '⚡', kWasmI32);
  builder.addFunction('g', kSig_v_v)
    .addBody([kExprNop]);
  return builder.toBuffer();
})();

const complexImportingModuleBinary2 = (() => {
  let builder = new WasmModuleBuilder();

  builder.addImport('a', 'b', kSig_v_v);
  builder.addImportedMemory('c', 'd', 1);
  builder.addImportedTable('e', 'f', 1);
  builder.addImportedGlobal('g', '⚡', kWasmI32);
  builder.addFunction('g', kSig_v_v)
    .addBody([kExprNop]);
  return builder.toBuffer();
})();

var tests = [
  importingModuleBinary1,
  importingModuleBinary2,
  importingModuleBinary3,
  importingModuleBinary4,
  complexImportingModuleBinary1,
  complexImportingModuleBinary2
];

for (var index in tests) {
  assertPromiseResult(
    WebAssembly.compile(tests[index]),
    m => assertTrue(m instanceof WebAssembly.Module),
    assertUnreachable);
}
