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

// Flags: --expose-wasm --expose-gc --verify-heap

load("wasm-module-builder.js");

const verifyHeap = gc;
let globalCounter = 10000000;

function testProperties(obj) {
  for (let i = 0; i < 3; i++) {
    obj.x = 1001;
    assertEquals(1001, obj.x);

    obj.y = "old";
    assertEquals("old", obj.y);

    delete obj.y;
    assertEquals("undefined", typeof obj.y);

    let uid = globalCounter++;
    let fresh = "f_" + uid;

    obj.z = fresh;
    assertEquals(fresh, obj.z);

    obj[fresh] = uid;
    assertEquals(uid, obj[fresh]);

    verifyHeap();

    assertEquals(1001, obj.x);
    assertEquals(fresh, obj.z);
    assertEquals(uid, obj[fresh]);
  }

  // These properties are special for JSFunctions.
  Object.defineProperty(obj, 'name', {value: "crazy"});
  Object.defineProperty(obj, 'length', {value: 999});
}

function minus18(x) { return x - 18; }
function id(x) { return x; }

function printName(when, f) {
  // print("    " + when + ": name=" + f.name + ", length=" + f.length);
}

// Note that this test is a helper with common code for user-properties-*.js.
