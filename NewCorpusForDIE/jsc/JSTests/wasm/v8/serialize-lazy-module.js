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
// call to %DeserializeWasmModule()
// call to %SerializeWasmModule()

// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The test needs --no-liftoff because we can't serialize and deserialize
// Liftoff code.
// Flags: --wasm-lazy-compilation --allow-natives-syntax --expose-gc
// Flags: --no-liftoff

load("wasm-module-builder.js");

(function SerializeUncompiledModule() {
  // print(arguments.callee.name);
  const [wire_bytes, i1, buff] = (function GenerateInstance() {
    const builder = new WasmModuleBuilder();

    // Add 20 functions.
    for (let i = 0; i < 20; ++i) {
      builder.addFunction('f' + i, kSig_i_i)
          .addBody([kExprI32Const, i])
          .exportFunc();
    }

    const wire_bytes = builder.toBuffer();
    const module = new WebAssembly.Module(wire_bytes);
    // Run one function so that serialization happens.
    let instance = new WebAssembly.Instance(module);
    instance.exports.f3();
    const buff = %SerializeWasmModule(module);
    return [wire_bytes, instance, buff];
  })();

  gc();
  const module = %DeserializeWasmModule(buff, wire_bytes);

  const i2 = new WebAssembly.Instance(module);

  assertEquals(13, i2.exports.f13());
  assertEquals(11, i1.exports.f11());
})();

(function SerializePartlyCompiledModule() {
  // print(arguments.callee.name);
  const [wire_bytes, i1, buff] = (function GenerateInstance() {
    const builder = new WasmModuleBuilder();

    // Add 20 functions.
    for (let i = 0; i < 20; ++i) {
      builder.addFunction('f' + i, kSig_i_i)
          .addBody([kExprI32Const, i])
          .exportFunc();
    }

    const wire_bytes = builder.toBuffer();
    const module = new WebAssembly.Module(wire_bytes);
    const i1 = new WebAssembly.Instance(module);
    // Run one function so that serialization happens.
    i1.exports.f3();
    const buff = %SerializeWasmModule(module);

    assertEquals(2, i1.exports.f2());
    assertEquals(11, i1.exports.f11());

    return [wire_bytes, i1, buff];
  })();

  gc();
  const module = %DeserializeWasmModule(buff, wire_bytes);

  const i2 = new WebAssembly.Instance(module);

  assertEquals(13, i2.exports.f13());
  assertEquals(11, i1.exports.f11());
  assertEquals(9, i1.exports.f9());
})();