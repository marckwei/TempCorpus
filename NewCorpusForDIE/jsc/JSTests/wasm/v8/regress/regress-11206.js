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

// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-gc --stress-compaction --stress-scavenge=16

load('wasm-module-builder.js');

(function TestReturnOddNumberOfReturns() {
  let builder = new WasmModuleBuilder();
  let void_sig = builder.addType(kSig_v_v);
  let mv_sig = builder.addType(
      makeSig([], [kWasmI32, kWasmI32, kWasmI32, kWasmI32, kWasmI32]));

  let gc_index = builder.addImport('q', 'gc', void_sig);
  builder.addFunction('main', mv_sig)
      .addBodyWithEnd([
        kExprCallFunction, gc_index,
        kExprI32Const, 1,
        kExprI32Const, 2,
        kExprI32Const, 3,
        kExprI32Const, 4,
        kExprI32Const, 5,
        kExprEnd
      ])
      .exportFunc();

  let instance = builder.instantiate({q: {gc: gc}});

  instance.exports.main();
})();

(function TestReturnEvenNumberOfReturns() {
  let builder = new WasmModuleBuilder();
  let void_sig = builder.addType(kSig_v_v);
  let mv_sig =
      builder.addType(makeSig([], [kWasmI32, kWasmI32, kWasmI32, kWasmI32]));

  let gc_index = builder.addImport('q', 'gc', void_sig);
  builder.addFunction('main', mv_sig)
      .addBodyWithEnd([
        kExprCallFunction, gc_index,
        kExprI32Const, 1,
        kExprI32Const, 2,
        kExprI32Const, 3,
        kExprI32Const, 4,
        kExprEnd
      ])
      .exportFunc();

  let instance = builder.instantiate({q: {gc: gc}});

  instance.exports.main();
})();
