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

let cleanup_called = false;
let holdings_list = [];
let cleanup = function(holdings) {
  assertFalse(cleanup_called);
  holdings_list.push(holdings);
  cleanup_called = true;
}

let fg = new FinalizationRegistry(cleanup);
let s1 = Symbol();
let holdings = {'a': 'this is the holdings object'};

// Ignition holds references to objects in temporary registers. These will be
// released when the function exits. So only access o inside a function to
// prevent any references to objects in temporary registers when a gc is
// triggered.
(() => {fg.register(s1, holdings);})()

gc();
assertFalse(cleanup_called);

// Drop the last references to s1.
(() => {s1 = null;})()

// Drop the last reference to the holdings. The FinalizationRegistry keeps it
// alive, so the cleanup function will be called as normal.
holdings = null;
gc();
assertFalse(cleanup_called);

let timeout_func = function() {
  assertTrue(cleanup_called);
  assertEquals(holdings_list.length, 1);
  assertEquals(holdings_list[0].a, "this is the holdings object");
}

setTimeout(timeout_func, 0);
