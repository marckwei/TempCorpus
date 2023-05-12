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
//@ skip if $memoryLimited or $addressBits <= 32
// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --wasm-max-mem-pages=49152
// Save some memory on Linux; other platforms ignore this flag.
// Flags: --multi-mapped-mock-allocator

// This test makes sure things don't break once we support >2GB wasm memories.
load("wasm-module-builder.js");

(function testHugeMemory() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();

  const num_pages = 49152;  // 3GB

  builder.addMemory(num_pages, num_pages, true);
  builder.addFunction("geti", kSig_i_ii)
    .addBody([
      kExprLocalGet, 0,
      kExprLocalGet, 1,
      kExprI32Mul,
      kExprI32LoadMem, 0, 0,
    ])
    .exportFunc();

  var module = builder.instantiate();
  const geti = module.exports.geti;

  // print("In bounds");
  assertEquals(0, geti(2500, 1 << 20));
  // print("Out of bounds");
  assertTraps(kTrapMemOutOfBounds, () => geti(3500, 1 << 20));
})();

(function testHugeMemoryConstInBounds() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();

  const num_pages = 49152;  // 3GB

  builder.addMemory(num_pages, num_pages, true);
  builder.addFunction("geti", kSig_i_v)
    .addBody([
      kExprI32Const, 0x80, 0x80, 0x80, 0x80, 0x7A, // 0xA0000000, 2.5GB
      kExprI32LoadMem, 0, 0,
    ])
    .exportFunc();

  var module = builder.instantiate();
  const geti = module.exports.geti;

  // print("In bounds");
  assertEquals(0, geti());
})();

(function testHugeMemoryConstOutOfBounds() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();

  const num_pages = 49152;  // 3GB

  builder.addMemory(num_pages, num_pages, true);
  builder.addFunction("geti", kSig_i_v)
    .addBody([
      kExprI32Const, 0x80, 0x80, 0x80, 0x80, 0x7E, // 0xE0000000, 3.5GB
      kExprI32LoadMem, 0, 0,
    ])
    .exportFunc();

  var module = builder.instantiate();
  const geti = module.exports.geti;

  // print("Out of bounds");
  assertTraps(kTrapMemOutOfBounds, geti);
})();

(function testGrowHugeMemory() {
  // print(arguments.callee.name);

  let mem = new WebAssembly.Memory({initial: 1});
  mem.grow(49151);
})();
