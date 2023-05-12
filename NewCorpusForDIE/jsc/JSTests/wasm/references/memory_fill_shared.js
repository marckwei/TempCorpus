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

async function test() {
  let wat = `
  (module
    (import "env" "memory" (memory $mem0 1 7 shared))
    (func (export "do_fill")
      (memory.fill (i32.const 1) (i32.const 37) (i32.const 3))
    )
    (func (export "get") (param $address i32) (result i32)
      (i32.load8_u (local.get $address))
    )
  )
  `;

  let memory = new WebAssembly.Memory({initial: 1, maximum: 7, shared: true});
  const instance = await instantiate(wat, {env: {"memory": memory}}, {reference_types: true});

  assert.eq(instance.exports.get(0), 0);
  assert.eq(instance.exports.get(1), 0);
  assert.eq(instance.exports.get(2), 0);
  assert.eq(instance.exports.get(3), 0);
  assert.eq(instance.exports.get(4), 0);

  instance.exports.do_fill();

  assert.eq(instance.exports.get(0), 0);
  assert.eq(instance.exports.get(1), 37);
  assert.eq(instance.exports.get(2), 37);
  assert.eq(instance.exports.get(3), 37);
  assert.eq(instance.exports.get(4), 0);
}

assert.asyncTest(test());
