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
// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm --expose-gc --verify-heap

load("user-properties-common.js");

(function ModuleTest() {
  for (f of [x => (x + 19 + globalCounter), minus18]) {
    // print("ModuleTest");

    let builder = new WasmModuleBuilder();
    builder.addImport("m", "f", kSig_i_i);
    builder.addFunction("main", kSig_i_i)
      .addBody([
        kExprLocalGet, 0,
        kExprCallFunction, 0])
      .exportAs("main");
    builder.addMemory(1, 1, false)
      .exportMemoryAs("memory")

    let module = builder.toModule();
    testProperties(module);

    for (let i = 0; i < 3; i++) {
      // print("  instance " + i);
      let instance = new WebAssembly.Instance(module, {m: {f: f}});
      testProperties(instance);

      // print("  memory   " + i);
      let m = instance.exports.memory;
      assertInstanceof(m, WebAssembly.Memory);
      testProperties(m);

      // print("  function " + i);
      let g = instance.exports.main;
      assertInstanceof(g, Function);
      printName("before", g);
      testProperties(g);
      printName(" after", g);
      assertInstanceof(g, Function);
      testProperties(g);
      for (let j = 10; j < 15; j++) {
        assertEquals(f(j), g(j));
      }
      verifyHeap();
      // The Wasm-internal fields of {g} are only inspected when {g} is
      // used as an import into another instance. Use {g} as the import
      // the next time through the loop.
      f = g;
    }
  }
})();
