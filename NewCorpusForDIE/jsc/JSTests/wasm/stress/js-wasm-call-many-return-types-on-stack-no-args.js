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
import { instantiate } from "../wabt-wrapper.js";

async function buildWat(types) {
    let calleeBody = "";
    for (let i = 0; i < types.length; ++i) {
        let type = types[i];
        calleeBody += `(${type}.const ${i})`;
    }

    let wat = `
        (module
          (func (export "callee") (result ${types.join(" ")})
            ${calleeBody}
          )
        )
    `;
    let instance = await instantiate(wat);
    let results = instance.exports.callee();
    if (!Array.isArray(results))
        throw new Error();
    if (results.length !== types.length)
        throw new Error();
    for (let j = 0; j < 10000; ++j) {
        for (let i = 0; i < types.length; ++i) {
            if (results[i] !== i)
                throw new Error("got " + results[i] + " but wanted " + i + " in results: " + results);
        }
    }
}

async function test() {
    await Promise.all([
        buildWat(["f64", "f64"]),

        buildWat(["i32", "i32", "f32", "i32"]),
        buildWat(["i32", "i32", "f32", "i32", "f64", "f32", "i32", "i32"]),

        // gpr in registers but fpr spilled. arm64 has 32 fprs so go above that
        buildWat(["i32", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i32", "f32", "f32", "f64"]),
        // gpr first and in middle
        buildWat(["i32", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "f64"]),

        // gpr at end and in middle
        buildWat(["f64", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f64", "f32", "i32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i32"]),
        buildWat(["f32", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f64", "f32", "i32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i32"]),


        // fpr in registers but gpr spilled. arm64 has 32 fprs so go above that
        buildWat(["f64", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f64", "i32", "i32", "i32"]),
        // fpr first and in middle
        buildWat(["f64", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f64", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32"]),

        // gpr at end and in middle
        buildWat(["i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f64", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f64"]),


        // both are spilled
        buildWat(["i32", "f32", "i32", "f64", "i32", "f32", "i32", "i32", "f64", "i32", "i32", "f64", "f32", "f32", "f32", "f64", "f32", "i32", "i32", "f32", "i32", "f32", "f64", "f64", "i32", "f32", "f32", "f64", "i32", "i32", "i32", "f64", "f64", "f64", "f32", "f32", "i32", "i32", "i32", "i32", "f32", "f32", "f64", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f64", "f32", "f32", "f32", "f64", "i32", "i32", "i32", "f32", "f64", "f64", "i32", "i32", "f64", "f64", "f64", "i32", "i32", "i32", "i32"]),
    ]);
}

assert.asyncTest(test());