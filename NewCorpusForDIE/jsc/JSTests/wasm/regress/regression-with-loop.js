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
import { instantiate } from '../wabt-wrapper.js';

async function test() {
    const instance = await instantiate(`
        (module
          (func $test (param f64) (result f64)
            f64.const 1.0
            f64.const 2.0
        
            local.get 0
            i64.reinterpret_f64
            i32.wrap_i64
        
            i32.const 4096
            i32.lt_u
            select
        )
        (export "test" (func $test)))
    `);

    for (let i = 0; i < 1e4; ++i) {
        assert.eq(instance.exports.test(0.1111111111111111111111111111111111), 2.0);
        assert.eq(instance.exports.test(0), 1.0);
        assert.eq(instance.exports.test(1), 1.0);
        assert.eq(instance.exports.test(2), 1.0);
        assert.eq(instance.exports.test(3), 1.0);
        assert.eq(instance.exports.test(0.5), 1.0);
        assert.eq(instance.exports.test(-0.5), 1.0);
        assert.eq(instance.exports.test(200000), 1.0);
        assert.eq(instance.exports.test(-200000), 1.0);
    }
}

assert.asyncTest(test());
