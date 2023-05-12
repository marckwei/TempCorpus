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

load("wasm-module-builder.js");

(function exportImmutableGlobal() {
  var builder = new WasmModuleBuilder();
  let globals = [
    [kWasmI32, 'i32', 4711, wasmI32Const(4711)],
    [kWasmF32, 'f32', Math.fround(3.14), wasmF32Const(Math.fround(3.14))],
    [kWasmF64, 'f64', 1/7, wasmF64Const(1 / 7)]
  ];
  for (let [type, name, value, bytes] of globals) {
    builder.addGlobal(type, false, bytes).exportAs(name);
  }
  var instance = builder.instantiate();

  for (let [type, name, value, bytes] of globals) {
    let obj = instance.exports[name];
    assertEquals("object", typeof obj, name);
    assertTrue(obj instanceof WebAssembly.Global, name);
    assertEquals(value || 0, obj.value, name);
    assertThrows(() => obj.value = 0);
  }
})();

(function canExportI64Global() {
  var builder = new WasmModuleBuilder();
  builder.addGlobal(kWasmI64, false).exportAs('g');
  builder.instantiate();
})();

(function canExportAndImportI64() {
  var builder = new WasmModuleBuilder();
  builder.addGlobal(kWasmI64, false).exportAs('g');
  let g = builder.instantiate().exports.g;

  builder = new WasmModuleBuilder();
  builder.addImportedGlobal("mod", "g", kWasmI64);
  builder.instantiate({mod: {g: g}});
})();

(function exportMutableGlobal() {
  var builder = new WasmModuleBuilder();
  let globals = [
    [kWasmI32, 'i32', 4711, wasmI32Const(4711)],
    [kWasmF32, 'f32', Math.fround(3.14), wasmF32Const(Math.fround(3.14))],
    [kWasmF64, 'f64', 1/7, wasmF64Const(1 / 7)]
  ];
  for (let [index, [type, name, value, bytes]] of globals.entries()) {
    builder.addGlobal(type, true, bytes).exportAs(name);
    builder.addFunction("get " + name, makeSig([], [type]))
      .addBody([kExprGlobalGet, index])
      .exportFunc();
    builder.addFunction("set " + name, makeSig([type], []))
      .addBody([kExprLocalGet, 0, kExprGlobalSet, index])
      .exportFunc();
  }
  var instance = builder.instantiate();

  for (let [type, name, value, bytes] of globals) {
    let obj = instance.exports[name];

    assertEquals(value || 0, obj.value, name);

    // Changing the exported global should change the instance's global.
    obj.value = 1001;
    assertEquals(1001, instance.exports['get ' + name](), name);

    // Changing the instance's global should change the exported global.
    instance.exports['set ' + name](112358);
    assertEquals(112358, obj.value, name);
  }
})();

(function exportImportedMutableGlobal() {
  let builder = new WasmModuleBuilder();
  builder.addGlobal(kWasmI32, true).exportAs('g1');
  let g1 = builder.instantiate().exports.g1;

  builder = new WasmModuleBuilder();
  builder.addImportedGlobal("mod", "g1", kWasmI32, true);
  builder.addExportOfKind('g2', kExternalGlobal, 0);
  let g2 = builder.instantiate({mod: {g1: g1}}).exports.g2;

  g1.value = 123;

  assertEquals(g1.value, g2.value);
})();
