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
// Exception: Failure: expected <function () {
//      [native code]
//  }> found <function () {
//      [native code]
//  }>

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

function createExport(fun) {
  let builder = new WasmModuleBuilder();
  let fun_index = builder.addImport("m", "fun", kSig_i_v)
  builder.addExport("fun", fun_index);
  let instance = builder.instantiate({ m: { fun: fun }});
  return instance.exports.fun;
}

// Test that re-exporting a generic JavaScript function changes identity, as
// the resulting export is an instance of {WebAssembly.Function} instead.
(function TestReExportOfJS() {
  // print(arguments.callee.name);
  function fun() { return 7 }
  let exported = createExport(fun);
  assertNotSame(exported, fun);
  assertEquals(7, exported());
  assertEquals(7, fun());
})();

// Test that re-exporting and existing {WebAssembly.Function} that represents
// regular WebAssembly functions preserves identity.
(function TestReReExportOfWasm() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addFunction('fun', kSig_i_v).addBody([kExprI32Const, 9]).exportFunc();
  let fun = builder.instantiate().exports.fun;
  let exported = createExport(fun);
  assertSame(exported, fun);
  assertEquals(9, fun());
})();

// Test that re-exporting and existing {WebAssembly.Function} that represents
// generic JavaScript functions preserves identity.
(function TestReReExportOfJS() {
  // print(arguments.callee.name);
  let fun = createExport(() => 11)
  let exported = createExport(fun);
  assertSame(exported, fun);
  assertEquals(11, fun());
})();
