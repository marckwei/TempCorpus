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
// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

(function duplicateGlobalExportName() {
  var builder = new WasmModuleBuilder();
  builder.addGlobal(kWasmI64, false).exportAs('g');
  builder.addGlobal(kWasmI64, false).exportAs('g');
  assertThrows(
      () => builder.instantiate(), WebAssembly.CompileError,
      /duplicate export: 'g'/);
})();

(function exportNameClashWithFunction() {
  var builder = new WasmModuleBuilder();
  builder.addGlobal(kWasmI64, false).exportAs('foo');
  builder.addFunction('f', kSig_v_v).addBody([]).exportAs('foo');
  assertThrows(
      () => builder.instantiate(), WebAssembly.CompileError,
      /duplicate export: 'foo'/);
})();

(function veryLongExportName() {
  // Regression test for crbug.com/740023.
  var export_name = 'abc';
  while (export_name.length < 8192) {
    export_name = export_name.concat(export_name);
  }
  var builder = new WasmModuleBuilder();
  var global = builder.addGlobal(kWasmI64, false);
  global.exportAs(export_name);
  global.exportAs(export_name);
  var error_msg =
      'duplicate export: ';
  assertThrows(
      () => builder.instantiate(), WebAssembly.CompileError,
      new RegExp(error_msg));
})();
