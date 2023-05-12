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

// Flags: --expose-wasm --experimental-wasm-eh

load("wasm-module-builder.js");

(function TestExportMultiple() {
  let builder = new WasmModuleBuilder();
  let except1 = builder.addTag(kSig_v_v);
  let except2 = builder.addTag(kSig_v_i);
  builder.addExportOfKind("ex1a", kExternalTag, except1);
  builder.addExportOfKind("ex1b", kExternalTag, except1);
  builder.addExportOfKind("ex2", kExternalTag, except2);
  let instance = builder.instantiate();

  assertTrue(Object.prototype.hasOwnProperty.call(instance.exports, 'ex1a'));
  assertTrue(Object.prototype.hasOwnProperty.call(instance.exports, 'ex1b'));
  assertTrue(Object.prototype.hasOwnProperty.call(instance.exports, 'ex2'));
  // FIXME: fix broken v8 wasm exceptions tests
  // assertSame(instance.exports.ex1a, instance.exports.ex1b);
  assertNotSame(instance.exports.ex1a, instance.exports.ex2);
})();

(function TestExportOutOfBounds() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_v);
  builder.addExportOfKind("ex_oob", kExternalTag, except + 1);
  assertThrows(
      () => builder.instantiate(), WebAssembly.CompileError,
      /WebAssembly.Module doesn't parse at byte 31: 0th Export has invalid exception number 1 it exceeds the exception index space 1, named 'ex_oob'/);
})();

(function TestExportSameNameTwice() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_v);
  builder.addExportOfKind("ex", kExternalTag, except);
  builder.addExportOfKind("ex", kExternalTag, except);
  assertThrows(
      () => builder.instantiate(), WebAssembly.CompileError,
      /WebAssembly.Module doesn't parse at byte 30: duplicate export: 'ex'/);
})();

(function TestExportModuleGetExports() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_v);
  builder.addExportOfKind("ex", kExternalTag, except);
  let module = new WebAssembly.Module(builder.toBuffer());

  let exports = WebAssembly.Module.exports(module);
  assertArrayEquals([{ name: "ex", kind: "tag" }], exports);
})();
