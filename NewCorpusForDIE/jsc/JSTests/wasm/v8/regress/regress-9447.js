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
//@ skip if !$isSIMDPlatform
// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-simd

load('wasm-module-builder.js');

let kSig_s_v = makeSig([], [kWasmS128]);
// Generate a re-exported function that wraps a JavaScript callable, but with a
// function signature that is incompatible (i.e. simd return type) with JS.
var fun1 = (function GenerateFun1() {
  let builder = new WasmModuleBuilder();
  function fun() { return 0 }
  let fun_index = builder.addImport('m', 'fun', kSig_s_v)
  builder.addExport("fun", fun_index);
  let instance = builder.instantiate({ m: { fun: fun }});
  return instance.exports.fun;
})();

// Generate an exported function that calls the above re-export from another
// module, still with a function signature that is incompatible with JS.
var fun2 = (function GenerateFun2() {
  let builder = new WasmModuleBuilder();
  let fun_index = builder.addImport("m", "fun", kSig_s_v)
  builder.addFunction('main', kSig_v_v)
      .addBody([
        kExprCallFunction, fun_index,
        kExprDrop
      ])
      .exportFunc();
  let instance = builder.instantiate({ m: { fun: fun1 }});
  return instance.exports.main;
})();

// Both exported functions should throw, no matter how often they get wrapped.
assertThrows(fun1, TypeError,
             /an exported wasm function cannot contain a v128 parameter or return value/);
assertThrows(fun2, TypeError,
             /an exported wasm function cannot contain a v128 parameter or return value/);
