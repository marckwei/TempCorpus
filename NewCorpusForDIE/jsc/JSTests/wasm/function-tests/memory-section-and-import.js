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

import Builder from '../Builder.js';
import * as assert from '../assert.js';

const instantiate = (builder, importObject = undefined) => {
    return new WebAssembly.Instance(
        new WebAssembly.Module(
            builder.WebAssembly().get()),
        importObject);
};

const initial = 0;
const maximum = 2;

const builder0 = (new Builder())
      .Type().End()
      .Function().End()
      .Memory().InitialMaxPages(initial, maximum).End()
      .Export()
          .Memory("memory", 0)
      .End()
      .Code().End();

const builder1 = (new Builder())
      .Type().End()
      .Import().Memory("imp", "memory", { initial: initial, maximum: maximum }).End()
      .Function().End()
      .Memory().InitialMaxPages(initial, maximum).End()
      .Code().End();

const i0 = instantiate(builder0);
assert.throws(() => instantiate(builder1, { imp: { memory: i0.exports.memory } }), WebAssembly.CompileError, `WebAssembly.Module doesn't parse at byte 35: there can at most be one Memory section for now`);
