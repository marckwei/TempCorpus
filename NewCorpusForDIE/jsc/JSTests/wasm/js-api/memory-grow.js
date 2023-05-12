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

import { eq as assertEq, throws as assertThrows } from "../assert.js";
const pageSize = 64*1024;

let buffers = [];
for (let i = 0; i < 100; i++) {
    const max = 5;
    let pageCount = 1;
    let x = new WebAssembly.Memory({initial: 1, maximum: max});
    for (let i = 0; i < (max - 1); i++) {
        let int8Array = new Uint8Array(x.buffer);

        for (let i = 0; i < pageSize; i++) {
            assertEq(int8Array[pageSize*(pageCount - 1) + i], 0);
            int8Array[pageSize*(pageCount - 1) + i] = pageCount;
        }

        for (let i = 0; i < pageCount; i++) {
            for (let j = 0; j < pageSize; j++) {
                assertEq(int8Array[i * pageSize + j], i + 1);
            }
        }

        let buffer = x.buffer;
        assertEq(buffer.byteLength, pageCount * pageSize);
        buffers.push(buffer);
        let previousPageSize = x.grow(1);
        assertEq(buffer.byteLength, 0);
        assertEq(previousPageSize, pageCount);
        ++pageCount;
    }
}

for (let buffer of buffers) {
    assertEq(buffer.byteLength, 0);
}

{
    const memory = new WebAssembly.Memory({initial: 1, maximum: 5});
    let buffer = memory.buffer;
    assertEq(buffer.byteLength, 1*64*1024);
    memory.grow(1);
    assertEq(buffer.byteLength, 0);

    buffer = memory.buffer;
    assertEq(buffer.byteLength, 2*64*1024);

    // This shouldn't neuter the buffer since it fails.
    assertThrows(() => memory.grow(1000), RangeError, "WebAssembly.Memory.grow would exceed the memory's declared maximum size");
    assertEq(buffer.byteLength, 2*64*1024);
    assertEq(memory.buffer, buffer);
}
