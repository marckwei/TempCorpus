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
// Exception: Failure (Error message):
//  expected:
//  should match '/has to be in the same reference type hierarchy/'
//  found:
//  "WebAssembly.Module doesn't parse at byte 12: 0th type failed to parse because struct types are not enabled (evaluating 'new WebAssembly.Module(this.toBuffer(debug))')"

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-gc

load("wasm-module-builder.js");

(function TestRefTestInvalid() {
  let struct = 0;
  let array = 1;
  let sig = 2;
  let types = [
    // source value type |target heap type
    [kWasmI32,            kAnyRefCode],
    [kWasmNullExternRef,  struct],
    [wasmRefType(struct), kNullFuncRefCode],
    [wasmRefType(array),  kFuncRefCode],
    [wasmRefType(struct), sig],
    [wasmRefType(sig),    struct],
    [wasmRefType(sig),    kExternRefCode],
    [kWasmAnyRef,         kExternRefCode],
    [kWasmAnyRef,         kFuncRefCode],
  ];
  let casts = [
    kExprRefTest,
    kExprRefTestNull,
    kExprRefCast,
    kExprRefCastNull,
  ];

  for (let [source_type, target_type_imm] of types) {
    for (let cast of casts) {
      let builder = new WasmModuleBuilder();
      assertEquals(struct, builder.addStruct([makeField(kWasmI32, true)]));
      assertEquals(array, builder.addArray(kWasmI32));
      assertEquals(sig, builder.addType(makeSig([kWasmI32], [])));
      builder.addFunction('refTest', makeSig([source_type], []))
      .addBody([
        kExprLocalGet, 0,
        kGCPrefix, cast, target_type_imm,
        kExprDrop,
      ]);

      assertThrows(() => builder.instantiate(),
                  WebAssembly.CompileError,
                  /has to be in the same reference type hierarchy/);
    }
  }
})();
