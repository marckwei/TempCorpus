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
// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load("wasm-module-builder.js");

var kV8MaxWasmMemoryPages = 65536;  // 4 GiB
var kSpecMaxWasmMemoryPages = 65536;  // 4 GiB

(function testMemorySizeZero() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();
  builder.addMemory(0, 0, false);
  builder.addFunction("memory_size", kSig_i_v)
         .addBody([kExprMemorySize, kMemoryZero])
         .exportFunc();
  var module = builder.instantiate();
  assertEquals(0, module.exports.memory_size());
})();

(function testMemorySizeNonZero() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();
  var size = 11;
  builder.addMemory(size, size, false);
  builder.addFunction("memory_size", kSig_i_v)
         .addBody([kExprMemorySize, kMemoryZero])
         .exportFunc();
  var module = builder.instantiate();
  assertEquals(size, module.exports.memory_size());
})();

(function testMemorySizeSpecMaxOk() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();
  builder.addMemory(1, kSpecMaxWasmMemoryPages, true);
  builder.addFunction("memory_size", kSig_i_v)
         .addBody([kExprMemorySize, kMemoryZero])
         .exportFunc();
  var module = builder.instantiate();
  assertEquals(1, module.exports.memory_size());
})();

(function testMemorySizeV8MaxPlus1Throws() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();
  builder.addMemory(kV8MaxWasmMemoryPages + 1,
                    kV8MaxWasmMemoryPages + 1, false);
  builder.addFunction("memory_size", kSig_i_v)
         .addBody([kExprMemorySize, kMemoryZero])
         .exportFunc();
  assertThrows(() => builder.instantiate());
})();

(function testMemorySpecMaxOk() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();
  builder.addMemory(1, kSpecMaxWasmMemoryPages, false);
  builder.addFunction("memory_size", kSig_i_v)
         .addBody([kExprMemorySize, kMemoryZero])
    .exportFunc();
  var module = builder.instantiate();
  assertEquals(1, module.exports.memory_size());
})();

(function testMemoryInitialMaxPlus1Throws() {
  // print(arguments.callee.name);
  assertThrows(() => new WebAssembly.Memory(
      {initial: kV8WasmMaxMemoryPages + 1}));
})();
