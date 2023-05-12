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
// Exception: Did not throw exception, expected RangeError
// Probably need to implement something like v8's --wasm-max-table-size=10

// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --wasm-max-table-size=10

load("wasm-module-builder.js");

// With the flags we set the maximum table size to 10, so 11 is out-of-bounds.
const oob = 11;

(function TestJSTableInitialAboveTheLimit() {
  // print(arguments.callee.name);
  assertThrows(
    () => new WebAssembly.Table({ initial: oob, element: "anyfunc" }),
    RangeError, /above the upper bound/);
})();

(function TestJSTableMaximumAboveTheLimit() {
  // print(arguments.callee.name);
  let table =
      new WebAssembly.Table({initial: 1, maximum: oob, element: 'anyfunc'});
  assertThrows(() => table.grow(oob - 1), RangeError, /failed to grow table/);
})();

(function TestDecodeTableInitialAboveTheLimit() {
  // print(arguments.callee.name);
  const builder = new WasmModuleBuilder();
  builder.setTableBounds(oob);
  assertThrows(
    () => builder.instantiate(),
    RangeError, /is larger than implementation limit/);
})();

(function TestDecodeTableMaximumAboveTheLimit() {
  // print(arguments.callee.name);
  const builder = new WasmModuleBuilder();
  builder.setTableBounds(1, oob);
  // Should not throw, as the table does not exceed the limit at instantiation
  // time.
  builder.instantiate();
})();
