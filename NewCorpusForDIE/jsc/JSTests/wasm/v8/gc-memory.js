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
// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

let kPageSize = 65536;

function allocMems(count, initial, maximum) {
  // print(`alloc ${count}`);
  let result = [];
  for (let i = 0; i < count; i++) {
    // print(` memory #${i} (initial=${initial}, maximum=${maximum})...`);
    result.push(new WebAssembly.Memory({initial: initial, maximum: maximum}));
  }
  return result;
}

function check(mems, initial) {
  for (m of mems) {
    assertEquals(initial * kPageSize, m.buffer.byteLength);
  }
}

function test(count, initial, maximum) {
  let mems = allocMems(count, initial, maximum);
  check(mems, initial);
}

test(1, 1, 1);
test(1, 1, 2);
test(1, 1, 3);
test(1, 1, 4);

test(2, 1, 1);
test(2, 1, 2);
test(2, 1, 3);
test(2, 1, 4);

test(1, 1, undefined);
test(2, 1, undefined);
test(3, 1, undefined);
test(4, 1, undefined);
