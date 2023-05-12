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
    (func (export "test") (param i64) (result i64)
        i64.const 3
        block (param i64) (result i64)
            block (param i64) (result i64)
                local.get 0
                i64.const 2
                i64.ne
                br_table 0 2 2
            end
            drop
            i64.const 4
        end
    )

    (func (export "testAlwaysTrue") (result i64)
        i64.const 3
        block (param i64) (result i64)
            block (param i64) (result i64)
                i64.const 1
                i64.const 2
                i64.ne
                br_table 0 2 2
            end
            drop
            i64.const 4
        end
    )

    (func (export "testAlwaysFalse") (result i64)
        i64.const 3
        block (param i64) (result i64)
            block (param i64) (result i64)
                i64.const 2
                i64.const 2
                i64.ne
                br_table 0 2 2
            end
            drop
            i64.const 4
        end
    )
)
`;

async function test() {
    const instance = await instantiate(wat, {}, {});
    const { test, testAlwaysTrue, testAlwaysFalse } = instance.exports;
    assert.eq(test(1n), 3n);
    assert.eq(test(2n), 4n);
    assert.eq(testAlwaysTrue(), 3n);
    assert.eq(testAlwaysFalse(), 4n);
}

assert.asyncTest(test());
