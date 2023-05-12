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

load("wasm-module-builder.js");

const builder = new WasmModuleBuilder();
builder.addMemory(1, undefined, false);
builder.addFunction('load', kSig_i_ii)
    .addBody([
        kExprLocalGet, 0,
        kExprI64SConvertI32,
        kExprLocalGet, 1,
        kExprI64SConvertI32,
        kExprI64Shl,
        kExprI32ConvertI64,
    kExprI32LoadMem, 0, 0])
    .exportFunc();

const module = builder.instantiate();
let start = 12;
let address = start;
for (i = 0; i < 64; i++) {
  // This is the address which will be accessed in the code. We cannot use
  // shifts to calculate the address because JS shifts work on 32-bit integers.
  // print(`address=${address}`);
  if (address < kPageSize) {
    assertEquals(0, module.exports.load(start, i));
  } else {
    assertTraps(kTrapMemOutOfBounds, _ => { module.exports.load(start, i);});
  }
  address = (address * 2) % 4294967296;
}
