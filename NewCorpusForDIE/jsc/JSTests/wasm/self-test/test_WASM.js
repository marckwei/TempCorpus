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
import * as WASM from '../WASM.js';

assert.isNotUndef(WASM.description);
assert.isNotUndef(WASM.type);
assert.ge(WASM.type.length, 7);

for (const v of WASM.type)
    if (!WASM.isValidType(v))
        throw new Error(`Expected value ${v} to be a valid type`);

const expectedFields = [
    "preamble",
    "type",
    "external_kind",
    "section",
    "opcode",
];
for (const e of expectedFields) {
    assert.isNotUndef(WASM.description[e]);
    if (typeof(WASM.description[e]) !== "object")
        throw new Error(`Expected description to contain field "${e}"`);
}

const expectedOpFields = [
    "category",
    "value",
    "return",
    "parameter",
    "immediate",
];
for (const op in WASM.description.opcode)
    for (const e of expectedOpFields)
        assert.isNotUndef(WASM.description.opcode[op][e]);

// FIXME: test for field "b3op" when all arithmetic/ comparison ops have them. https://bugs.webkit.org/show_bug.cgi?id=146064

assert.isNotUndef(WASM.sections);
assert.isNotUndef(WASM.sectionEncodingType);
for (const section of WASM.sections)
    assert.eq(WASM.sectionEncodingType, WASM.description.section[section].type);
