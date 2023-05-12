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

//@ skip if $memoryLimited
// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

(function DoTest() {

  var stdlib = this;
  try {
    var buffer = new ArrayBuffer((2097120) * 1024);
  } catch (e) {
    // Out of memory: soft pass because 2GiB is actually a lot!
    print("OOM: soft pass");
    return;
  }
  var foreign = {}

  var m = (function Module(stdlib, foreign, heap) {
    "use asm";
    var MEM16 = new stdlib.Int16Array(heap);
    function load(i) {
      i = i|0;
      i = MEM16[i >> 1]|0;
      return i | 0;
    }
    function store(i, v) {
      i = i|0;
      v = v|0;
      MEM16[i >> 1] = v;
    }
    function load8(i) {
      i = i|0;
      i = MEM16[i + 8 >> 1]|0;
      return i | 0;
    }
    function store8(i, v) {
      i = i|0;
      v = v|0;
      MEM16[i + 8 >> 1] = v;
    }
    return { load: load, store: store, load8: load8, store8: store8 };
  })(stdlib, foreign, buffer);

  assertEquals(0, m.load(-8));
  assertEquals(0, m.load8(-16));
  m.store(2014, 2, 30, 1, 0);
  assertEquals(0, m.load8(-8));
  m.store8(-8, 99);
  assertEquals(99, m.load(0));
  assertEquals(99, m.load8(-8));
})();
