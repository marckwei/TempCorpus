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

function testAddGetter(object, name, val) {
  Object.defineProperty(object, name, { get: function() { return val; } });
  assertSame(val, object[name]);
}

function testAddGetterFails(object, name, val) {
  function assign() {
    Object.defineProperty(object, name, { get: function() { return val; } });
  }
  assertThrows(assign, TypeError);
}

function testAddGetterBothWays(object, name, val) {
  // print("Object.defineProperty");
  Object.defineProperty(object, name, { get: function() { return val; } });
  // print("object.__defineGetter__");
  object.__defineGetter__(name, () => val);
  assertSame(val, object[name]);
}

function testFailToAddGetter(object, name, val) {
  assertThrows(() => Object.defineProperty(object, name, { get: function() { return val; } }));
}

testAddGetter(testAddGetter, "name", 11);

function makeBuilder() {
  var builder = new WasmModuleBuilder();

  builder.addFunction("f", kSig_v_v)
    .addBody([])
    .exportFunc();
  return builder;
}

(function TestAddGetterToFunction() {
  // print("TestAddGetterToFunction...");
  var builder = makeBuilder();
  var f = builder.instantiate().exports.f;
  testAddGetterBothWays(f, "name", "foo");
  testAddGetter(f, "blam", "baz");
})();

(function TestAddGetterToModule() {
  // print("TestAddGetterToModule...");
  var builder = makeBuilder();
  var module = new WebAssembly.Module(builder.toBuffer());
  testAddGetter(module, "exports", 290);
  testAddGetter(module, "xyz", new Object());
})();

(function TestAddGetterToInstance() {
  // print("TestAddGetterToInstance...");
  var builder = makeBuilder();
  var instance = builder.instantiate();
  testAddGetter(instance, "exports", 290);
  testAddGetter(instance, "xyz", new Object());
})();

(function TestAddGetterToExports() {
  // print("TestAddGetterToExports...");
  var builder = makeBuilder();
  var exports = builder.instantiate().exports;
  testFailToAddGetter(exports, "f", 9834);
  testAddGetterFails(exports, "nag", new Number(2));
})();
