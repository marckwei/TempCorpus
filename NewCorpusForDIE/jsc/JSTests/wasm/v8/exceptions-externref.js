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

// Flags: --experimental-wasm-eh --experimental-wasm-reftypes --allow-natives-syntax

load("wasm-module-builder.js");
load("exceptions-utils.js");

// Test the encoding of a thrown exception with a null-ref value.
(function TestThrowRefNull() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_r);
  builder.addFunction("throw_null", kSig_v_v)
      .addBody([
        kExprRefNull, kExternRefCode,
        kExprThrow, except,
      ]).exportFunc();
  builder.addExportOfKind("ex", kExternalTag, except);
  let instance = builder.instantiate();

  assertWasmThrows(instance, instance.exports.ex, [null], () => instance.exports.throw_null());
})();

// Test throwing/catching the null-ref value.
(function TestThrowCatchRefNull() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_r);
  builder.addFunction("throw_catch_null", kSig_i_i)
      .addBody([
        kExprTry, kWasmI32,
          kExprLocalGet, 0,
          kExprI32Eqz,
          kExprIf, kWasmI32,
            kExprRefNull, kExternRefCode,
            kExprThrow, except,
          kExprElse,
            kExprI32Const, 42,
          kExprEnd,
        kExprCatch, except,
          kExprRefIsNull,
          kExprIf, kWasmI32,
            kExprI32Const, 23,
          kExprElse,
            kExprUnreachable,
          kExprEnd,
        kExprEnd,
      ]).exportFunc();
  builder.addExportOfKind("ex", kExternalTag, except);
  let instance = builder.instantiate();

  assertEquals(23, instance.exports.throw_catch_null(0));
  assertEquals(42, instance.exports.throw_catch_null(1));
})();

// Test the encoding of a thrown exception with a reference type value.
(function TestThrowRefParam() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_r);
  builder.addFunction("throw_param", kSig_v_r)
      .addBody([
        kExprLocalGet, 0,
        kExprThrow, except,
      ]).exportFunc();
  builder.addExportOfKind("ex", kExternalTag, except);
  let instance = builder.instantiate();
  let o = new Object();

  assertWasmThrows(instance, instance.exports.ex, [o], () => instance.exports.throw_param(o));
  assertWasmThrows(instance, instance.exports.ex, [1], () => instance.exports.throw_param(1));
  assertWasmThrows(instance, instance.exports.ex, [2.3], () => instance.exports.throw_param(2.3));
  assertWasmThrows(instance, instance.exports.ex, ["str"], () => instance.exports.throw_param("str"));
})();

// Test throwing/catching the reference type value.
(function TestThrowCatchRefParam() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_r);
  builder.addFunction("throw_catch_param", kSig_r_r)
      .addBody([
        kExprTry, kExternRefCode,
          kExprLocalGet, 0,
          kExprThrow, except,
        kExprCatch, except,
          // fall-through
        kExprEnd,
      ]).exportFunc();
  builder.addExportOfKind("ex", kExternalTag, except);
  let instance = builder.instantiate();
  let o = new Object();

  assertEquals(o, instance.exports.throw_catch_param(o));
  assertEquals(1, instance.exports.throw_catch_param(1));
  assertEquals(2.3, instance.exports.throw_catch_param(2.3));
  assertEquals("str", instance.exports.throw_catch_param("str"));
})();
