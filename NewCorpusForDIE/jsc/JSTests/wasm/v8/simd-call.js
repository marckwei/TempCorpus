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

load('wasm-module-builder.js');

// Tests function calls containing s128 parameters. It also checks that
// lowering of simd calls are correct, so we create 2 functions with s128
// arguments: function 2 has a single s128 parameter, function 3 has a i32 then
// s128, to ensure that the arguments in different indices are correctly lowered.
(function TestSimd128Params() {
  const builder = new WasmModuleBuilder();
  builder.addImportedMemory('m', 'imported_mem', 1, 2);

  builder
    .addFunction("main", makeSig([], []))
    .addBodyWithEnd([
      kExprI32Const, 0,
      kSimdPrefix, kExprS128LoadMem, 0, 0,
      kExprCallFunction, 0x01,
      kExprEnd,
    ]);

  // Writes s128 argument to memory starting byte 16.
  builder
    .addFunction("function2", makeSig([kWasmS128], []))
    .addBodyWithEnd([
      kExprI32Const, 16,
      kExprLocalGet, 0,
      kSimdPrefix, kExprS128StoreMem, 0, 0,
      kExprI32Const, 9, // This constant doesn't matter.
      kExprLocalGet, 0,
      kExprCallFunction, 0x02,
      kExprEnd,
    ]);

  // Writes s128 argument to memory starting byte 32.
  builder
    .addFunction("function3", makeSig([kWasmI32, kWasmS128], []))
    .addBodyWithEnd([
      kExprI32Const, 32,
      kExprLocalGet, 1,
      kSimdPrefix, kExprS128StoreMem, 0, 0,
      kExprEnd,
    ]);

  builder.addExport('main', 0);
  var memory = new WebAssembly.Memory({initial:1, maximum:2});
  const instance = builder.instantiate({m: {imported_mem: memory}});

  const arr = new Uint8Array(memory.buffer);
  // Fill the initial memory with some values, this is read by main and passed
  // as arguments to function2, and then to function3.
  for (let i = 0; i < 16; i++) {
    arr[i] = i * 2;
  }

  instance.exports.main();

  for (let i = 0; i < 16; i++) {
    assertEquals(arr[i], arr[i+16]);
    assertEquals(arr[i], arr[i+32]);
  }
})();
