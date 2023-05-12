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
import Builder from '../Builder.js';

const verbose = false;

const initial = 0;
const max = 0;

const builder = (new Builder())
    .Type().End()
    .Function().End()
    .Memory().InitialMaxPages(initial, max).End()
    .Export().Function("current").Function("grow").End()
    .Code()
        .Function("current", { params: [], ret: "i32" }).CurrentMemory(0).Return().End()
        .Function("grow", { params: ["i32"], ret: "i32" }).GetLocal(0).GrowMemory(0).Return().End()
    .End();

let instance = new WebAssembly.Instance(new WebAssembly.Module(builder.WebAssembly().get()));

const current = instance.exports.current();
const by = 2;
const result = instance.exports.grow(current + by);
if (verbose)
    print(`Grow from ${current} (max ${max}) to ${current + by} returned ${result}, current now ${instance.exports.current()}`);

assert.eq(result, -1);
assert.eq(current, instance.exports.current());
assert.le(instance.exports.current(), max);
