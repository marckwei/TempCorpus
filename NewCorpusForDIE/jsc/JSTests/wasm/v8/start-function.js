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

function instantiate(sig, body) {
  var builder = new WasmModuleBuilder();

  var func = builder.addFunction("", sig)
    .addBody(body);

  builder.addStart(func.index);

  return builder.instantiate();
}

function assertVerifies(sig, body) {
  var module = instantiate(sig, body);
  assertFalse(module === undefined);
  assertFalse(module === null);
  assertFalse(module === 0);
  assertEquals("object", typeof module);
  return module;
}

assertVerifies(kSig_v_v, [kExprNop]);

// Arguments aren't allowed to start functions.
assertThrows(() => {instantiate(kSig_i_i, [kExprLocalGet, 0]);});
assertThrows(() => {instantiate(kSig_i_ii, [kExprLocalGet, 0]);});
assertThrows(() => {instantiate(kSig_i_dd, [kExprLocalGet, 0]);});
assertThrows(() => {instantiate(kSig_i_v, [kExprI32Const, 0]);});

(function testInvalidIndex() {
  // print("testInvalidIndex");
  var builder = new WasmModuleBuilder();

  var func = builder.addFunction("", kSig_v_v)
    .addBody([kExprNop]);

  builder.addStart(func.index + 1);

  assertThrows(
      () => builder.instantiate(), WebAssembly.CompileError,
      /WebAssembly.Module doesn't parse at byte/);
})();


(function testTwoStartFuncs() {
  // print("testTwoStartFuncs");
  var builder = new WasmModuleBuilder();

  var func = builder.addFunction("", kSig_v_v)
    .addBody([kExprNop]);

  builder.addExplicitSection([kStartSectionCode, 0]);
  builder.addExplicitSection([kStartSectionCode, 0]);

  assertThrows(
      () => builder.instantiate(), WebAssembly.CompileError,
      /WebAssembly.Module doesn't parse at byte/);
})();


(function testRun1() {
  // print("testRun1");
  var builder = new WasmModuleBuilder();

  builder.addMemory(12, 12, true);

  var func = builder.addFunction("", kSig_v_v)
    .addBody([kExprI32Const, 0, kExprI32Const, 55, kExprI32StoreMem, 0, 0]);

  builder.addStart(func.index);

  var module = builder.instantiate();
  var memory = module.exports.memory.buffer;
  var view = new Int8Array(memory);
  assertEquals(55, view[0]);
})();

(function testRun2() {
  // print("testRun2");
  var builder = new WasmModuleBuilder();

  builder.addMemory(12, 12, true);

  var func = builder.addFunction("", kSig_v_v)
    .addBody([kExprI32Const, 0, kExprI32Const, 22, kExprI32Const, 55, kExprI32Add, kExprI32StoreMem, 0, 0]);

  builder.addStart(func.index);

  var module = builder.instantiate();
  var memory = module.exports.memory.buffer;
  var view = new Int8Array(memory);
  assertEquals(77, view[0]);
})();

(function testStartFFI() {
  // print("testStartFFI");
  var ranned = false;
  var ffi = {gak: {foo : function() {
    // print("we ranned at stert!");
    ranned = true;
  }}};

  var builder = new WasmModuleBuilder();
  var sig_index = builder.addType(kSig_v_v);

  builder.addImport("gak", "foo", sig_index);
  var func = builder.addFunction("", sig_index)
    .addBody([kExprCallFunction, 0]);

  builder.addStart(func.index);

  var module = builder.instantiate(ffi);
  assertTrue(ranned);
})();

(function testStartFunctionThrowsExplicitly() {
  // print('testStartFunctionThrowsExplicitly');
  let error = new Error('my explicit error');
  var ffi = {
    foo: {
      throw_fn: function() {
        throw error;
      }
    }
  };
  let builder = new WasmModuleBuilder();
  builder.addImport('foo', 'throw_fn', kSig_v_v);
  let func = builder.addFunction('', kSig_v_v).addBody([kExprCallFunction, 0]);
  builder.addStart(func.index);

  assertThrowsEquals(() => builder.instantiate(ffi), error);
  assertPromiseResult(builder.asyncInstantiate(ffi), assertUnreachable,
    e => assertSame(e, error));
  assertPromiseResult(WebAssembly.instantiate(builder.toModule(), ffi),
    assertUnreachable, e => assertSame(e, error));
})();

(function testStartFunctionThrowsImplicitly() {
  // print("testStartFunctionThrowsImplicitly");
  let builder = new WasmModuleBuilder();
  let func = builder.addFunction('', kSig_v_v).addBody([kExprUnreachable]);
  builder.addStart(func.index);

  assertThrows(
      () => builder.instantiate(), WebAssembly.RuntimeError, /unreachable/i);
  assertThrowsAsync(builder.asyncInstantiate(), WebAssembly.RuntimeError);
  assertThrowsAsync(
      WebAssembly.instantiate(builder.toModule()), WebAssembly.RuntimeError);
})();
