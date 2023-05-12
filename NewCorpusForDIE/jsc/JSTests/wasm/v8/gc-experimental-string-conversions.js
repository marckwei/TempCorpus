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
// Skipping this test due to the following issues:
// call to %OptimizeFunctionOnNextCall()
// call to %PrepareFunctionForOptimization()

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-gc --allow-natives-syntax

load("wasm-module-builder.js");

var builder = new WasmModuleBuilder();

let i16Array = builder.addArray(kWasmI16, true);

builder.addFunction('getHelloArray', makeSig([], [kWasmArrayRef]))
    .addBody([
      ...wasmI32Const(72), ...wasmI32Const(69), ...wasmI32Const(76),
      ...wasmI32Const(76), ...wasmI32Const(79),
      kGCPrefix, kExprArrayNewFixed, i16Array, 5
    ])
    .exportFunc();

builder.addFunction('getChar', makeSig([kWasmArrayRef, kWasmI32], [kWasmI32]))
    .addBody([
      kExprLocalGet, 0, kGCPrefix, kExprRefAsArray, kGCPrefix,
      kExprRefCast, i16Array, kExprLocalGet, 1, kGCPrefix, kExprArrayGetS,
      i16Array
    ])
    .exportFunc();

const instance = builder.instantiate();
const getHelloArray = instance.exports.getHelloArray;
const getChar = instance.exports.getChar;

assertEquals(
    WebAssembly.experimentalConvertArrayToString(getHelloArray(), 0, 5),
    'HELLO');
assertEquals(
    WebAssembly.experimentalConvertArrayToString(getHelloArray(), 1, 4),
    'ELLO');
assertEquals(
    WebAssembly.experimentalConvertArrayToString(getHelloArray(), 0, 3), 'HEL');

const string = 'foobar'
const array =
    WebAssembly.experimentalConvertStringToArray('foobar', getHelloArray());
for (let i = 0; i < string.length; ++i) {
  assertEquals(getChar(array, i), string.charCodeAt(i));
}

// Test calling built-ins with different amount of (invalid) arguments.
function arrayToString() {
  WebAssembly.experimentalConvertArrayToString(...arguments);
}
function stringToArray() {
  WebAssembly.experimentalConvertStringToArray(...arguments);
}

let args = [];
for (let i = 1; i <= 5; ++i) {
  assertThrows(() => arrayToString(...args));
  assertThrows(() => stringToArray(...args));
  %PrepareFunctionForOptimization(arrayToString);
  %PrepareFunctionForOptimization(stringToArray);
  %OptimizeFunctionOnNextCall(arrayToString);
  %OptimizeFunctionOnNextCall(stringToArray);
  assertThrows(() => arrayToString(...args));
  assertThrows(() => stringToArray(...args));
  args.push(i);
}
