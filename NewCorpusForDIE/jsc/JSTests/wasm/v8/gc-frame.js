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

// Flags: --expose-wasm --expose-gc

load("wasm-module-builder.js");

function makeFFI(func, t) {
  var builder = new WasmModuleBuilder();

  var sig_index = builder.addType(makeSig([t,t,t,t,t,t,t,t,t,t], [t]));
  builder.addImport("m", "func", sig_index);
  // Try to create a frame with lots of spilled values and parameters
  // on the stack to try to catch GC bugs in the reference maps for
  // the different parts of the stack.
  builder.addFunction("main", sig_index)
    .addBody([
      kExprLocalGet, 0,         // --
      kExprLocalGet, 1,         // --
      kExprLocalGet, 2,         // --
      kExprLocalGet, 3,         // --
      kExprLocalGet, 4,         // --
      kExprLocalGet, 5,         // --
      kExprLocalGet, 6,         // --
      kExprLocalGet, 7,         // --
      kExprLocalGet, 8,         // --
      kExprLocalGet, 9,         // --
      kExprCallFunction, 0,     // --
      kExprDrop,                // --
      kExprLocalGet, 0,         // --
      kExprLocalGet, 1,         // --
      kExprLocalGet, 2,         // --
      kExprLocalGet, 3,         // --
      kExprLocalGet, 4,         // --
      kExprLocalGet, 5,         // --
      kExprLocalGet, 6,         // --
      kExprLocalGet, 7,         // --
      kExprLocalGet, 8,         // --
      kExprLocalGet, 9,         // --
      kExprCallFunction, 0,    // --
    ])                          // --
    .exportFunc();

  return builder.instantiate({m: {func: func}}).exports.main;
}


function print10(a, b, c, d, e, f, g, h, i) {
  // print(a + ",", b + ",", c + ",", d + ",", e + ",", f + ",", g + ",", h + ",", i);
  gc();
  // print(a + ",", b + ",", c + ",", d + ",", e + ",", f + ",", g + ",", h + ",", i);
}

(function I32Test() {
  var main = makeFFI(print10, kWasmI32);
  for (var i = 1; i < 0xFFFFFFF; i <<= 2) {
    main(i - 1, i, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8);
  }
})();

(function F32Test() {
  var main = makeFFI(print10, kWasmF32);
  for (var i = 1; i < 2e+30; i *= -157) {
    main(i - 1, i, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8);
  }
})();

(function F64Test() {
  var main = makeFFI(print10, kWasmF64);
  for (var i = 1; i < 2e+80; i *= -1137) {
    main(i - 1, i, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8);
  }
})();

(function GCInJSToWasmTest() {
  var builder = new WasmModuleBuilder();

  var sig_index = builder.addType(kSig_i_i);
  builder.addFunction("main", sig_index)
    .addBody([
      kExprLocalGet, 0,         // --
    ])                          // --
    .exportFunc();

  var main = builder.instantiate({}).exports.main;

  var gc_object = {
      valueOf: function() {
        // Call the GC in valueOf, which is called within the JSToWasm wrapper.
        gc();
        return {};
      }
  };

  main(gc_object);
})();
