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
// Exception: ReferenceError: Can't find variable: readbuffer
//  ensure_incrementer@ensure-wasm-binaries-up-to-date.js:38:24
//  global code@ensure-wasm-binaries-up-to-date.js:43:2
// Looks like we need readbuffer().

// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

// Ensure checked in wasm binaries used by integration tests from v8 hosts
// (such as chromium) are up to date.

(function print_incrementer() {
  if (true) return; // remove to regenerate the module

  load("wasm-module-builder.js");

  var module = new WasmModuleBuilder();
  module.addFunction(undefined, kSig_i_i)
    .addBody([kExprLocalGet, 0, kExprI32Const, 1, kExprI32Add])
    .exportAs("increment");

  var buffer = module.toBuffer(true);
  var view = new Uint8Array(buffer);

  // print("const unsigned char module[] = {");
  for (var i = 0; i < buffer.byteLength; i++) {
    // print("  " + view[i] + ",");
  }
  // print("};");
})();

(function ensure_incrementer() {
  var buff = readbuffer("incrementer.wasm");
  var mod = new WebAssembly.Module(buff);
  var inst = new WebAssembly.Instance(mod);
  var inc = inst.exports.increment;
  assertEquals(3, inc(2));
}())
