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

// Flags: --wasm-lazy-compilation

load("wasm-module-builder.js");

(function ExportedFunctionsImportedOrder() {
  // print(arguments.callee.name);

  let i1 = (() => {
    let builder = new WasmModuleBuilder();
    builder.addFunction("f1", kSig_i_v)
      .addBody(
        [kExprI32Const, 1])
      .exportFunc();
    builder.addFunction("f2", kSig_i_v)
      .addBody(
        [kExprI32Const, 2])
      .exportFunc();
    return builder.instantiate();
  })();

  let i2 = (() => {
    let builder = new WasmModuleBuilder();
    builder.addImport("q", "f2", kSig_i_v);
    builder.addImport("q", "f1", kSig_i_v);
    builder.addTable(kWasmAnyFunc, 4);
    builder.addFunction("main", kSig_i_i)
      .addBody([
        kExprLocalGet, 0,
        kExprCallIndirect, 0, kTableZero
      ])
      .exportFunc();
    builder.addActiveElementSegment(0, wasmI32Const(0), [0, 1, 1, 0]);

    return builder.instantiate({q: {f2: i1.exports.f2, f1: i1.exports.f1}});
  })();

  // print("--->calling 0");
  assertEquals(2, i2.exports.main(0));
  // print("--->calling 1");
  assertEquals(1, i2.exports.main(1));
  // print("--->calling 2");
  assertEquals(1, i2.exports.main(2));
  // print("--->calling 3");
  assertEquals(2, i2.exports.main(3));
})();
