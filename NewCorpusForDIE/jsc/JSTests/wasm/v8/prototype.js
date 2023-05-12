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
// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

let emptyModuleBinary = new WasmModuleBuilder().toBuffer();

(function ModulePrototype() {
  class _Module extends WebAssembly.Module {}
  let module = new _Module(emptyModuleBinary);
  assertInstanceof(module, _Module);
  assertInstanceof(module, WebAssembly.Module);
})();

(function InstancePrototype() {
  class _Instance extends WebAssembly.Instance {}
  let instance = new _Instance(new WebAssembly.Module(emptyModuleBinary));
  assertInstanceof(instance, _Instance);
  assertInstanceof(instance, WebAssembly.Instance);
})();

(function TablePrototype() {
  class _Table extends WebAssembly.Table {}
  let table = new _Table({initial: 0, element: "anyfunc"});
  assertInstanceof(table, _Table);
  assertInstanceof(table, WebAssembly.Table);
})();

(function MemoryPrototype() {
  class _Memory extends WebAssembly.Memory {}
  let memory = new _Memory({initial: 0, maximum: 1});
  assertInstanceof(memory, _Memory);
  assertInstanceof(memory, WebAssembly.Memory);
})();

(function GlobalPrototype() {
  class _Global extends WebAssembly.Global {}
  let global = new _Global({value: 'i32', mutable: false}, 0);
  assertInstanceof(global, _Global);
  assertInstanceof(global, WebAssembly.Global);
})();
