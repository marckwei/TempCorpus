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
// Exception: TypeError: WebAssembly.Table.prototype.grow expects the second argument to be null or an instance of WebAssembly.Function
//  grow@[native code]
//  TableGrowWithInitializer@typed-funcref.js:35:13
//  global code@typed-funcref.js:46:3

// Copyright 2020 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-typed-funcref

load("wasm-module-builder.js");

// Export an arbitrary function from a Wasm module (identity).
let foo = (() => {
  let builder = new WasmModuleBuilder();
  builder.addFunction('foo', kSig_i_i)
      .addBody([kExprLocalGet, 0])
      .exportAs('foo');
  let module = new WebAssembly.Module(builder.toBuffer());
  return (new WebAssembly.Instance(builder.toModule())).exports.foo;
})();

(function TableGrowWithInitializer() {
  // print(arguments.callee.name);
  var table =
      new WebAssembly.Table({element: 'anyfunc', initial: 0, maximum: 100});

  table.grow(10);
  table.grow(10, foo);
  table.grow(10, null);
  table.grow(10, undefined);

  for (let i = 0; i < 10; i++) {
    assertNull(table.get(i));
  }
  for (let i = 10; i < 20; i++) {
    assertEquals(foo, table.get(i));
  }
  for (let i = 20; i < 40; i++) {
    assertNull(table.get(i));
  }
})();
