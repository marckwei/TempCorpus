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
// call to %WasmNumCodeSpaces()

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax --randomize-all-allocations
// Flags: --wasm-max-initial-code-space-reservation=1
// Disable lazy compilation, because force easier code generation.
// Flags: --no-wasm-lazy-compilation

// Disable tier-up, to reduce execution time of this test (Liftoff generates
// much bigger code, thus reaches the four code spaces much faster).
// Flags: --no-wasm-tier-up

load("wasm-module-builder.js");

// Instantiate bigger modules, until at least four separate code spaces have
// been allocated.
// Each function calls through many of the previous functions to execute the
// jump table(s) sufficiently.

let num_functions = 50;
while (true) {
  // print(`Trying ${num_functions} functions...`);
  if (num_functions > 1e6) {
    throw new Error('We should have hit four code spaces by now');
  }
  const builder = new WasmModuleBuilder();
  builder.addMemory(1, 1, false);
  builder.addFunction('f0', kSig_i_i).addBody([kExprLocalGet, 0]);
  // Generate some code per function to fill the code space.
  // Each function contains a number of loads that will not be executed
  // (inside an "if (i == 0)" block). They increase the code size a bit so we
  // do not need too many functions.
  // Each function f<n> with argument {i} then calls f<n/10> with argument
  // {i + 1} and returns whatever that function returns.
  const body_template = [
    kExprLocalGet, 0, kExprI32Eqz, kExprIf, kWasmVoid,  // if (i == 0)
    kExprLocalGet, 0                                    // get i
  ];
  for (let i = 0; i < 1000; ++i) body_template.push(kExprI32LoadMem, 0, 0);
  body_template.push(
      kExprDrop, kExprEnd,                              // end if
      kExprLocalGet, 0, kExprI32Const, 1, kExprI32Add,  // i + 1
      kExprCallFunction                                 // call f<?>
  );
  for (let i = 1; i < num_functions; ++i) {
    const body = body_template.slice();
    body.push(...wasmSignedLeb(Math.floor(i / 10)));
    builder.addFunction('f' + i, kSig_i_i).addBody(body);
  }
  builder.addExport('f', num_functions - 1);
  const instance = builder.instantiate();
  let expected = 17;
  for (let i = num_functions - 1; i > 0; i = Math.floor(i / 10)) ++expected;
  assertEquals(expected, instance.exports.f(17));
  const num_code_spaces = %WasmNumCodeSpaces(instance);
  // print(`--> ${num_code_spaces} code spaces.`);
  if (num_code_spaces >= 4) break;
  num_functions *= 2;
}
