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

let parameters = ["i32", "f32", "externref"];

assert.throws(WebAssembly.Tag, TypeError, "calling WebAssembly.Tag constructor without new is invalid");
let passedParameters = { parameters };
let tag = new WebAssembly.Tag(passedParameters);

assert.truthy(tag.type() !== passedParameters, "Tag type should return a fresh object");
assert.eq(tag.type().parameters, parameters, "Tags type should be the same as the parameters passed in");

assert.throws(WebAssembly.Exception, TypeError, "calling WebAssembly.Exception constructor without new is invalid");

let exception = new WebAssembly.Exception(tag, [1, 2.5, parameters]);
assert.truthy(exception.is(tag));
assert.eq(exception.getArg(tag, 0), 1);
assert.eq(exception.getArg(tag, 1), 2.5);
assert.eq(exception.getArg(tag, 2), parameters);

assert.throws(() => exception.getArg(tag, 3), RangeError, "WebAssembly.Exception.getArg(): Index out of range");

assert.eq(WebAssembly.Exception.prototype.__proto__, Object.prototype)
