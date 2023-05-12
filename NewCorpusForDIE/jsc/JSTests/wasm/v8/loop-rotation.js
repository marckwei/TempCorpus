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

// Flags: --turbo-loop-rotation --noliftoff --nowasm-tier-up

load("wasm-module-builder.js");

(function TestTrivialLoop1() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();
  builder.addFunction("main", kSig_v_i)
    .addBody([
      kExprLoop, kWasmVoid,
        kExprLocalGet, 0,
        kExprI32Const, 1,
        kExprI32Sub,
        kExprLocalTee, 0,
        kExprBrIf, 0,
      kExprEnd,
    ])
    .exportFunc();
  let module = new WebAssembly.Module(builder.toBuffer());
  let instance = new WebAssembly.Instance(module);
  instance.exports.main(1);
  instance.exports.main(10);
  instance.exports.main(100);
})();

(function TestTrivialLoop2() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();
  builder.addFunction("main", kSig_v_i)
    .addBody([
      kExprLoop, kWasmVoid,
        kExprLocalGet, 0,
        kExprI32Const, 1,
        kExprI32Sub,
        kExprLocalTee, 0,
        kExprBrIf, 1,
        kExprBr, 0,
      kExprEnd,
    ])
    .exportFunc();
  let module = new WebAssembly.Module(builder.toBuffer());
  let instance = new WebAssembly.Instance(module);
  instance.exports.main(1);
  instance.exports.main(10);
  instance.exports.main(100);
})();

(function TestNonRotatedLoopWithStore() {
  // print(arguments.callee.name);
  var builder = new WasmModuleBuilder();
  builder.addMemory(1, undefined, false);
  builder.addFunction("main", kSig_v_i)
    .addBody([
      kExprLoop, kWasmVoid,
        kExprLocalGet, 0,
        kExprI32Const, 1,
        kExprI32Sub,
        kExprLocalTee, 0,
      kExprBrIf, 1,
        kExprI32Const, 0,
        kExprI32Const, 0,
        kExprI32StoreMem, 0, 0,
        kExprBr, 0,
      kExprEnd,
    ])
    .exportFunc();
  let module = new WebAssembly.Module(builder.toBuffer());
  let instance = new WebAssembly.Instance(module);
  instance.exports.main(1);
  instance.exports.main(10);
  instance.exports.main(100);
})();
