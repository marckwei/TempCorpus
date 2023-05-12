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

// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load('wasm-module-builder.js');

// Flags: --wasm-lazy-compilation

let builder0 = new WasmModuleBuilder();
builder0.setName('module_0');
let sig_index = builder0.addType(kSig_i_v);
builder0.addFunction('main', kSig_i_i)
    .addBody([
      kExprLocalGet, 0,  // --
      kExprCallIndirect, sig_index, kTableZero
    ])  // --
    .exportAs('main');
builder0.setTableBounds(3, 3);
builder0.addExportOfKind('table', kExternalTable);
let module0 = new WebAssembly.Module(builder0.toBuffer());
let instance0 = new WebAssembly.Instance(module0);

let builder1 = new WasmModuleBuilder();
builder1.setName('module_1');
builder1.addFunction('main', kSig_i_v).addBody([kExprUnreachable]);
builder1.addImportedTable('z', 'table');
builder1.addActiveElementSegment(0, wasmI32Const(0), [0]);
let module1 = new WebAssembly.Module(builder1.toBuffer());
let instance1 =
    new WebAssembly.Instance(module1, {z: {table: instance0.exports.table}});
assertThrows(
    () => instance0.exports.main(0), WebAssembly.RuntimeError, /Unreachable/);
