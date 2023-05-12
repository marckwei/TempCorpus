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

import { addOne, getAnswer, table, memory } from "./wasm-imports-js-re-exports-wasm-exports/imports.wasm"
import * as assert from '../assert.js';

assert.isFunction(addOne);
assert.eq(addOne(32), 33);
assert.eq(addOne(-2), -1);
assert.eq(addOne(0x7fffffff), -2147483648);

assert.eq(getAnswer(), 42);

assert.eq(table.length, 4);
assert.eq(table.get(0)(1, 2), 3);
assert.eq(table.get(1)(-1), 0);
assert.eq(table.get(2), null);
assert.eq(table.get(3), null);

assert.eq(memory.buffer.byteLength, 65536);
const buf = new Uint8Array(memory.buffer);
assert.eq(buf[4], 0x10);
assert.eq(buf[5], 0x00);
assert.eq(buf[6], 0x10);
assert.eq(buf[7], 0x00);
buf[0] = 0x42;
assert.eq(buf[0], 0x42);
assert.eq(buf[65536], undefined);
