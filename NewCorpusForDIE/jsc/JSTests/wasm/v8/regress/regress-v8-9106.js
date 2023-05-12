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

// Make sure DCHECK doesn't fire when passive data segment is at the end of the
// module.
let bytes = new Uint8Array([
  0,   97,  115, 109, 1,   0,   0,   0,   1,   132, 128, 128, 128, 0,   1,
  96,  0,   0,   3,   133, 128, 128, 128, 0,   4,   0,   0,   0,   0,   5,
  131, 128, 128, 128, 0,   1,   0,   1,   7,   187, 128, 128, 128, 0,   4,
  12,  100, 114, 111, 112, 95,  112, 97,  115, 115, 105, 118, 101, 0,   0,
  12,  105, 110, 105, 116, 95,  112, 97,  115, 115, 105, 118, 101, 0,   1,
  11,  100, 114, 111, 112, 95,  97,  99,  116, 105, 118, 101, 0,   2,   11,
  105, 110, 105, 116, 95,  97,  99,  116, 105, 118, 101, 0,   3,   12,  129,
  128, 128, 128, 0,   2,   10,  183, 128, 128, 128, 0,   4,   133, 128, 128,
  128, 0,   0,   252, 9,   0,   11,  140, 128, 128, 128, 0,   0,   65,  0,
  65,  0,   65,  0,   252, 8,   0,   0,   11,  133, 128, 128, 128, 0,   0,
  252, 9,   1,   11,  140, 128, 128, 128, 0,   0,   65,  0,   65,  0,   65,
  0,   252, 8,   1,   0,   11,  11,  136, 128, 128, 128, 0,   2,   1,   0,
  0,   65,  0,   11,  0
]);
new WebAssembly.Instance(new WebAssembly.Module(bytes));
