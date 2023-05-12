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

import { instantiate } from "../wabt-wrapper.js";
import * as assert from "../assert.js";

async function test() {
    const instance = await instantiate(`
        (module
         (func (export "truncS") (param f64) (result i32) (local $l0 f64)
           (i32.trunc_f64_s (local.get 0))
         )
         (func (export "truncU") (param f64) (result i32) (local $l0 f64)
           (i32.trunc_f64_u (local.get 0))
         )
        )
    `)
    const {truncS, truncU} = instance.exports;

    assert.eq(truncS(-2147483648.1), -2147483648);
    assert.eq(truncS(-2147483648.9), -2147483648);
    assert.eq(truncS(2147483647.9), 2147483647);
    assert.throws(() => truncS(-2147483649), WebAssembly.RuntimeError, `Out of bounds Trunc operation (evaluating 'func(...args)')`);
    assert.throws(() => truncS(2147483648), WebAssembly.RuntimeError, `Out of bounds Trunc operation (evaluating 'func(...args)')`);
    assert.throws(() => truncS(NaN), WebAssembly.RuntimeError, `Out of bounds Trunc operation (evaluating 'func(...args)')`);

    assert.eq(truncU(-0.9), 0);
    assert.eq(truncU(4294967295.9), -1);
    assert.throws(() => truncU(-1), WebAssembly.RuntimeError, `Out of bounds Trunc operation (evaluating 'func(...args)')`);
    assert.throws(() => truncU(4294967296), WebAssembly.RuntimeError, `Out of bounds Trunc operation (evaluating 'func(...args)')`);
    assert.throws(() => truncU(NaN), WebAssembly.RuntimeError, `Out of bounds Trunc operation (evaluating 'func(...args)')`);
}

assert.asyncTest(test());
