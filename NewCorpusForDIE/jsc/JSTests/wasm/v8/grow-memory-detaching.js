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

let module = (() => {
  let builder = new WasmModuleBuilder();
  builder.addMemory(1, undefined, false);
  builder.addFunction("grow_memory", kSig_i_i)
              .addBody([kExprLocalGet, 0, kExprMemoryGrow, kMemoryZero])
    .exportFunc();
  builder.exportMemoryAs("memory");
  return builder.toModule();
})();

(function TestDetachingViaAPI() {
  // print("TestDetachingViaAPI...");
  let memory = new WebAssembly.Memory({initial: 1, maximum: 100});
  let growMem = (pages) => memory.grow(pages);

  let b1 = memory.buffer;
  assertEquals(kPageSize, b1.byteLength);

  growMem(0);
  let b2 = memory.buffer;
  assertFalse(b1 === b2);
  assertEquals(0, b1.byteLength);
  assertEquals(kPageSize, b2.byteLength);

  growMem(1);
  let b3 = memory.buffer;
  assertFalse(b1 === b3);
  assertFalse(b2 === b3);
  assertEquals(0, b1.byteLength);
  assertEquals(0, b2.byteLength);
  assertEquals(2 * kPageSize, b3.byteLength);
})();

(function TestDetachingViaBytecode() {
  // print("TestDetachingViaBytecode...");
  let instance = new WebAssembly.Instance(module);
  let growMem = instance.exports.grow_memory;
  let memory = instance.exports.memory;

  let b1 = memory.buffer;
  assertEquals(kPageSize, b1.byteLength);

  growMem(0);
  let b2 = memory.buffer;
  assertFalse(b1 === b2);
  assertEquals(0, b1.byteLength);
  assertEquals(kPageSize, b2.byteLength);

  growMem(1);
  let b3 = memory.buffer;
  assertFalse(b1 === b3);
  assertFalse(b2 === b3);
  assertEquals(0, b1.byteLength);
  assertEquals(0, b2.byteLength);
  assertEquals(2 * kPageSize, b3.byteLength);
})();
