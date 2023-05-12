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
import * as assert from '../assert.js';

(async function () {
    let wat = `
        (module
            (func $callee (import "env" "callee") (result i32 i32))
            (func (export "func") (result i32 i32) (call $callee))
        )
        `;
    let flag = true;
    let instance = await instantiate(wat, {
            env: {
                callee: function ()
                {
                    if (flag)
                        return [32];
                    return [32, 32, 32, 32];
                }
            }
        }, {});
    assert.throws(() => {
        instance.exports.func();
    }, TypeError, `Incorrect number of values returned to Wasm from JS`);
    flag = false;
    assert.throws(() => {
        instance.exports.func();
    }, TypeError, `Incorrect number of values returned to Wasm from JS`);
}()).catch($vm.abort);
