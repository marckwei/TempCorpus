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

// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-eh --experimental-wasm-type-reflection

load("wasm-module-builder.js");

let testcases = [
{types: {parameters:[]}, sig: kSig_v_v},
{types: {parameters:["i32"]}, sig: kSig_v_i},
{types: {parameters:["i64"]}, sig: kSig_v_l},
{types: {parameters:["f64", "f64", "i32"]}, sig: kSig_v_ddi},
{types: {parameters:["f32"]}, sig: kSig_v_f},
];

(function TestExport() {
  let builder = new WasmModuleBuilder();

  testcases.forEach(function(expected, i) {
    let except = builder.addTag(expected.sig);
    builder.addExportOfKind("ex" + i, kExternalTag, except);
  });

  let instance = builder.instantiate();
  testcases.forEach(function(expected, i) {
    assertEquals(instance.exports["ex" + i].type(), expected.types);
  });
})();

(function TestImportExport() {

  let builder = new WasmModuleBuilder();
  let imports = {m: {}};

  testcases.forEach(function(expected, i) {
    let t = new WebAssembly.Tag(expected.types);
    let index = builder.addImportedTag("m", "ex" + i, expected.sig);
    builder.addExportOfKind("ex" + i, kExternalTag, index);
    imports.m["ex" + i] = t;
  });

  let instance = builder.instantiate(imports);
  testcases.forEach(function(expected, i) {
    assertEquals(instance.exports["ex" + i].type(), expected.types);
  })
})();
