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

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-eh

load("wasm-module-builder.js");

(function TestRegress9832() {
  let builder = new WasmModuleBuilder();
  let f = builder.addFunction("f", kSig_i_i)
      .addBody([
        kExprLocalGet, 0,
        kExprLocalGet, 0,
        kExprI32Add,
      ]).exportFunc();
  builder.addFunction("main", kSig_i_i)
      .addBody([
        kExprTry, kWasmVoid,
          kExprLocalGet, 0,
          kExprCallFunction, f.index,
          kExprCallFunction, f.index,
          kExprLocalSet, 0,
        kExprCatchAll,
          kExprLocalGet, 0,
          kExprCallFunction, f.index,
          kExprLocalSet, 0,
          kExprEnd,
        kExprLocalGet, 0,
      ]).exportFunc();
  let instance = builder.instantiate();
  assertEquals(92, instance.exports.main(23));
})();
