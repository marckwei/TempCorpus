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

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load("wasm-module-builder.js");

(function() {
  function repeat(value, length) {
    var arr = new Array(length);
    for (let i = 0; i < length; i++) {
      arr[i] = value;
    }
    return arr;
  }
  function br_table(block_index, length, def_block) {
    const bytes = new Binary();
    bytes.emit_bytes([kExprBrTable]);
    // Functions count (different than the count in the functions section.
    bytes.emit_u32v(length);
    bytes.emit_bytes(repeat(block_index, length));
    bytes.emit_bytes([def_block]);
    return Array.from(bytes.trunc_buffer());
  }
  var builder = new WasmModuleBuilder();
  builder.addMemory(12, 12, false);
  builder.addFunction("foo", kSig_v_iii)
    .addBody([].concat([
      kExprBlock, kWasmVoid,
        kExprLocalGet, 0x2,
        kExprI32Const, 0x01,
        kExprI32And,
        // Generate a test branch (which has 32k limited reach).
        kExprIf, kWasmVoid,
          kExprLocalGet, 0x0,
          kExprI32Const, 0x01,
          kExprI32And,
          kExprBrIf, 0x1,
          kExprLocalGet, 0x0,
          // Emit a br_table that is long enough to make the test branch go out of range.
          ], br_table(0x1, 9000, 0x00), [
        kExprEnd,
      kExprEnd,
    ])).exportFunc();
  builder.instantiate();
})();
