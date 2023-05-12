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
//@ skip if $memoryLimited or ($architecture != "arm64" && $architecture != "x86_64")
// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Save some memory on Linux; other platforms ignore this flag.
// Flags: --multi-mapped-mock-allocator

// Test that we can grow memories to sizes beyond 2GB.

load("wasm-module-builder.js");

function GetMemoryPages(memory) {
  return memory.buffer.byteLength >>> 16;
}

(function TestGrowFromJS() {
  let mem = new WebAssembly.Memory({initial: 200});
  mem.grow(40000);
  assertEquals(40200, GetMemoryPages(mem));
})();

(function TestGrowFromWasm() {
  let builder = new WasmModuleBuilder();
  builder.addMemory(200, 50000, true);
  builder.addFunction("grow", kSig_i_v)
    .addBody([
      ...wasmI32Const(40000),        // Number of pages to grow by.
      kExprMemoryGrow, kMemoryZero,  // Grow memory.
      kExprDrop,                     // Drop result of grow (old pages).
      kExprMemorySize, kMemoryZero   // Get the memory size.
      ]).exportFunc();
  let instance = builder.instantiate();
  assertEquals(40200, instance.exports.grow());
  assertEquals(40200, GetMemoryPages(instance.exports.memory));
})();
