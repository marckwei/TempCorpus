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

import * as assert from '../assert.js'
import { instantiate } from '../wabt-wrapper.js';

async function test() {
    {
        const instance = await instantiate(`
        (func (export "foo") (param i32) (result i32)
            (local.get 0)
                (block
                    (local.set 0 (i32.const 0xbbadbeef))))
        `);

        assert.eq(instance.exports.foo(3), 3);
    }

    {
        const instance = await instantiate(`
        (func $const (result i32)
              (i32.const 42)
              )
    
        (func (export "foo") (param i32) (result i32 i32)
                (call $const)
                (local.get 0)
                (block (param i32) (result i32)
                            ))
        `);

        assert.eq(instance.exports.foo(3), [42, 3]);
    }

    {
        const instance = await instantiate(`
        (func (export "foo") (param i32) (result i32)
            (local.get 0)
            (if (local.get 0)
                  (then (local.set 0 (i32.const 42)))
              (else (local.set 0 (i32.const 13)))))
        `);

        assert.eq(instance.exports.foo(1), 1);
        assert.eq(instance.exports.foo(0), 0);
    }
}

assert.asyncTest(test());
