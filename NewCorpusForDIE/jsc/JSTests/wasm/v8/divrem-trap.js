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

// Flags: --expose-wasm --expose-gc --allow-natives-syntax

load("wasm-module-builder.js");

var assertTraps = function(messageId, code) {
  assertThrows(code, WebAssembly.RuntimeError, kTrapMsgs[messageId]);
}


function makeBinop(opcode) {
  var builder = new WasmModuleBuilder();

  builder.addFunction("main", kSig_i_ii)
    .addBody([
      kExprLocalGet, 0,           // --
      kExprLocalGet, 1,           // --
      opcode,                     // --
    ])
    .exportFunc();

  return builder.instantiate().exports.main;
}

var divs = makeBinop(kExprI32DivS);
var divu = makeBinop(kExprI32DivU);

assertEquals( 33, divs( 333, 10));
assertEquals(-33, divs(-336, 10));

assertEquals(       44, divu( 445, 10));
assertEquals(429496685, divu(-446, 10));

assertTraps(kTrapDivByZero, "divs(100, 0);");
assertTraps(kTrapDivByZero, "divs(-1009, 0);");

assertTraps(kTrapDivByZero, "divu(200, 0);");
assertTraps(kTrapDivByZero, "divu(-2009, 0);");

assertTraps(kTrapDivUnrepresentable, "divs(0x80000000, -1)");
assertEquals(0, divu(0x80000000, -1));


var rems = makeBinop(kExprI32RemS);
var remu = makeBinop(kExprI32RemU);

assertEquals( 3, rems( 333, 10));
assertEquals(-6, rems(-336, 10));

assertEquals( 5, remu( 445, 10));
assertEquals( 3, remu(-443, 10));

assertTraps(kTrapRemByZero, "rems(100, 0);");
assertTraps(kTrapRemByZero, "rems(-1009, 0);");

assertTraps(kTrapRemByZero, "remu(200, 0);");
assertTraps(kTrapRemByZero, "remu(-2009, 0);");

assertEquals(-2147483648, remu(0x80000000, -1));
assertEquals(0, rems(0x80000000, -1));
