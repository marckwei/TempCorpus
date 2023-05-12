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
// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load("wasm-module-builder.js");

function assertModule(module, memsize) {
  // Check the module exists.
  assertFalse(module === undefined);
  assertFalse(module === null);
  assertFalse(module === 0);
  assertEquals("object", typeof module);

  // Check the memory is an ArrayBuffer.
  var mem = module.exports.memory;
  assertFalse(mem === undefined);
  assertFalse(mem === null);
  assertFalse(mem === 0);
  assertEquals("object", typeof mem);
  assertTrue(mem instanceof WebAssembly.Memory);
  var buf = mem.buffer;
  assertTrue(buf instanceof ArrayBuffer);
  assertEquals(memsize, buf.byteLength);
  for (var i = 0; i < 4; i++) {
    module.exports.memory = 0;  // should be ignored
    mem.buffer = 0; // should be ignored
    assertSame(mem, module.exports.memory);
    assertSame(buf, mem.buffer);
  }
}

function assertFunction(module, func) {
  assertEquals("object", typeof module.exports);

  var exp = module.exports[func];
  assertFalse(exp === undefined);
  assertFalse(exp === null);
  assertFalse(exp === 0);
  assertEquals("function", typeof exp);
  return exp;
}

(function SubTest() {

  var builder = new WasmModuleBuilder();

  builder.addMemory(1, 1, true);
  builder.addFunction("sub", kSig_i_ii)
    .addBody([
      kExprLocalGet, 0,             // --
      kExprLocalGet, 1,             // --
      kExprI32Sub,                  // --
    ])
    .exportFunc()

  var module = builder.instantiate();
  assertModule(module, kPageSize);

  // Check the properties of the sub function.
  var sub = assertFunction(module, "sub");
  assertEquals(-55, sub(33, 88));
  assertEquals(-55555, sub(33333, 88888));
  assertEquals(-5555555, sub(3333333, 8888888));
})();


(function NopTest() {

  var builder = new WasmModuleBuilder();

  var kPages = 2;
  builder.addMemory(kPages, kPages, true);
  builder.addFunction("nop", kSig_v_v)
    .addBody([kExprNop])
    .exportFunc();

  var module = builder.instantiate();
  assertModule(module, kPageSize * kPages);

  var nop = assertFunction(module, "nop");
  assertEquals(undefined, nop());
})();


(function testLt() {
  var builder = new WasmModuleBuilder();

  var kPages = 3;
  builder.addMemory(kPages, kPages, true);
  builder.addFunction("flt", kSig_i_dd)
    .addBody([
      kExprLocalGet, 0,     // --
      kExprLocalGet, 1,     // --
      kExprF64Lt            // --
    ])                      // --
    .exportFunc();

  var module = builder.instantiate();
  assertModule(module, kPageSize * kPages);

  var flt = assertFunction(module, "flt");
  assertEquals(1, flt(-2, -1));
  assertEquals(0, flt(7.3, 7.1));
  assertEquals(1, flt(7.1, 7.3));
})();
