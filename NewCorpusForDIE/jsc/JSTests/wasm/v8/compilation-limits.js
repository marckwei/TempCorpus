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
// call to %AbortJS()
// call to %SetWasmCompileControls()
// call to %SetWasmInstantiateControls()

// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax

load("wasm-module-builder.js");

%SetWasmCompileControls(100000, true);
%SetWasmCompileControls(100000, false);

let buffer = (() => {
  let builder = new WasmModuleBuilder();
  builder.addFunction("f", kSig_i_v)
    .addBody([kExprI32Const, 42])
    .exportAs("f");
  return builder.toBuffer();
})();

let ok_module = new WebAssembly.Module(buffer);
assertTrue(ok_module instanceof WebAssembly.Module);
assertEquals(42, new WebAssembly.Instance(ok_module).exports.f());

failWithMessage = msg => %AbortJS(msg);

async function SuccessfulTest() {
  // print("SuccessfulTest...");
  %SetWasmCompileControls(buffer.byteLength, true);
  %SetWasmInstantiateControls();
  let m = new WebAssembly.Module(buffer);
  let i = new WebAssembly.Instance(m);
  assertEquals(i.exports.f(), 42);
}

async function FailSyncCompile() {
  // print("FailSyncCompile...");
  %SetWasmCompileControls(buffer.byteLength - 1, true);
  assertThrows(() => new WebAssembly.Module(buffer), RangeError);

  // print("  wait");
  try {
    let m = await WebAssembly.compile(buffer);
    // print("  cont");
    assertTrue(m instanceof WebAssembly.Module);
  } catch (e) {
    // print("  catch");
    assertUnreachable();
  }
}

async function FailSyncInstantiate() {
  // print("FailSyncInstantiate...");
  %SetWasmCompileControls(buffer.byteLength - 1, true);
  assertThrows(() => new WebAssembly.Instance(ok_module), RangeError);

  // print("  wait");
  try {
    let i = await WebAssembly.instantiate(ok_module);
    // print("  cont");
    assertTrue(i instanceof WebAssembly.Instance);
  } catch (e) {
    // print("  catch: " + e);
    assertUnreachable();
  }
}

async function TestAll() {
  await SuccessfulTest();
  await FailSyncCompile();
  await FailSyncInstantiate();
}

assertPromiseResult(TestAll());
