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
// Skipping this test due to the following issues:
// call to %IsLiftoffFunction()

// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax --liftoff --no-wasm-tier-up
// In this test we are interested in the generated code, so force code
// generation by disabling lazy compilation.
// Flags: --no-wasm-lazy-compilation

load("wasm-module-builder.js");

(function testLiftoffFlag() {
  // print(arguments.callee.name);
  const builder = new WasmModuleBuilder();
  builder.addFunction('i32_add', kSig_i_ii)
      .addBody([kExprLocalGet, 0, kExprLocalGet, 1, kExprI32Add])
      .exportFunc();

  const module = new WebAssembly.Module(builder.toBuffer());
  const instance = new WebAssembly.Instance(module);
  const instance2 = new WebAssembly.Instance(module);

  assertEquals(%IsLiftoffFunction(instance.exports.i32_add),
               %IsLiftoffFunction(instance2.exports.i32_add));
})();


(function testLiftoffSync() {
  // print(arguments.callee.name);
  const builder = new WasmModuleBuilder();
  builder.addFunction('i32_add', kSig_i_ii)
      .addBody([kExprLocalGet, 0, kExprLocalGet, 1, kExprI32Add])
      .exportFunc();

  const instance = builder.instantiate();

  assertTrue(%IsLiftoffFunction(instance.exports.i32_add));
})();

async function testLiftoffAsync() {
  // print(arguments.callee.name);
  const builder = new WasmModuleBuilder();
  builder.addFunction('i32_add', kSig_i_ii)
      .addBody([kExprLocalGet, 0, kExprLocalGet, 1, kExprI32Add])
      .exportFunc();

  // print('Compiling...');
  const module = await WebAssembly.compile(builder.toBuffer());
  // print('Instantiating...');
  const instance = new WebAssembly.Instance(module);
  assertTrue(%IsLiftoffFunction(instance.exports.i32_add));
}

assertPromiseResult(testLiftoffAsync());
