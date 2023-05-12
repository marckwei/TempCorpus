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
    let callerChecks = [];
    for (let i = 0; i < types.length; ++i) {
        let type = types[i];
        calleeBody += `(${type}.const ${i})`;
        callerChecks.push(`(${type}.ne (${type}.const ${i})) (br_if 0)`);
    }

    callerChecks = callerChecks.reverse().join(" ");
    let watCallee = `
(module
  (type (func (result ${types.join(" ")})))
  (func $callee (export "callee") (type 0)
    ${calleeBody}
  )
  (table funcref (elem $callee))
  (func (export "caller")
    (block
      (call_indirect (type 0) (i32.const 0))
      ${callerChecks}
      return
    )
    unreachable
  )
)
`;
    let watCaller = `
(module
  (type (func (result ${types.join(" ")})))
  (func $callee (import "env" "callee") (type 0))
  (table funcref (elem $callee))
  (func (export "caller")
    (block
      (call_indirect (type 0) (i32.const 0))
      ${callerChecks}
      return
    )
    unreachable
  )
)
`;
    let calleeInst = await instantiate(watCallee);
    let callerInst = await instantiate(watCaller, { env: calleeInst.exports });
    for (let i = 0; i < 10000; ++i) {
        calleeInst.exports.caller();
        callerInst.exports.caller();
    }
}

async function test() {
    await Promise.all([
        buildWat(["i32"]),
        buildWat(["i32", "i64", "f32", "i32"]),
        buildWat(["i32", "i64", "f32", "i32", "f64", "f32", "i64", "i32"]),

        // gpr in registers but fpr spilled. arm64 has 32 fprs so go above that
        buildWat(["i64", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i64", "f32", "f32", "f64"]),
        // gpr first and in middle
        buildWat(["i64", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i64", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32" , "f32", "f32", "f32", "f64"]),

        // gpr at end and in middle
        buildWat(["f64", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i64", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f64", "f32", "i32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32" , "f32", "f32", "f32", "i64"]),
        buildWat(["f32", "f32", "f32", "f32", "f32", "f32", "f32", "f32", "i64", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32", "f64", "f32", "i32", "f32", "f32", "f32", "f64", "f32", "f32", "f32", "f32" , "f32", "f32", "f32", "i64"]),


        // fpr in registers but gpr spilled. arm64 has 32 fprs so go above that
        buildWat(["f64", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f64", "i32", "i32", "i64"]),
        // fpr first and in middle
        buildWat(["f64", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f64", "i32", "i32", "i64", "i32", "i32", "i32", "i32", "i32", "i32", "i64", "i32", "i32", "i32", "i32", "i64", "i32", "i32", "i32", "i32", "i64", "i32", "i32", "i32", "i32" , "i32", "i32", "i32", "i64"]),

        // gpr at end and in middle
        buildWat(["i64", "i32", "i32", "i32", "i32", "i32", "i32", "i32", "f64", "i32", "i32", "i64", "i32", "i32", "i32", "i32", "i32", "i32", "i64", "i32", "i32", "i32", "i32", "i64", "i32", "f32", "i32", "i32", "i32", "i64", "i32", "i32", "i32", "i32" , "i32", "i32", "i32", "f64"]),


        // both are spilled
        buildWat(["i32", "f32", "i32", "f64", "i64", "f32", "i32", "i32", "f64", "i64", "i32", "f64", "f32", "f32", "f32", "f64", "f32", "i32", "i32", "f32", "i64", "f32", "f64", "f64", "i32", "f32", "f32", "f64", "i64", "i64", "i32", "f64", "f64", "f64", "f32", "f32", "i32", "i64", "i32", "i64", "f32", "f32", "f64", "i64", "i32", "i64", "i64", "i64", "i32", "i32", "f64", "f32", "f32", "f32", "f64", "i32", "i64", "i64", "f32", "f64", "f64", "i32", "i64", "f64", "f64", "f64", "i32", "i64", "i64", "i64"])
    ]);
}

assert.asyncTest(test());
