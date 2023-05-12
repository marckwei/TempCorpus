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

// Flags: --expose-wasm

load("wasm-module-builder.js");

function toBytes(string) {
  var a = new Array(string.length + 1);
  a[0] = string.length;
  for (i = 0; i < string.length; i++) {
    a[i + 1] = string.charCodeAt(i);
  }
  return a;
}

(function TestEmptyNamesSection() {
  // print('TestEmptyNamesSection...');
  var builder = new WasmModuleBuilder();

  builder.addExplicitSection([kUnknownSectionCode, 6, ...toBytes('name'), 0]);

  var buffer = builder.toBuffer();
  assertTrue(WebAssembly.validate(buffer));
  assertTrue((new WebAssembly.Module(buffer)) instanceof WebAssembly.Module);
})();

(function TestTruncatedNamesSection() {
  // print('TestTruncatedNamesSection...');
  var builder = new WasmModuleBuilder();

  builder.addExplicitSection([kUnknownSectionCode, 6, ...toBytes('name'), 1]);

  var buffer = builder.toBuffer();
  assertTrue(WebAssembly.validate(buffer));
  assertTrue((new WebAssembly.Module(buffer)) instanceof WebAssembly.Module);
})();

(function TestBrokenNamesSection() {
  // print('TestBrokenNamesSection...');
  var builder = new WasmModuleBuilder();

  builder.addExplicitSection(
      [kUnknownSectionCode, 7, ...toBytes('name'), 1, 100]);

  var buffer = builder.toBuffer();
  assertTrue(WebAssembly.validate(buffer));
  assertTrue((new WebAssembly.Module(buffer)) instanceof WebAssembly.Module);
})();
