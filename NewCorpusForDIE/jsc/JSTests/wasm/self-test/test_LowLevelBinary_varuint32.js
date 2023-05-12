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

import LowLevelBinary, * as LLB from '../LowLevelBinary.js';
import * as assert from '../assert.js';

let values = [];
for (let i = LLB.varuint32Min; i !== LLB.varuint32Min + 1024; ++i) values.push(i);
for (let i = LLB.varuint32Max; i !== LLB.varuint32Max - 1024; --i) values.push(i);

for (const i of values) {
    let b = new LowLevelBinary();
    b.varuint32(i);
    const v = b.getVaruint32(0);
    if (v.value !== i)
        throw new Error(`Wrote "${i}" and read back "${v}"`);
    if (v.next !== b.getSize())
        throw new Error(`Size ${v.next}, expected ${b.getSize()}`);
}

for (let i = 0; i < LLB.varBitsMax + 1; ++i) {
    let b = new LowLevelBinary();
    for (let j = 0; j < i; ++j)
        b.uint8(0x80);
    assert.throws(() => b.getVarint32(0), RangeError, `[${i}, ${i+1}) is out of buffer range [0, ${i})`);
}

let b = new LowLevelBinary();
for (let i = 0; i < LLB.varBitsMax; ++i)
    b.uint8(0x80);
b.uint8(0x00);
assert.throws(() => b.getVarint32(0), RangeError, `Shifting too much at 6`);
