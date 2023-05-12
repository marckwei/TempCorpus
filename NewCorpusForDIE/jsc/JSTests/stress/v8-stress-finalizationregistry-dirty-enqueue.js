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

// Flags: --stress-compaction --expose-gc

// Test that the dirty FinalizationRegistries that are enqueued during GC have
// their slots correctly recorded by the GC.

// 1) Create many JSFinalizationRegistry objects so that they span several pages
// (page size is 256kb).
let registries = [];
for (let i = 0; i < 1024 * 8; i++) {
  registries.push(new FinalizationRegistry(() => {}));
}

// 2) Force two GCs to ensure that JSFinalizatonRegistry objects are tenured.
gc();
gc();

// 3) In a function: create a dummy target and register it in all
// JSFinalizatonRegistry objects.
(function() {
  let garbage = {};
  registries.forEach((fr) => {
    fr.register(garbage, 42);
  });
  garbage = null;
})();

// 4) Outside the function where the target is unreachable: force GC to collect
// the object.
gc();

// 5) Force another GC to test that the slot was correctly updated.
gc();
