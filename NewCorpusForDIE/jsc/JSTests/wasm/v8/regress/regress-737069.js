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

// Flags: --expose-wasm

load("wasm-module-builder.js");

let binary = new Binary;

binary.emit_header();
binary.emit_section(kTypeSectionCode, section => {
  section.emit_u32v(1); // number of types
  section.emit_u8(kWasmFunctionTypeForm);
  section.emit_u32v(0); // number of parameters
  section.emit_u32v(0); // number of returns
});
binary.emit_section(kFunctionSectionCode, section => {
  section.emit_u32v(1); // number of functions
  section.emit_u32v(0); // type index
});

binary.emit_u8(kCodeSectionCode);
binary.emit_u8(0x02); // section length
binary.emit_u8(0x01); // number of functions
binary.emit_u8(0x40); // function body size
// Function body is missing here.

let buffer = new ArrayBuffer(binary.length);
let view = new Uint8Array(buffer);
for (let i = 0; i < binary.length; i++) {
  view[i] = binary[i] | 0;
}
WebAssembly.validate(buffer);
