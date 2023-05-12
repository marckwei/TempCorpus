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
// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load("wasm-module-builder.js");

var debug = false;

function SimpleDataSegmentTest(offset) {
  // print("SimpleDataSegmentTest(" + offset + ")...");
  var builder = new WasmModuleBuilder();
  builder.addMemory(1, 1, false);
  builder.addFunction("load", kSig_i_i)
    .addBody([kExprLocalGet, 0, kExprI32LoadMem, 0, 0])
    .exportAs("load");
  builder.addDataSegment(offset, [9, 9, 9, 9]);

  var buffer = builder.toBuffer(debug);
  var instance = new WebAssembly.Instance(new WebAssembly.Module(buffer));
  for (var i = offset - 20; i < offset + 20; i += 4) {
    if (i < 0) continue;
    var expected = (i == offset) ? 151587081 : 0;
    assertEquals(expected, instance.exports.load(i));
  }
}

SimpleDataSegmentTest(0);
SimpleDataSegmentTest(4);
SimpleDataSegmentTest(12);
SimpleDataSegmentTest(1064);

function GlobalImportedInitTest(pad) {
  // print("GlobaleImportedInitTest(" + pad + ")...");
  var builder = new WasmModuleBuilder();
  builder.addMemory(1, 1, false);

  var g = builder.addImportedGlobal("mod", "offset", kWasmI32);

  while (pad-- > 0) builder.addGlobal(kWasmI32, false);  // pad

  builder.addFunction("load", kSig_i_i)
    .addBody([kExprLocalGet, 0, kExprI32LoadMem, 0, 0])
    .exportAs("load");
  builder.addDataSegment(g.index, [5, 5, 5, 5], true);

  var buffer = builder.toBuffer(debug);
  var module = new WebAssembly.Module(buffer);

  for (var offset of [0, 12, 192, 1024]) {
    var instance = new WebAssembly.Instance(module, {mod: {offset: offset}});
    for (var i = offset - 20; i < offset + 20; i += 4) {
      if (i < 0) continue;
      var expected = i == offset ? 84215045 : 0;
      assertEquals(expected, instance.exports.load(i));
    }
  }
}

GlobalImportedInitTest(0);
GlobalImportedInitTest(1);
GlobalImportedInitTest(4);
