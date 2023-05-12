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
// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load("wasm-module-builder.js");

let k1GiB = 1 * 1024 * 1024 * 1024;
let k4GiB = 4 * k1GiB;
// TODO(4153): Raise this to 4GiB, but only on 64-bit platforms.
let kMaxMemory = 2 * k1GiB - kPageSize;

(function Test() {
  var memory;

  function BuildAccessors(type, load_opcode, store_opcode) {
    builder = new WasmModuleBuilder();
    builder.addImportedMemory("i", "mem");
    builder.addFunction("load", makeSig([kWasmI32], [type]))
      .addBody([           // --
        kExprLocalGet, 0,  // --
        load_opcode, 0, 0, // --
      ])                   // --
      .exportFunc();
    builder.addFunction("store", makeSig([kWasmI32, type], []))
      .addBody([             // --
        kExprLocalGet, 0,    // --
        kExprLocalGet, 1,    // --
        store_opcode, 0, 0,  // --
      ])                     // --
      .exportFunc();
    let i = builder.instantiate({i: {mem: memory}});
    return {load: i.exports.load, store: i.exports.store};
  }

  function probe(a, f) {
    // print("------------------------");
    let stride = kPageSize * 32;  // Don't check every page to save time.
    let max = kMaxMemory;
    for (let i = 0; i < max; i += stride) {
      a.store(i, f(i));
    }
    for (let i = 0; i < max; i += stride) {
      assertEquals(f(i), a.load(i));
    }
  }

  try {
    let kPages = kMaxMemory / kPageSize;
    memory = new WebAssembly.Memory({ initial: kPages, maximum: kPages });
  } catch (e) {
    // print("OOM: sorry, best effort max memory size test.");
    return;
  }

  assertEquals(kMaxMemory, memory.buffer.byteLength);

  {
    let a = BuildAccessors(kWasmI32, kExprI32LoadMem, kExprI32StoreMem);
    probe(a, i => (0xaabbccee ^ ((i >> 11) * 0x110005)) | 0);
  }

  {
    let a = BuildAccessors(kWasmI32, kExprI32LoadMem16U, kExprI32StoreMem16);
    probe(a, i => (0xccee ^ ((i >> 11) * 0x110005)) & 0xFFFF);
  }

  {
    let a = BuildAccessors(kWasmI32, kExprI32LoadMem8U, kExprI32StoreMem8);
    probe(a, i => (0xee ^ ((i >> 11) * 0x05)) & 0xFF);
  }

  {
    let a = BuildAccessors(kWasmF64, kExprF64LoadMem, kExprF64StoreMem);
    probe(a, i => 0xaabbccee ^ ((i >> 11) * 0x110005));
  }

  {
    let a = BuildAccessors(kWasmF32, kExprF32LoadMem, kExprF32StoreMem);
    probe(a, i => Math.fround(0xaabbccee ^ ((i >> 11) * 0x110005)));
  }
})();
