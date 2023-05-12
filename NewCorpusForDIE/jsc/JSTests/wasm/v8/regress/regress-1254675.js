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

//@ requireOptions("--useWebAssemblySIMD=0")
// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This test should only be run on configurations that don't support Wasm SIMD.

load('wasm-module-builder.js');

// Test case manually reduced from https://crbug.com/1254675.
// This exercises a bug where we are missing checks for SIMD hardware support
// when a function has a v128 parameter but doesn't use any SIMD instructions.
(function() {
  const builder = new WasmModuleBuilder();
    builder.addType(kSig_i_s);
    builder.addFunction(undefined, 0)
            .addBodyWithEnd([kExprUnreachable, kExprEnd]);

  assertThrows(() => builder.instantiate());
}());

// Additional test case to verify that a declared v128 local traps.
(function() {
  const builder = new WasmModuleBuilder();
    builder.addType(kSig_i_i);
    builder.addFunction(undefined, 0)
           .addBodyWithEnd([kExprUnreachable, kExprEnd])
           .addLocals('v128', 1);

  assertThrows(() => builder.instantiate());
}());
