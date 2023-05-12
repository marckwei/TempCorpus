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
// Failure:
// Exception: CompileError: WebAssembly.Module doesn't validate: I32Mul right value type mismatch, in function at index 0 (evaluating 'new WebAssembly.Module(this.toBuffer(debug))')
//  Module@[native code]
//  toModule@.tests/wasm.yaml/wasm/v8/wasm-module-builder.js:2082:34
//  instantiate@.tests/wasm.yaml/wasm/v8/wasm-module-builder.js:2071:31
//  testInstantiateLazyValidation@compilation-hints-lazy-validation.js:41:37
//  3lobal code@compilation-hints-lazy-validation.js:48:3

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be found
// in the LICENSE file.

// Flags: --experimental-wasm-compilation-hints --wasm-lazy-validation

load("wasm-module-builder.js");

(function testInstantiateLazyValidation() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addFunction('id', kSig_i_i)
         .addBody([kExprLocalGet, 0,
                   kExprI64Const, 1,
                   kExprI32Mul])
         .setCompilationHint(kCompilationHintStrategyLazy,
                             kCompilationHintTierBaseline,
                             kCompilationHintTierBaseline)
         .exportFunc();

  let expected_error_msg = "Compiling function #0:\"id\" failed: i32.mul[1] " +
                           "expected type i32, found i64.const of type i64 " +
                           "@+56";
  let assertCompileErrorOnInvocation = function(instance) {
    assertThrows(() => instance.exports.id(3),
                 WebAssembly.CompileError,
                 expected_error_msg)
  };

  // Synchronous case.
  let instance = builder.instantiate();
  assertCompileErrorOnInvocation(instance);

  // Asynchronous case.
  let bytes = builder.toBuffer();
  assertPromiseResult(WebAssembly.instantiate(bytes)
    .then(p => assertCompileErrorOnInvocation(p.instance)));
})();
