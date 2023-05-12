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

// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --liftoff --no-wasm-tier-up --wasm-tier-mask-for-testing=2

load('wasm-module-builder.js');

const builder = new WasmModuleBuilder();

// Generate a Liftoff call with too many reference parameters to fit in
// parameter registers, to force stack parameter slots.

const kManyParams = 32;
const kSigWithManyRefParams = makeSig(
  new Array(kManyParams).fill(kWasmExternRef), []);
const kPrepareManyParamsCallBody = Array.from(
  {length: kManyParams * 2},
  (item, index) => index % 2 == 0 ? kExprLocalGet : 0);


builder.addFunction(undefined, kSigWithManyRefParams).addBody([
]);

builder.addFunction(undefined, kSigWithManyRefParams)
.addBody([
  ...kPrepareManyParamsCallBody,
  kExprCallFunction, 0,  // call 0
]);

builder.addFunction(undefined, kSigWithManyRefParams).addBody([
  ...kPrepareManyParamsCallBody,
  kExprCallFunction,  1,  // call 1
]).exportAs('manyRefs');

const instance = builder.instantiate();
instance.exports.manyRefs();
