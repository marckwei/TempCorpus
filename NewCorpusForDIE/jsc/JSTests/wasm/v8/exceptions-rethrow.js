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

// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm --experimental-wasm-eh --allow-natives-syntax

load("wasm-module-builder.js");
load("exceptions-utils.js");

// Test that rethrow expressions can target catch blocks.
(function TestRethrowInCatch() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_v);
  builder.addFunction("rethrow0", kSig_v_v)
      .addBody([
        kExprTry, kWasmVoid,
          kExprThrow, except,
        kExprCatch, except,
          kExprRethrow, 0,
        kExprEnd,
  ]).exportFunc();
  builder.addFunction("rethrow1", kSig_i_i)
      .addBody([
        kExprTry, kWasmI32,
          kExprThrow, except,
        kExprCatch, except,
          kExprLocalGet, 0,
          kExprI32Eqz,
          kExprIf, kWasmVoid,
            kExprRethrow, 1,
          kExprEnd,
          kExprI32Const, 23,
        kExprEnd
  ]).exportFunc();
  builder.addExportOfKind("ex", kExternalTag, except);
  let instance = builder.instantiate();

  assertWasmThrows(instance, instance.exports.ex, [], () => instance.exports.rethrow0());
  assertWasmThrows(instance, instance.exports.ex, [], () => instance.exports.rethrow1(0));
  assertEquals(23, instance.exports.rethrow1(1));
})();

// Test that rethrow expressions can target catch-all blocks.
(function TestRethrowInCatchAll() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_v);
  builder.addFunction("rethrow0", kSig_v_v)
      .addBody([
        kExprTry, kWasmVoid,
          kExprThrow, except,
        kExprCatchAll,
          kExprRethrow, 0,
        kExprEnd,
  ]).exportFunc();
  builder.addFunction("rethrow1", kSig_i_i)
      .addBody([
        kExprTry, kWasmI32,
          kExprThrow, except,
        kExprCatchAll,
          kExprLocalGet, 0,
          kExprI32Eqz,
          kExprIf, kWasmVoid,
            kExprRethrow, 1,
          kExprEnd,
          kExprI32Const, 23,
        kExprEnd
  ]).exportFunc();
  builder.addExportOfKind("ex", kExternalTag, except);
  let instance = builder.instantiate();

  assertWasmThrows(instance, instance.exports.ex, [], () => instance.exports.rethrow0());
  assertWasmThrows(instance, instance.exports.ex, [], () => instance.exports.rethrow1(0));
  assertEquals(23, instance.exports.rethrow1(1));
})();

// Test that rethrow expression properly target the correct surrounding try
// block even in the presence of multiple handlers being involved.
(function TestRethrowNested() {
  let builder = new WasmModuleBuilder();
  let except1 = builder.addTag(kSig_v_v);
  let except2 = builder.addTag(kSig_v_v);
  builder.addFunction("rethrow_nested", kSig_i_i)
      .addBody([
        kExprTry, kWasmI32,
          kExprThrow, except2,
        kExprCatch, except2,
          kExprTry, kWasmI32,
            kExprThrow, except1,
          kExprCatch, except1,
            kExprLocalGet, 0,
            kExprI32Const, 0,
            kExprI32Eq,
            kExprIf, kWasmVoid,
              kExprRethrow, 1,
            kExprEnd,
            kExprLocalGet, 0,
            kExprI32Const, 1,
            kExprI32Eq,
            kExprIf, kWasmVoid,
              kExprRethrow, 2,
            kExprEnd,
            kExprI32Const, 23,
          kExprEnd,
        kExprEnd,
  ]).exportFunc();
  builder.addExportOfKind("ex1", kExternalTag, except1);
  builder.addExportOfKind("ex2", kExternalTag, except2);
  let instance = builder.instantiate();

  assertWasmThrows(instance, instance.exports.ex1, [], () => instance.exports.rethrow_nested(0));
  assertWasmThrows(instance, instance.exports.ex2, [], () => instance.exports.rethrow_nested(1));
  assertEquals(23, instance.exports.rethrow_nested(2));
})();

// Test that an exception being rethrow can be caught by another local catch
// block in the same function without ever unwinding the activation.
(function TestRethrowRecatch() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_v);
  builder.addFunction("rethrow_recatch", kSig_i_i)
      .addBody([
        kExprTry, kWasmI32,
          kExprThrow, except,
        kExprCatch, except,
          kExprTry, kWasmI32,
            kExprLocalGet, 0,
            kExprI32Eqz,
            kExprIf, kWasmVoid,
              kExprRethrow, 2,
            kExprEnd,
            kExprI32Const, 42,
          kExprCatch, except,
            kExprI32Const, 23,
          kExprEnd,
        kExprEnd,
  ]).exportFunc();
  builder.addExportOfKind("ex", kExternalTag, except);
  let instance = builder.instantiate();

  assertEquals(23, instance.exports.rethrow_recatch(0));
  assertEquals(42, instance.exports.rethrow_recatch(1));
})();
