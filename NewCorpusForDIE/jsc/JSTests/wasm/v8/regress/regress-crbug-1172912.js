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

// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-typed-funcref

let raw = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d,  // wasm magic
  0x01, 0x00, 0x00, 0x00,  // wasm version

  0x01,  // section: types
  0x05,  // section length
  0x01,  // types count
  0x60,  // function type
  0x00,  // param count
  0x01,  // return count
  0x7f,  // i32

  0x03,  // section: functions
  0x02,  // section size: 2
  0x01,  // function count: 1
  0x00,  // sig index: 0

  0x07,  // section: exports
  0x08,  // section size
  0x01,  // exports count
  0x04,  // name length: 4
  0x6d, 0x61, 0x69, 0x6e,  // name: "main"
  0x00,  // export kind: function
  0x00,  // export function index: 0

  0x0a,  // section: code
  0x0d,  // section length
  0x01,  // functions count: 1
  0x0b,  // body size
  0x00,  // locals count
  0xd2, 0x00,  // ref.func 0
  0xd1,  // ref.is_null
  0x04, 0x40,  // if [void]
  0x05,  // else
  0x0b,  // end
  0x41, 0x2a,  // i32.const: 42
  0x0b,  // end
]);
let buff = raw.buffer;
let mod = new WebAssembly.Module(buff);
let inst = new WebAssembly.Instance(mod);
let result = inst.exports.main();
assertEquals(42, result);
