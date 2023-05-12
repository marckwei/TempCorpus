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

const exportingModuleBinary = (() => {
  const builder = new WasmModuleBuilder();
  builder.addFunction('f', kSig_i_v).addBody([kExprI32Const, 42]).exportFunc();
  return builder.toBuffer();
})();

const exportingModule = new WebAssembly.Module(exportingModuleBinary);
const exportingInstance = new WebAssembly.Instance(exportingModule);

const reExportingModuleBinary = (() => {
  const builder = new WasmModuleBuilder();
  const gIndex = builder.addImport('a', 'g', kSig_i_v);
  builder.addExport('y', gIndex);
  return builder.toBuffer();
})();

const module = new WebAssembly.Module(reExportingModuleBinary);
const imports = {
  a: {g: exportingInstance.exports.f},
};
const instance = new WebAssembly.Instance(module, imports);

// Previously exported Wasm functions are re-exported with the same value
assertEquals(instance.exports.y, exportingInstance.exports.f);
