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
// Exception: CompileError: WebAssembly.Module doesn't parse at byte 35: init_expr should end with end, ended with 35 (evaluating 'new WebAssembly.Module(this.toBuffer(debug))')
//  Module@[native code]
//  toModule@.tests/wasm.yaml/wasm/v8/wasm-module-builder.js:2082:34
//  instantiate@.tests/wasm.yaml/wasm/v8/wasm-module-builder.js:2071:31
//  ExtendedConstantsTestI32@extended-constants.js:43:37
//  global code@extended-constants.js:46:3

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-extended-const

load("wasm-module-builder.js");

(function ExtendedConstantsTestI32() {
  // print(arguments.callee.name);

  let builder = new WasmModuleBuilder();

  let imported_global_0 = builder.addImportedGlobal("m", "g0", kWasmI32, false);
  let imported_global_1 = builder.addImportedGlobal("m", "g1", kWasmI32, false);

  let defined_global = builder.addGlobal(
    kWasmI32, false,
    [kExprGlobalGet, imported_global_0, kExprGlobalGet, imported_global_1,
     kExprGlobalGet, imported_global_0, ...wasmI32Const(1),
     kExprI32Sub, kExprI32Mul, kExprI32Add]);

  builder.addExportOfKind("global", kExternalGlobal, defined_global.index);

  let value0 = 123;
  let value1 = -450;

  let global_obj0 = new WebAssembly.Global({value: "i32", mutable: false},
                                           value0);
  let global_obj1 = new WebAssembly.Global({value: "i32", mutable: false},
                                           value1);

  let instance = builder.instantiate({m : {g0: global_obj0, g1: global_obj1}});

  assertEquals(value0 + (value1 * (value0 - 1)), instance.exports.global.value);
})();

(function ExtendedConstantsTestI64() {
  // print(arguments.callee.name);

  let builder = new WasmModuleBuilder();

  let imported_global_0 = builder.addImportedGlobal("m", "g0", kWasmI64, false);
  let imported_global_1 = builder.addImportedGlobal("m", "g1", kWasmI64, false);

  let defined_global = builder.addGlobal(
    kWasmI64, false,
    [kExprGlobalGet, imported_global_0, kExprI64Const, 1, kExprI64Sub,
     kExprGlobalGet, imported_global_1, kExprI64Mul,
     kExprGlobalGet, imported_global_0, kExprI64Add]);

  builder.addExportOfKind("global", kExternalGlobal, defined_global.index);

  let value0 = 123n;
  let value1 = -450n;

  let global_obj0 = new WebAssembly.Global({value: "i64", mutable: false},
                                           value0);
  let global_obj1 = new WebAssembly.Global({value: "i64", mutable: false},
                                           value1);

  let instance = builder.instantiate({m : {g0: global_obj0, g1: global_obj1}});

  assertEquals(value0 + (value1 * (value0 - 1n)),
               instance.exports.global.value);
})();
