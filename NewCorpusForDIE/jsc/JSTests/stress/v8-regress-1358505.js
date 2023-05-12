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

//@ requireOptions("--useResizableArrayBuffer=1")
// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax --harmony-rab-gsab

load("./resources/v8-mjsunit.js", "caller relative");
load("./resources/v8-typedarray-helpers.js", "caller relative");

(function Test_OOB() {
  function f() {
    try {
      const buffer = new ArrayBuffer(42, {'maxByteLength': 42});
      const view = new DataView(buffer, 0, 42);
      // Resize the buffer to smaller than the view.
      buffer.resize(20);
      // Any access in the view should throw.
      view.setInt8(11, 0xab);
      return 'did not prevent out-of-bounds access';
    } catch (e) {
      return 'ok';
    }
  }

  // %PrepareFunctionForOptimization(f);
  assertEquals('ok', f());
  assertEquals('ok', f());
  // %OptimizeFunctionOnNextCall(f);
  assertEquals('ok', f());
  assertEquals('ok', f());
}());

(function Test_OOB_WithOffset() {
  function f() {
    try {
      const buffer = new ArrayBuffer(42, {'maxByteLength': 42});
      const view = new DataView(buffer, 30, 42);
      // Resize the buffer to smaller than the view.
      buffer.resize(40);
      // Any access in the view should throw.
      view.setInt8(11, 0xab);
      return 'did not prevent out-of-bounds access';
    } catch (e) {
      return 'ok';
    }
  }

  // %PrepareFunctionForOptimization(f);
  assertEquals('ok', f());
  assertEquals('ok', f());
  // %OptimizeFunctionOnNextCall(f);
  assertEquals('ok', f());
  assertEquals('ok', f());
}());
