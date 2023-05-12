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

// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --harmony-weak-refs --expose-gc --noincremental-marking

load("./resources/v8-mjsunit.js", "caller relative");

let cleanup_call_count1 = 0;
let cleanup_call_count2 = 0;
let cleanup = function(holdings) {
    if (holdings === "holdings1")
        ++cleanup_call_count1;
    else if (holdings === "holdings2")
        ++cleanup_call_count2;
    else
        throw new Error();
}

let fg1 = new FinalizationRegistry(cleanup);
let fg2 = new FinalizationRegistry(cleanup);

// Create two objects and register them in FinalizationRegistries. The objects need
// to be inside a closure so that we can reliably kill them!

(function() {
    for (let i = 0; i < 1000; ++i) {
        let symbol1 = Symbol();
        fg1.register(symbol1, "holdings1");

        let symbol2 = Symbol();
        fg2.register(symbol2, "holdings2");
    }
    // symbol1 and symbol2 go out of scope.
})();

// This GC will discover dirty WeakCells and schedule cleanup.
gc();
assertEquals(0, cleanup_call_count1);
assertEquals(0, cleanup_call_count2);

// Assert that the cleanup function was called.
let timeout_func = function() {
    assertNotEquals(0, cleanup_call_count1);
    assertNotEquals(0, cleanup_call_count2);
}

setTimeout(timeout_func, 0);