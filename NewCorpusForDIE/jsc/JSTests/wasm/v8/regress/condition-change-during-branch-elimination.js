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

// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

// This test creates the situation where BranchElimination's VisitIf sees a
// different condition than the preceding VisitBranch (because an interleaved
// CommonOperatorReducer replaced the condition).

(function foo() {
  let builder = new WasmModuleBuilder();

  builder.addFunction("main", kSig_v_l)
    .addLocals(kWasmI32, 2)
    .addBody([
      kExprLoop, kWasmVoid,
        kExprLocalGet, 0x02,
        kExprLocalTee, 0x01,
        kExprIf, kWasmVoid,
        kExprElse,
          kExprLoop, kWasmVoid,
            kExprLoop, kWasmVoid,
              kExprLocalGet, 0x01,
              kExprIf, kWasmVoid,
              kExprElse,
                kExprLocalGet, 0x02,
                kExprBrIf, 0x04,
                kExprBr, 0x01,
                kExprEnd,
              kExprLocalGet, 0x00,
              kExprCallFunction, 0x01,
              kExprLocalTee, 0x02,
              kExprBrIf, 0x00,
              kExprEnd,
            kExprLocalGet, 0x01,
            kExprBrIf, 0x00,
            kExprEnd,
          kExprEnd,
        kExprBr, 0x00,
        kExprEnd])
    .exportAs("main");

  builder.addFunction("callee", kSig_i_l)
         .addBody([kExprLocalGet, 0, kExprI32ConvertI64]);

  let module = new WebAssembly.Module(builder.toBuffer());
  let instance = new WebAssembly.Instance(module);
})();
