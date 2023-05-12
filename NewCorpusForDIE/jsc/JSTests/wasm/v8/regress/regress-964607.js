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

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load('wasm-module-builder.js');

let builder = new WasmModuleBuilder();

builder.addImportedTable('ffi', 't1', 5, 5, kWasmAnyFunc);
builder.addImportedTable('ffi', 't2', 9, 9, kWasmAnyFunc);

builder.addFunction('foo', kSig_v_v).addBody([]).exportFunc();

let module = builder.toModule();
let table1 =
    new WebAssembly.Table({element: 'anyfunc', initial: 5, maximum: 5});

let table2 =
    new WebAssembly.Table({element: 'anyfunc', initial: 9, maximum: 9});

let instance =
    new WebAssembly.Instance(module, {ffi: {t1: table1, t2: table2}});
let table3 =
    new WebAssembly.Table({element: 'anyfunc', initial: 9, maximum: 9});

table3.set(8, instance.exports.foo);
new WebAssembly.Instance(module, {ffi: {t1: table1, t2: table3}});
