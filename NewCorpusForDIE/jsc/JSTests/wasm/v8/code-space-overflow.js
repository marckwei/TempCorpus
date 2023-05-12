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
// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --wasm-max-code-space-size-mb=1
// Disable lazy compilation, so we actually generate a lot of code at once.
// Flags: --no-wasm-lazy-compilation
// Limit the number of background threads, so each thread generates more code.
// Flags: --wasm-num-compilation-tasks=2

// This is a regression test for https://crbug.com/v8/13436. If a single
// background thread generates more code than fits in a single code space, we
// need to split it into multiple code spaces.

load("wasm-module-builder.js");

const start = Date.now();
function time(name) {
  const ms_since_start = (Date.now() - start).toFixed(1).padStart(7);
  // print(`[${ms_since_start}] ${name}`);
}

// At the time of writing this test (Nov 2022), this module generated ~20MB of
// code on x64 and ~18MB on arm64.
const builder = new WasmModuleBuilder();
const kNumFunctions = 1500;
// Build a large body. Then append one instruction to get different code per
// function (for the case that we decide to merge identical code objects in the
// future).
time('Build function template.');
let body_template = [kExprLocalGet, 0];
for (let i = 0; i < kNumFunctions; ++i) {
  body_template.push(kExprCallFunction, ...wasmSignedLeb(i));
}
time(`Adding ${kNumFunctions} functions`);
for (let i = 0; i < kNumFunctions; ++i) {
  if (i != 0 && i % 100 == 0) time(`... added ${i} functions`);
  let body = body_template.concat([...wasmI32Const(i), kExprI32Add, kExprEnd]);
  builder.addFunction('f' + i, kSig_i_i).addBodyWithEnd(body);
}
time('Building buffer.');
const wasm_buf = builder.toBuffer();
time('Compiling Wasm module.');
new WebAssembly.Module(wasm_buf);
