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

//@ skip if $architecture != "arm64" && $architecture != "x86_64"
import { addOne } from "./wasm-imports-js-exports/imports.wasm"
import * as assert from '../assert.js';

assert.isFunction(addOne);
assert.eq(addOne(32), 33);
assert.eq(addOne(-2), -1);
assert.eq(addOne(0x7fffffff), -2147483648);

import { incrementCount } from "./wasm-imports-js-exports/global.wasm";
import { count } from "./wasm-imports-js-exports/global.js";

assert.isFunction(incrementCount);
assert.eq(count.valueOf(), 42);
incrementCount();
assert.eq(count.valueOf(), 43);

import { getElem } from "./wasm-imports-js-exports/table.wasm";

assert.isFunction(getElem);
assert.eq(getElem(), "foo");

import { getMem } from "./wasm-imports-js-exports/memory.wasm";

assert.isFunction(getMem);
assert.eq(getMem(0), 42);
assert.eq(getMem(65535), 0);
assert.throws(() => getMem(65536), WebAssembly.RuntimeError, "Out of bounds memory access");

import { getMem as sharedGetMem } from "./wasm-imports-js-exports/shared-memory.wasm";

assert.isFunction(sharedGetMem);
assert.eq(sharedGetMem(0), 42);
assert.eq(sharedGetMem(65535), 0);
assert.throws(() => sharedGetMem(65536), WebAssembly.RuntimeError, "Out of bounds memory access");

import("./wasm-imports-js-exports/memory-fail-1.wasm").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: Memory import ./memory-fail-1.js:memory is not an instance of WebAssembly.Memory`);
}).then(function () { }, $vm.abort);

import("./wasm-imports-js-exports/memory-fail-2.wasm").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: Memory import ./memory-fail-2.js:memory provided a 'size' that is smaller than the module's declared 'initial' import memory size`);
}).then(function () { }, $vm.abort);

import("./wasm-imports-js-exports/memory-fail-3.wasm").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: Memory import ./memory-fail-3.js:memory did not have a 'maximum' but the module requires that it does`);
}).then(function () { }, $vm.abort);

import("./wasm-imports-js-exports/memory-fail-4.wasm").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: Memory import ./memory-fail-4.js:memory provided a 'maximum' that is larger than the module's declared 'maximum' import memory size`);
}).then(function () { }, $vm.abort);

import("./wasm-imports-js-exports/memory-fail-5.wasm").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: Memory import ./memory-fail-5.js:memory provided a 'shared' that is different from the module's declared 'shared' import memory attribute`);
}).then(function () { }, $vm.abort);
