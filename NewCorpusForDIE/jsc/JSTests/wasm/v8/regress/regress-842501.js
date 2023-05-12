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

// Flags: --no-wasm-trap-handler

load('wasm-module-builder.js');

(function() {
  const builder = new WasmModuleBuilder();
  builder.addMemory(16, 32);
  // Generate function 1 (out of 1).
  sig1 = makeSig([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]);
  builder.addFunction(undefined, sig1)
    .addBodyWithEnd([
      // signature: i_iii
      // body:
      kExprI32Const, 0xe1, 0xc8, 0xd5, 0x01,
      kExprI32Const, 0xe2, 0xe4, 0x00,
      kExprI32Sub,
      kExprF32Const, 0x00, 0x00, 0x00, 0x00,
      kExprF32Const, 0xc9, 0xc9, 0xc9, 0x00,
      kExprF32Eq,
      kExprI32LoadMem, 0x01, 0xef, 0xec, 0x95, 0x93, 0x07,
      kExprI32Add,
      kExprIf, kWasmVoid,   // @30
      kExprEnd,             // @32
      kExprI32Const, 0xc9, 0x93, 0xdf, 0xcc, 0x7c,
      kExprEnd,             // @39
    ]);
  builder.addExport('main', 0);
  const instance = builder.instantiate();
  assertTraps(kTrapMemOutOfBounds, _ => instance.exports.main(1, 2, 3));
})();
