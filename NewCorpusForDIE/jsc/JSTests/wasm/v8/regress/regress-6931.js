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

// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


load('wasm-module-builder.js');


// This test checks for accidental sign extension. The Wasm spec says we do
// arbitrary precision unsigned arithmetic to compute the memory address,
// meaning this test should do 0xfffffffc + 8, which is 0x100000004 and out of
// bounds. However, if we interpret 0xfffffffc as -4, then the result is 4 and
// succeeds erroneously.


(function() {
  let builder = new WasmModuleBuilder();
  builder.addMemory(1, 1, false);
  builder.addFunction('test', kSig_v_v)
      .addBody([
        kExprI32Const, 0x7c, // address = -4
        kExprI32Const, 0,
        kExprI32StoreMem, 0, 8, // align = 0, offset = 8
      ])
      .exportFunc();
  let module = builder.instantiate();

  assertTraps(kTrapMemOutOfBounds, module.exports.test);
})();
