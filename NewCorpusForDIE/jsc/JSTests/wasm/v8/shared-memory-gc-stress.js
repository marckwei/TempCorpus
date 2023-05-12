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

//@ requireOptions("--useBBQJIT=1", "--useWasmLLInt=1", "--wasmLLIntTiersUpToBBQ=1")
// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function AllocMemory(pages, max = pages) {
  let m =
      new WebAssembly.Memory({initial : pages, maximum : max, shared : true});
  let v = new Int32Array(m.buffer);
  return {memory : m, view : v};
}

function RunSomeAllocs(total, retained, pages, max = pages) {
  // print(`-------iterations = ${total}, retained = ${retained} -------`);
  var array = new Array(retained);
  for (var i = 0; i < total; i++) {
/*
    if ((i % 25) == 0)
      print(`iteration ${i}`);
 */
    let pair = AllocMemory(pages, max);
    // For some iterations, retain the memory, view, or both.
    switch (i % 3) {
    case 0:
      pair.memory = null;
      break;
    case 1:
      pair.view = null;
      break;
    case 2:
      break;
    }
    array[i % retained] = pair;
  }
}

RunSomeAllocs(10, 1, 1, 1);
RunSomeAllocs(100, 3, 1, 1);
RunSomeAllocs(1000, 10, 1, 1);
// TODO(12278): Make this faster (by collection memories earlier?) and reenable.
// RunSomeAllocs(10000, 20, 1, 1);
