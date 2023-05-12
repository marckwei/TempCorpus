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

import * as assert from '../assert.js';
import { return42 } from "./js-wasm-cycle/entry.js";

assert.eq(return42(), 42);

// Test the state of bindings with JS<->Wasm module cycles.
// https://github.com/WebAssembly/esm-integration/blob/main/proposals/esm-integration/EXAMPLES.md#js---wasm-cycle-where-js-is-higher-in-the-module-graph

// Testing JS exports.
import("./js-wasm-cycle/entry-i32-global.js").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: imported global ./entry-i32-global.js:glob must be a number`);
}).then(function () { }, $vm.abort);

import("./js-wasm-cycle/entry-i32-value.js").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: imported global ./entry-i32-value.js:glob must be a number`);
}).then(function () { }, $vm.abort);

import("./js-wasm-cycle/entry-table.js").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: Table import ./entry-table.js:t is not an instance of WebAssembly.Table`);
}).then(function () { }, $vm.abort);

import("./js-wasm-cycle/entry-memory.js").then($vm.abort, function (error) {
    assert.eq(String(error), `LinkError: Memory import ./entry-memory.js:m is not an instance of WebAssembly.Memory`);
}).then(function () { }, $vm.abort);

// Test Wasm exports.
import { g } from "./js-wasm-cycle/entry-wasm-global.js";
assert.instanceof(g, WebAssembly.Global);
assert.eq(g.valueOf(), 42);

import { m } from "./js-wasm-cycle/entry-wasm-memory.js";
assert.instanceof(m, WebAssembly.Memory);

import { t } from "./js-wasm-cycle/entry-wasm-table.js";
assert.instanceof(t, WebAssembly.Table);

// This case tests both Wasm and JS export.
import { f2 } from "./js-wasm-cycle/entry-function.js";
assert.isFunction(f2);
assert.eq(f2(), 43);
