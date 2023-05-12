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
//  global code@worker-running-empty-loop-interruptible.js:32:26

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

const builder = new WasmModuleBuilder();
// void main() { for (;;) {} }
builder.addFunction('main', kSig_v_v).addBody([
  kExprLoop, kWasmVoid, kExprBr, 0, kExprEnd
]).exportFunc();
const module = builder.toModule();

function workerCode() {
  onmessage = function(module) {
    // print('[worker] Creating instance.');
    let instance = new WebAssembly.Instance(module);
    // print('[worker] Reporting start.');
    postMessage('start');
    // print('[worker] Running main.');
    instance.exports.main();
  };
}

// print('[main] Starting worker.');
const worker = new Worker(workerCode, {type: 'function'});
// print('[main] Sending module.');
worker.postMessage(module);
assertEquals('start', worker.getMessage());
// print('[main] Terminating worker and waiting for it to finish.');
worker.terminateAndWait();
// print('[main] All done.');
