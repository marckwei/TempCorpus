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

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var bytes = [
  0,   97,  115, 109, 1,   0,   0,   0,   1,  11,  2,   96,  2,   126, 124,
  1,   126, 96,  0,   1,   124, 3,   2,   1,  0,   4,   5,   1,   112, 1,
  6,   6,   10,  114, 1,   112, 4,   244, 2,  127, 118, 126, 31,  125, 1,
  124, 2,   126, 2,   64,  2,   127, 3,   64, 2,   124, 3,   127, 65,  0,
  65,  0,   13,  3,   33,  142, 1,   65,  0,  13,  0,   65,  0,   11,  65,
  0,   13,  2,   34,  143, 1,   34,  241, 2,  34,  191, 2,   34,  242, 2,
  34,  208, 2,   33,  144, 1,   2,   127, 65, 0,   4,   64,  65,  0,   13,
  5,   11,  65,  0,   11,  33,  145, 1,   65, 0,   17,  1,   0,   11,  33,
  139, 4,   65,  0,   13,  0,   11,  12,  1,  11,  13,  0,   11,  66,  128,
  127, 34,  189, 3,   65,  0,   13,  0,   34, 199, 3,   11,  11
];
var module = new WebAssembly.Module(new Uint8Array(bytes));
new WebAssembly.Instance(module);
