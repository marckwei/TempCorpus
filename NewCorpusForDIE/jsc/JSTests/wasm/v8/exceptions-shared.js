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

// Flags: --expose-wasm --experimental-wasm-eh

load("wasm-module-builder.js");

// Helper function to return a new exported exception with the {kSig_v_v} type
// signature from an anonymous module. The underlying module is thrown away.
function NewExportedException() {
  let builder = new WasmModuleBuilder();
  let except = builder.addTag(kSig_v_v);
  builder.addExportOfKind("ex", kExternalTag, except);
  let instance = builder.instantiate();
  return instance.exports.ex;
}

// Check that an instance matches an exception thrown by itself, even when the
// exception is re-thrown by a regular JavaScript function.
(function TestSingleInstance() {
  let builder = new WasmModuleBuilder();
  let sig_index = builder.addType(kSig_v_v);
  let fun = builder.addImport("m", "f", sig_index);
  let except = builder.addTag(kSig_v_v);
  builder.addFunction("throw", kSig_v_v)
      .addBody([
        kExprThrow, except
      ]).exportFunc();
  builder.addFunction("catch", kSig_v_v)
      .addBody([
        kExprTry, kWasmVoid,
          kExprCallFunction, fun,
        kExprCatch, except,
        kExprEnd,
      ]).exportFunc();
  let ex_obj = new Error("my exception");
  let instance = builder.instantiate({ m: { f: function() { throw ex_obj }}});

  assertThrows(() => instance.exports.throw(), WebAssembly.Exception);
  assertThrowsEquals(() => instance.exports.catch(), ex_obj);
  try {
    instance.exports.throw();
  } catch (e) {
    ex_obj = e;
  }
  assertDoesNotThrow(() => instance.exports.catch());
})();

// Check that two instances distinguish their individual exceptions if they are
// not shared, even when declared by the same underlying module.
(function TestMultiInstanceNonShared() {
  let builder = new WasmModuleBuilder();
  let sig_index = builder.addType(kSig_v_v);
  let fun = builder.addImport("m", "f", sig_index);
  let except = builder.addTag(kSig_v_v);
  builder.addFunction("throw", kSig_v_v)
      .addBody([
        kExprThrow, except
      ]).exportFunc();
  builder.addFunction("catch", kSig_v_v)
      .addBody([
        kExprTry, kWasmVoid,
          kExprCallFunction, fun,
        kExprCatch, except,
        kExprEnd,
      ]).exportFunc();
  let ex_obj = new Error("my exception");
  let instance1 = builder.instantiate({ m: { f: assertUnreachable }});
  let instance2 = builder.instantiate({ m: { f: function() { throw ex_obj }}});

  assertThrows(() => instance1.exports.throw(), WebAssembly.Exception);
  assertThrowsEquals(() => instance2.exports.catch(), ex_obj);
  try {
    instance1.exports.throw();
  } catch (e) {
    ex_obj = e;
  }
  assertThrowsEquals(() => instance2.exports.catch(), ex_obj);
})();

// Check that two instances match their exceptions if they are shared properly,
// even if the local exception index of export and import is different.
(function TestMultiInstanceShared() {
  let builder = new WasmModuleBuilder();
  let sig_index = builder.addType(kSig_v_v);
  let fun = builder.addImport("m", "f", sig_index);
  let except1 = builder.addImportedTag("m", "ex1", kSig_v_v);
  let except2 = builder.addTag(kSig_v_v);
  builder.addExportOfKind("ex2", kExternalTag, except2);
  builder.addFunction("throw", kSig_v_v)
      .addBody([
        kExprThrow, except2
      ]).exportFunc();
  builder.addFunction("catch", kSig_v_v)
      .addBody([
        kExprTry, kWasmVoid,
          kExprCallFunction, fun,
        kExprCatch, except1,
        kExprEnd,
      ]).exportFunc();
  let ex_obj = new Error("my exception");
  let instance1 = builder.instantiate({ m: { f: assertUnreachable,
                                             ex1: NewExportedException() }});
  let instance2 = builder.instantiate({ m: { f: function() { throw ex_obj },
                                             ex1: instance1.exports.ex2 }});

  assertThrows(() => instance1.exports.throw(), WebAssembly.Exception);
  assertThrowsEquals(() => instance2.exports.catch(), ex_obj);
  try {
    instance1.exports.throw();
  } catch (e) {
    ex_obj = e;
  }
  assertDoesNotThrow(() => instance2.exports.catch());
})();

// Check that two instances based on different modules match their exceptions if
// they are shared properly, even if the local exception index is different.
(function TestMultiModuleShared() {
  let builder1 = new WasmModuleBuilder();
  let except1 = builder1.addTag(kSig_v_v);
  let except2 = builder1.addTag(kSig_v_v);
  builder1.addExportOfKind("ex", kExternalTag, except2);
  builder1.addFunction("throw", kSig_v_v)
      .addBody([
        kExprThrow, except2
      ]).exportFunc();
  let builder2 = new WasmModuleBuilder();
  let sig_index = builder2.addType(kSig_v_v);
  let fun = builder2.addImport("m", "f", sig_index);
  let except = builder2.addImportedTag("m", "ex", kSig_v_v);
  builder2.addFunction("catch", kSig_v_v)
      .addBody([
        kExprTry, kWasmVoid,
          kExprCallFunction, fun,
        kExprCatch, except,
        kExprEnd,
      ]).exportFunc();
  let ex_obj = new Error("my exception");
  let instance1 = builder1.instantiate();
  let instance2 = builder2.instantiate({ m: { f: function() { throw ex_obj },
                                              ex: instance1.exports.ex }});

  assertThrows(() => instance1.exports.throw(), WebAssembly.Exception);
  assertThrowsEquals(() => instance2.exports.catch(), ex_obj);
  try {
    instance1.exports.throw();
  } catch (e) {
    ex_obj = e;
  }
  assertDoesNotThrow(() => instance2.exports.catch());
})();
