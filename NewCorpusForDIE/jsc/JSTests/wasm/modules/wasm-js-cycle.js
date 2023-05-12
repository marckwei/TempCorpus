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

import * as assert from '../assert.js'
import { return42 } from "./wasm-js-cycle/entry.wasm"

assert.eq(return42(), 42);

import { getFromJSGlobal, g } from "./wasm-js-cycle/entry-global.wasm"
import { globalFromJS, incrementGlobal } from "./wasm-js-cycle/global.js"

assert.instanceof(g, WebAssembly.Global);
assert.eq(g.valueOf(), 42);
incrementGlobal();
assert.eq(g.valueOf(), 43);

assert.isFunction(getFromJSGlobal);
assert.eq(getFromJSGlobal(), globalFromJS.valueOf());
globalFromJS.value = 84;
assert.eq(getFromJSGlobal(), globalFromJS.valueOf());

import { getFromJSTable, t } from "./wasm-js-cycle/entry-table.wasm"
import { tableFromJS, setTable } from "./wasm-js-cycle/table.js"

assert.instanceof(t, WebAssembly.Table);
assert.eq(t.get(0), null);
setTable(0, "foo");
assert.eq(t.get(0), "foo");

assert.isFunction(getFromJSTable);
assert.eq(getFromJSTable(), tableFromJS.get(0));
tableFromJS.set(0, "foo");
assert.eq(getFromJSTable(), tableFromJS.get(0));

import { m } from "./wasm-js-cycle/entry-memory.wasm"
import { setMemory } from "./wasm-js-cycle/memory.js"

assert.instanceof(m, WebAssembly.Memory);
const view = new Int32Array(m.buffer);
assert.eq(view[0], 0);
setMemory(0, 42);
assert.eq(view[0], 42);
