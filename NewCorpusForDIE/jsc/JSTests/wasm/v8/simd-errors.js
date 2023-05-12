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
//@ skip if $architecture != "arm64" && $architecture != "x86_64"
// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-simd

load("wasm-module-builder.js");

(function TestS128InSignatureThrows() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addFunction('foo', kSig_s_i)
    .addBody([
      kExprLocalGet, 0,
      kSimdPrefix,
      kExprI32x4Splat])
    .exportFunc()
  const instance = builder.instantiate();
  assertThrows(() => instance.exports.foo(33), TypeError);
})();

(function TestS128ParamInSignatureThrows() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addFunction('foo', kSig_i_s)
      .addBody([
          kExprLocalGet, 0,
          kSimdPrefix,
          kExprI32x4ExtractLane, 1])
      .exportFunc();
  const instance = builder.instantiate();
  assertThrows(() => instance.exports.foo(10), TypeError);
})();

(function TestImportS128Return() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addImport('', 'f', makeSig([], [kWasmS128]));
  builder.addFunction('foo', kSig_v_v)
      .addBody([kExprCallFunction, 0, kExprDrop])
      .exportFunc();
  const instance = builder.instantiate({'': {f: _ => 1}});
  assertThrows(() => instance.exports.foo(), TypeError);
})();

(function TestS128ImportThrows() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  let sig_index = builder.addType(kSig_i_i);
  let sig_s128_index = builder.addType(kSig_i_s);
  let index = builder.addImport('', 'func', sig_s128_index);
  builder.addFunction('foo', sig_index)
    .addBody([
      kExprLocalGet, 0,
      kSimdPrefix,
      kExprI32x4Splat,
      kExprCallFunction, index])
    .exportFunc();
  const instance = builder.instantiate({'': {func: _ => {}}});
  assertThrows(() => instance.exports.foo(14), TypeError);
})();

(function TestS128GlobalConstructor() {
  assertThrows(() => new WebAssembly.Global({value: 'v128'}), TypeError);
})();