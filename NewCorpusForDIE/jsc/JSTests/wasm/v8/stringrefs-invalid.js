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
// Exception: Failure (Error message):
//  expected:
//  should match '/unexpected section <StringRef> \(enable with --experimental-wasm-stringref\)/'
//  found:
//  "WebAssembly.Module doesn't parse at byte 8: invalid section (evaluating 'new WebAssembly.Module(this.toBuffer(debug))')"
//
//  Stack: MjsUnitAssertionError@mjsunit.js:36:27
//  failWithMessage@mjsunit.js:323:36
//  fail@mjsunit.js:343:27
//  assertMatches@mjsunit.js:599:11
//  checkException@mjsunit.js:501:20
//  assertThrows@mjsunit.js:518:21
//  assertInvalid@stringrefs-invalid.js:30:15
//  global code@stringrefs-invalid.js:34:14

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-gc

load("wasm-module-builder.js");

function assertInvalid(fn, message) {
  let builder = new WasmModuleBuilder();
  fn(builder);
  assertThrows(() => builder.toModule(), WebAssembly.CompileError, message);
}

assertInvalid(
  builder => builder.addLiteralStringRef("foo"),
  /unexpected section <StringRef> \(enable with --experimental-wasm-stringref\)/);

let enableMessage = 'enable with --experimental-wasm-stringref'

for (let [name, code] of [['string', kStringRefCode],
                          ['stringview_wtf8', kStringViewWtf8Code],
                          ['stringview_wtf16', kStringViewWtf16Code],
                          ['stringview_iter', kStringViewIterCode]]) {
  let message = new RegExp(`invalid value type '${name}ref', ${enableMessage}`);
  let default_init = [kExprRefNull, code];

  assertInvalid(b => b.addType(makeSig([code], [])), message);
  assertInvalid(b => b.addStruct([makeField(code, true)]), message);
  assertInvalid(b => b.addArray(code, true), message);
  assertInvalid(b => b.addType(makeSig([], [code])), message);
  assertInvalid(b => b.addGlobal(code, true, default_init), message);
  assertInvalid(b => b.addTable(code, 0), message);
  assertInvalid(b => b.addPassiveElementSegment([default_init], code), message);
  assertInvalid(b => b.addTag(makeSig([code], [])), message);
  assertInvalid(
    b => b.addFunction(undefined, kSig_v_v).addLocals(code, 1).addBody([]),
    message);
}
