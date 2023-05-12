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
// Skipping this test due to the following issues:
// call to db.profiler.*()

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

function workerCode() {
  function WorkerOnProfileEnd(profile) {
    postMessage(profile.indexOf('foo'));
  }

  onmessage = (wasm_module) => {
    WebAssembly.instantiate(wasm_module, {q: {func: d8.profiler.triggerSample}})
        .then(instance => {
          instance.exports.foo();
          console.profileEnd();
        });
  };

  d8.profiler.setOnProfileEndListener(WorkerOnProfileEnd);
  // Code logging happens for all code objects when profiling gets started,
  // and when new code objects appear after profiling has started. We want to
  // test the second scenario here. As new code objects appear as the
  // parameter of {OnMessage}, we have to start profiling already here before
  // {onMessage} is called.
  console.profile();
  postMessage('Starting worker');
}

const worker = new Worker(workerCode, {type: 'function'});

assertEquals("Starting worker", worker.getMessage());

const builder = new WasmModuleBuilder();
const sig_index = builder.addType(kSig_v_v);
const imp_index = builder.addImport("q", "func", sig_index);
builder.addFunction('foo', kSig_v_v)
    .addBody([
      kExprCallFunction, imp_index,
    ])
    .exportFunc();
const wasm_module = builder.toModule();
worker.postMessage(wasm_module);
assertTrue(worker.getMessage() > 0);
