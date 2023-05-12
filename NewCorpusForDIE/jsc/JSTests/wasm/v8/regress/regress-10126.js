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

// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('wasm-module-builder.js')

let binary = new Binary;
binary.emit_bytes([
  kWasmH0,              //  0 header
  kWasmH1,              //  1 -
  kWasmH2,              //  2 -
  kWasmH3,              //  3 -
  kWasmV0,              //  4 version
  kWasmV1,              //  5 -
  kWasmV2,              //  6 -
  kWasmV3,              //  7 -
  kUnknownSectionCode,  //  8 custom section
  0x5,                  //  9 length
  0x6,                  // 10 invalid name length
  'a',                  // 11 payload
  'b',                  // 12 -
  'c',                  // 13 -
  'd',                  // 14 -
  kCodeSectionCode,     // 15 code section start
  0x1,                  // 16 code section length
  19,                   // 17 invalid number of functions
]);

const buffer = binary.trunc_buffer();
assertThrowsAsync(
    WebAssembly.compile(buffer), WebAssembly.CompileError,
    `WebAssembly.Module doesn't parse at byte 11: nameLen get 1th custom section's name of length 6`);
