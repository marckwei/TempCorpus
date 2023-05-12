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

// trivial
function Pelmen(calories) {
  this.calories = calories;
}
const calories = 100;

function testGlobalConstructorForExternref() {
  {
      let global = new WebAssembly.Global({ value: "externref", mutable: true });
      assert.eq(global.value, undefined);

      global.value = new Pelmen(calories);
      assert.eq(global.value.calories, calories);
  }

  {
      let global = new WebAssembly.Global({ value: "externref", mutable: true }, new Pelmen(calories));
      assert.eq(global.value.calories, calories);
  }
}

async function testGlobalConstructorForFuncref() {
  const instance = await instantiate(`(module (func (export "foo")))`, {}, {reference_types: true});

  {
      let global = new WebAssembly.Global({ value: "anyfunc", mutable: true });
      assert.eq(global.value, null);

      global.value = instance.exports.foo;
      assert.eq(global.value, instance.exports.foo);
  }

  {
      let global = new WebAssembly.Global({ value: "anyfunc", mutable: true }, instance.exports.foo);
      assert.eq(global.value, instance.exports.foo);
      assert.throws(() => global.value = new Pelmen(calories), TypeError, "Funcref must be an exported wasm function");
  }

  assert.throws(() => new WebAssembly.Global({ value: "anyfunc", mutable: true }, new Pelmen(calories)), TypeError, "Funcref must be an exported wasm function");
}

testGlobalConstructorForExternref();
assert.asyncTest(testGlobalConstructorForFuncref());
