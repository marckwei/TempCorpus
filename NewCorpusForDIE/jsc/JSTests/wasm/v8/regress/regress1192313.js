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

// Flags: --experimental-wasm-eh --experimental-wasm-threads

load("wasm-module-builder.js");

(function Regress1192313() {
  // print(arguments.callee.name);
  let builder = new WasmModuleBuilder();
  builder.addMemory(16, 32);
  builder.addFunction('f', kSig_i_i)
      .addBody([
          kExprTry, kWasmI32,
            kExprI32Const, 0,
            kExprI32Const, 0,
            kExprCallFunction, 0,
            kAtomicPrefix, kExprI32AtomicAnd8U,
            0x00, 0xba, 0xe2, 0x81, 0xd6, 0x0b,
          kExprCatchAll,
            kExprTry, kWasmI32,
              kExprI32Const, 0,
              kExprI32Const, 0,
              kAtomicPrefix, kExprI32AtomicAnd8U,
              0x00, 0x85, 0x97, 0xc4, 0x5f,
            kExprDelegate, 1,
          kExprEnd]).exportFunc();
  let instance = builder.instantiate();
})();
