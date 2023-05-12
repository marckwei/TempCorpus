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

let wat = `
(module
    (func (export "testEqTrue") (result i32)
        f32.const 42
        f32.const 42
        f32.eq
    )

    (func (export "testEqFalse") (result i32)
        f32.const 41
        f32.const 42
        f32.eq
    )

    (func (export "testNeTrue") (result i32)
        f32.const 41
        f32.const 42
        f32.ne
    )

    (func (export "testNeFalse") (result i32)
        f32.const 42
        f32.const 42
        f32.ne
    )

    (func (export "testLtTrue") (result i32)
        f32.const -8
        f32.const 17
        f32.lt
    )

    (func (export "testLtFalse") (result i32)
        f32.const 17
        f32.const 9
        f32.lt
    )

    (func (export "testLeTrue") (result i32)
        f32.const 19
        f32.const 19
        f32.le
    )

    (func (export "testLeFalse") (result i32)
        f32.const 17
        f32.const 9
        f32.le
    )

    (func (export "testGtTrue") (result i32)
        f32.const 17
        f32.const -8
        f32.gt
    )

    (func (export "testGtFalse") (result i32)
        f32.const 9
        f32.const 17
        f32.gt
    )

    (func (export "testGeTrue") (result i32)
        f32.const 19
        f32.const 19
        f32.ge
    )

    (func (export "testGeFalse") (result i32)
        f32.const 9
        f32.const 17
        f32.ge
    )
)
`;

async function test() {
    const instance = await instantiate(wat, {}, {});
    const {
        testEqTrue, testEqFalse, 
        testNeTrue, testNeFalse,
        testLtTrue, testLtFalse,
        testLeTrue, testLeFalse,
        testGtTrue, testGtFalse,
        testGeTrue, testGeFalse,
    } = instance.exports;
    assert.eq(testEqTrue(), 1);
    assert.eq(testEqFalse(), 0);
    assert.eq(testNeTrue(), 1);
    assert.eq(testNeFalse(), 0);
    assert.eq(testLtTrue(), 1);
    assert.eq(testLtFalse(), 0);
    assert.eq(testLeTrue(), 1);
    assert.eq(testLeFalse(), 0);
    assert.eq(testGtTrue(), 1);
    assert.eq(testGtFalse(), 0);
    assert.eq(testGeTrue(), 1);
    assert.eq(testGeFalse(), 0);
}

assert.asyncTest(test());
