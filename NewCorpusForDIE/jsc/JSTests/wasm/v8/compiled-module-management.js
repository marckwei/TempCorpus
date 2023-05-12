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
// call to %WasmGetNumberOfInstances()

// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm --expose-gc --allow-natives-syntax

load("wasm-module-builder.js");

// Use global variables for all values where the test wants to maintain strict
// control over value lifetime. Using local variables would not give sufficient
// guarantees of the value lifetime.
var module;
var instance1;
var instance2;
var instance3;
var instance4;

(function CompiledModuleInstancesInitialize1to3() {
  var builder = new WasmModuleBuilder();

  builder.addMemory(1,1, true);
  builder.addImport("", "getValue", kSig_i_v);
  builder.addFunction("f", kSig_i_v)
    .addBody([
      kExprCallFunction, 0
    ]).exportFunc();

  module = new WebAssembly.Module(builder.toBuffer());

  // print("Initial instances=0");
  assertEquals(0, %WasmGetNumberOfInstances(module));
  instance1 = new WebAssembly.Instance(module, {"": {getValue: () => 1}});

  // print("Initial instances=1");
  assertEquals(1, %WasmGetNumberOfInstances(module));
  instance2 = new WebAssembly.Instance(module, {"": {getValue: () => 2}});

  // print("Initial instances=2");
  assertEquals(2, %WasmGetNumberOfInstances(module));
  instance3 = new WebAssembly.Instance(module, {"": {getValue: () => 3}});

  // print("Initial instances=3");
  assertEquals(3, %WasmGetNumberOfInstances(module));
})();

(function CompiledModuleInstancesClear1() {
  assertEquals(1, instance1.exports.f());
  instance1 = null;
})();

// Note that two GC's are required because weak slots clearing is deferred.
gc();
gc();
// print("After gc instances=2");
assertEquals(2, %WasmGetNumberOfInstances(module));

(function CompiledModuleInstancesClear3() {
  assertEquals(3, instance3.exports.f());
  instance3 = null;
})();

// Note that two GC's are required because weak slots clearing is deferred.
gc();
gc();
// print("After gc instances=1");
assertEquals(1, %WasmGetNumberOfInstances(module));

(function CompiledModuleInstancesClear2() {
  assertEquals(2, instance2.exports.f());
  instance2 = null;
})();

// Note that two GC's are required because weak slots clearing is deferred.
gc();
gc();
// print("After gc instances=0");
assertEquals(0, %WasmGetNumberOfInstances(module));

(function CompiledModuleInstancesInitialize4AndClearModule() {
  instance4 = new WebAssembly.Instance(module, {"": {getValue: () => 4}});
  assertEquals(4, instance4.exports.f());
  module = null;
  instance4 = null;
})();

// Note that two GC's are required because weak slots clearing is deferred.
gc();
gc();
