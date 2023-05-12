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
// call to %DeoptimizeFunction()

// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm --expose-gc --allow-natives-syntax

load("wasm-module-builder.js");

function makeFFI(func) {
  var builder = new WasmModuleBuilder();

  var sig_index = builder.addType(kSig_i_dd);
  builder.addImport("mom", "func", sig_index);
  builder.addFunction("main", sig_index)
    .addBody([
      kExprLocalGet, 0,            // --
      kExprLocalGet, 1,            // --
      kExprCallFunction, 0,        // --
    ])
    .exportFunc()

  return builder.instantiate({mom: {func: func}}).exports.main;
}


function makeReentrantFFI(func) {
  var main = makeFFI(reenter);

  function reenter(a, b) {
    // print(" reenter " + a);
    if (a > 0) main(a - 1, b);
    else func();
  }
  return main;
}


function runTest(builder) {
  // ---- THROWING TEST -----------------------------------------------

  function throwadd(a, b) {
    // print("-- trying throw --");
    throw a + b;
  }

  function throwa(a) {
    // print("-- trying throw --");
    throw a;
  }

  function throwstr() {
    // print("-- trying throw --");
    throw "string";
  }

  assertThrows(builder(throwadd));
  assertThrows(builder(throwa));
  assertThrows(builder(throwstr));

  try {
    builder(throwadd)(7.8, 9.9);
  } catch(e) {
    // print(e);
  }

  try {
    builder(throwa)(11.8, 9.3);
  } catch(e) {
    // print(e);
  }


  try {
    builder(throwstr)(3, 5);
  } catch(e) {
    // print(e);
  }


  // ---- DEOPT TEST -----------------------------------------------

  function deopt() {
    // print("-- trying deopt --");
    %DeoptimizeFunction(deopter);
  }

  var deopter = builder(deopt);

  deopter(5, 5);
  for (var i = 0; i < 9; i++) {
    deopter(6, 6);
  }


  // ---- GC TEST -----------------------------------------------
  function dogc(a, b) {
    // print("-- trying gc --");
    gc();
    gc();
  }


  var gcer = builder(dogc);
  gcer(7, 7);

  for (var i = 0; i < 9; i++) {
    gcer(8, 8);
  }
}

runTest(makeReentrantFFI);
runTest(makeFFI);
