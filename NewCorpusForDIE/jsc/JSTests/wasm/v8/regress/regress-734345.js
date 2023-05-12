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

// Flags: --expose-gc

load('wasm-module-builder.js');

builder1 = new WasmModuleBuilder();
builder1.addFunction('exp1', kSig_v_v).addBody([kExprUnreachable]).exportFunc();

builder2 = new WasmModuleBuilder();
builder2.addImport('imp', 'imp', kSig_v_v);
builder2.addFunction('call_imp', kSig_v_v)
    .addBody([kExprCallFunction, 0])
    .exportFunc();

export1 = builder1.instantiate().exports.exp1;
export2 = builder2.instantiate({imp: {imp: export1}}).exports.call_imp;
export1 = undefined;

let a = [0];
for (i = 0; i < 10; ++i) {
  a = a.concat(new Array(i).fill(i));
  assertThrows(() => export2(), WebAssembly.RuntimeError);
  gc();
}
