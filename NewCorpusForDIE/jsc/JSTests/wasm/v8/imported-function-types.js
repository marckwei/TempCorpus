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
//@ skip
// Failure:
// Exception: CompileError: WebAssembly.Module doesn't parse at byte 25: can't get 0th argument Type (evaluating 'new WebAssembly.Module(this.toBuffer(debug))')
//  Module@[native code]
//  toModule@.tests/wasm.yaml/wasm/v8/wasm-module-builder.js:2082:34
//  instantiate@.tests/wasm.yaml/wasm/v8/wasm-module-builder.js:2071:31
//  @imported-function-types.js:34:29
//  global code@imported-function-types.js:35:3

// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-typed-funcref

load("wasm-module-builder.js");

var exporting_module = (function() {
  var builder = new WasmModuleBuilder();

  var binaryType = builder.addType(kSig_i_ii);
  var unaryType = builder.addType(kSig_i_i);

  builder.addFunction("func1", makeSig([wasmRefType(binaryType)], [kWasmI32]))
    .addBody([kExprI32Const, 42, kExprI32Const, 12, kExprLocalGet, 0,
              kExprCallRef, binaryType])
    .exportFunc();

  builder.addFunction("func2", makeSig([wasmRefType(unaryType)], [kWasmI32]))
    .addBody([kExprI32Const, 42, kExprLocalGet, 0, kExprCallRef, unaryType])
    .exportFunc();

  return builder.instantiate({});
})();

var importing_module = function(imported_function) {
  var builder = new WasmModuleBuilder();

  var unaryType = builder.addType(kSig_i_i);

  builder.addImport("other", "func",
    makeSig([wasmRefType(unaryType)], [kWasmI32]));

  return builder.instantiate({other: {func: imported_function}});
};

// Same form/different index should be fine.
importing_module(exporting_module.exports.func2);
// Same index/different form should throw.
assertThrows(
    () => importing_module(exporting_module.exports.func1),
    WebAssembly.LinkError,
    /imported function does not match the expected type/);
