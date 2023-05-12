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
//@ skip
// Failure:
// Exception: ReferenceError: Can't find variable: Worker
//  RunTest@shared-memory-worker-gc.js:29:26
//  global code@shared-memory-worker-gc.js:46:3

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-gc

const kNumMessages = 1000;

function AllocMemory(pages = 1, max = pages) {
  return new WebAssembly.Memory({initial : pages, maximum : max, shared : true});
}

(function RunTest() {
  function workerCode() {
    onmessage =
      function(msg) {
        if (msg.memory) postMessage({memory : msg.memory});
        gc();
      }
  }

  let worker = new Worker(workerCode, {type: 'function'});

  let time = performance.now();

  for (let i = 0; i < kNumMessages; i++) {
    let now = performance.now();
    // print(`iteration ${i}, Δ = ${(now - time).toFixed(3)} ms`);
    time = now;

    let memory = AllocMemory();
    worker.postMessage({memory : memory});
    let msg = worker.getMessage();
    if (msg.memory) {
      assertInstanceof(msg.memory, WebAssembly.Memory);
    }
    gc();
  }
})();
