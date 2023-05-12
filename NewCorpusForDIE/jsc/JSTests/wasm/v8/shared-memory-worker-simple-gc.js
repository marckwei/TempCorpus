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
//  NewWorker@shared-memory-worker-simple-gc.js:24:20
//  RunSingleWorkerSingleMemoryTest@shared-memory-worker-simple-gc.js:41:25
//  global code@shared-memory-worker-simple-gc.js:90:32

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-gc

const kNumIterations = 10;

function NewWorker() {
  let script =
`onmessage = (msg) => {
   if (msg.memory) postMessage("ack");
   if (msg.quit) postMessage("bye");
   gc();
}`;
  return new Worker(script, {type: 'string'});
}

function PingWorker(worker, memory) {
  worker.postMessage({memory: memory});
  assertEquals("ack", worker.getMessage());
  worker.postMessage({quit: true});
  assertEquals("bye", worker.getMessage());
}

function AllocMemory() {
  let pages = 1, max = 1;
  return new WebAssembly.Memory({initial : pages, maximum : max, shared : true});
}

function RunSingleWorkerSingleMemoryTest() {
  // print(arguments.callee.name);
  let worker = NewWorker();
  let first = AllocMemory();
  for (let i = 0; i < kNumIterations; i++) {
    // print(`iteration ${i}`);
    PingWorker(worker, first);
    gc();
  }
  worker.terminate();
}

function RunSingleWorkerTwoMemoryTest() {
  // print(arguments.callee.name);
  let worker = NewWorker();
  let first = AllocMemory(), second = AllocMemory();
  for (let i = 0; i < kNumIterations; i++) {
    // print(`iteration ${i}`);
    PingWorker(worker, first);
    PingWorker(worker, second);
    gc();
  }
  worker.terminate();
}

function RunSingleWorkerMultipleMemoryTest() {
  // print(arguments.callee.name);
  let worker = NewWorker();
  let first = AllocMemory();
  for (let i = 0; i < kNumIterations; i++) {
    // print(`iteration ${i}`);
    PingWorker(worker, first);
    PingWorker(worker, AllocMemory());
    gc();
  }
  worker.terminate();
}

function RunMultipleWorkerMultipleMemoryTest() {
  // print(arguments.callee.name);
  let first = AllocMemory();
  for (let i = 0; i < kNumIterations; i++) {
    // print(`iteration ${i}`);
    let worker = NewWorker();
    PingWorker(worker, first);
    PingWorker(worker, AllocMemory());
    worker.terminate();
    gc();
  }
}

RunSingleWorkerSingleMemoryTest();
RunSingleWorkerTwoMemoryTest();
RunSingleWorkerMultipleMemoryTest();
RunMultipleWorkerMultipleMemoryTest();
