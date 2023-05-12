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
// Exception: TypeError: WebAssembly.compileStreaming is not a function. (In 'WebAssembly.compileStreaming(Promise.resolve(bytes))', 'WebAssembly.compileStreaming' is undefined)
//  TestCompileStreaming@streaming-api.js:23:51
//  global code@streaming-api.js:26:3

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --wasm-test-streaming

load("wasm-module-builder.js");

(function TestCompileStreaming() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addFunction("main", kSig_i_i)
         .addBody([kExprLocalGet, 0])
         .exportAs("main");
  let bytes = builder.toBuffer();
  assertPromiseResult(WebAssembly.compileStreaming(Promise.resolve(bytes)).then(
    module => WebAssembly.instantiate(module)).then(
      instance => assertEquals(5, instance.exports.main(5))));
})();

(function TestInstantiateStreaming() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addFunction("main", kSig_i_i)
         .addBody([kExprLocalGet, 0])
         .exportAs("main");
  let bytes = builder.toBuffer();
  assertPromiseResult(WebAssembly.instantiateStreaming(Promise.resolve(bytes)).then(
    ({module, instance}) => assertEquals(5, instance.exports.main(5))));
})();

(function TestCompileStreamingRejectedInputPromise() {
  // print(arguments.callee.name);
  assertPromiseResult(WebAssembly.compileStreaming(Promise.reject("myError")),
    assertUnreachable,
    error => assertEquals(error, "myError"));
})();

(function TestInstantiateStreamingRejectedInputPromise() {
  // print(arguments.callee.name);
  assertPromiseResult(WebAssembly.instantiateStreaming(Promise.reject("myError")),
    assertUnreachable,
    error => assertEquals(error, "myError"));
})();

(function TestStreamingErrorMessage() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addFunction("main", kSig_i_i)
         .addBody([kExprLocalGet, 0,
                   kExprLocalGet, 0,
                   kExprF32Mul])
         .exportAs("main");
  let bytes = builder.toBuffer();
  assertPromiseResult(WebAssembly.compileStreaming(Promise.resolve(bytes)),
    assertUnreachable,
    error => assertEquals("WebAssembly.compileStreaming(): Compiling " +
                          "function #0:\"main\" failed: f32.mul[1] expected " +
                          "type f32, found local.get of type i32 @+37",
                          error.message));
  assertPromiseResult(WebAssembly.instantiateStreaming(Promise.resolve(bytes)),
    assertUnreachable,
    error => assertEquals("WebAssembly.instantiateStreaming(): Compiling " +
                          "function #0:\"main\" failed: f32.mul[1] expected " +
                          "type f32, found local.get of type i32 @+37",
                          error.message));
})();
