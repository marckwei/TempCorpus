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
        i64.const 42
        i64.const 42
        i64.eq
    )

    (func (export "testEqFalse") (result i32)
        i64.const 41
        i64.const 42
        i64.eq
    )

    (func (export "testNeTrue") (result i32)
        i64.const 41
        i64.const 42
        i64.ne
    )

    (func (export "testNeFalse") (result i32)
        i64.const 42
        i64.const 42
        i64.ne
    )

    (func (export "testLtSTrue") (result i32)
        i64.const -8
        i64.const 17
        i64.lt_s
    )

    (func (export "testLtSFalse") (result i32)
        i64.const 17
        i64.const 9
        i64.lt_s
    )

    (func (export "testLtUTrue") (result i32)
        i64.const 9
        i64.const 17
        i64.lt_u
    )

    (func (export "testLtUFalse") (result i32)
        i64.const -8
        i64.const 17
        i64.lt_u
    )

    (func (export "testLeSTrue") (result i32)
        i64.const 19
        i64.const 19
        i64.le_s
    )

    (func (export "testLeSFalse") (result i32)
        i64.const 17
        i64.const 9
        i64.le_s
    )

    (func (export "testLeUTrue") (result i32)
        i64.const -9
        i64.const -9
        i64.le_u
    )

    (func (export "testLeUFalse") (result i32)
        i64.const -8
        i64.const 17
        i64.le_u
    )

    (func (export "testGtSTrue") (result i32)
        i64.const 17
        i64.const -8
        i64.gt_s
    )

    (func (export "testGtSFalse") (result i32)
        i64.const 9
        i64.const 17
        i64.gt_s
    )

    (func (export "testGtUTrue") (result i32)
        i64.const 17
        i64.const 9
        i64.gt_u
    )

    (func (export "testGtUFalse") (result i32)
        i64.const 17
        i64.const -8
        i64.gt_u
    )

    (func (export "testGeSTrue") (result i32)
        i64.const 19
        i64.const 19
        i64.ge_s
    )

    (func (export "testGeSFalse") (result i32)
        i64.const 9
        i64.const 17
        i64.ge_s
    )

    (func (export "testGeUTrue") (result i32)
        i64.const -9
        i64.const -9
        i64.ge_u
    )

    (func (export "testGeUFalse") (result i32)
        i64.const 17
        i64.const -8
        i64.ge_u
    )

    (func (export "testEqzTrue") (result i32)
        i64.const 0
        i64.eqz
    )
    
    (func (export "testEqzFalse") (result i32)
        i64.const 1
        i64.eqz
    )
)
`;

async function test() {
    const instance = await instantiate(wat, {}, {});
    const {
        testEqTrue, testEqFalse, 
        testNeTrue, testNeFalse,
        testLtSTrue, testLtSFalse,
        testLtUTrue, testLtUFalse,
        testLeSTrue, testLeSFalse,
        testLeUTrue, testLeUFalse,
        testGtSTrue, testGtSFalse,
        testGtUTrue, testGtUFalse,
        testGeSTrue, testGeSFalse,
        testGeUTrue, testGeUFalse,
        testEqzTrue, testEqzFalse
    } = instance.exports;
    assert.eq(testEqTrue(), 1);
    assert.eq(testEqFalse(), 0);
    assert.eq(testNeTrue(), 1);
    assert.eq(testNeFalse(), 0);
    assert.eq(testLtSTrue(), 1);
    assert.eq(testLtSFalse(), 0);
    assert.eq(testLtUTrue(), 1);
    assert.eq(testLtUFalse(), 0);
    assert.eq(testLeSTrue(), 1);
    assert.eq(testLeSFalse(), 0);
    assert.eq(testLeUTrue(), 1);
    assert.eq(testLeUFalse(), 0);
    assert.eq(testGtSTrue(), 1);
    assert.eq(testGtSFalse(), 0);
    assert.eq(testGtUTrue(), 1);
    assert.eq(testGtUFalse(), 0);
    assert.eq(testGeSTrue(), 1);
    assert.eq(testGeSFalse(), 0);
    assert.eq(testGeUTrue(), 1);
    assert.eq(testGeUFalse(), 0);
    assert.eq(testEqzTrue(), 1);
    assert.eq(testEqzFalse(), 0);
}

assert.asyncTest(test());
