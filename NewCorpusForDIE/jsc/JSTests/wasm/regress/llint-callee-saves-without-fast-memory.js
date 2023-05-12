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

//@ requireOptions("--useWebAssemblyFastMemory=false")

import * as assert from '../assert.js';
import { instantiate } from '../wabt-wrapper.js';

async function test() {
    const instance = await instantiate(`
        (module
    
        (memory 0)
    
        (func $grow
            (memory.grow (i32.const 1))
            (drop)
        )
    
        (func $f (param $bail i32)
            (br_if 0 (local.get $bail))
            (call $grow)
            (i32.store (i32.const 42) (i32.const 0))
        )
    
        (func (export "main")
            (local $i i32)
            (local.set $i (i32.const 100000))
            (loop
                (i32.sub (local.get $i) (i32.const 1))
                (local.tee $i)
                (call $f (i32.const 1))
                (br_if 0)
            )
            (call $f (i32.const 0))
        )
    
        )
    `);

    // This should not throw an OutOfBounds exception
    instance.exports.main();
}

assert.asyncTest(test());
