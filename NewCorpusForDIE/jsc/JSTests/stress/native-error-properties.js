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

"use strict";

function assert(b) {
    if (!b)
        throw new Error("Bad assertion");
}

function shouldNotThrow(expr) {
    let testFunc = new Function(expr);
    let error;
    try {
        testFunc();
    } catch (e) {
        error = e;
    }
    assert(!error);
}

function checkEmptyErrorPropertiesDescriptors(error) {
    let descriptor = Object.getOwnPropertyDescriptor(error, "message");
    assert(descriptor === undefined);
}

function checkNonEmptyErrorPropertiesDescriptors(error) {
    let descriptor = Object.getOwnPropertyDescriptor(error, "message");
    assert(descriptor.configurable);
    assert(!descriptor.enumerable);
    assert(descriptor.writable);
}

function checkErrorPropertiesWritable(error) {
    let properties = ["name", "message", "line", "lineNumber", "column", "columnNumber", "sourceURL", "stack"];
    for (let p of properties) {
        assert(error[p] !== 999);
        error[p] = 999;
        assert(error[p] === 999);
    }
}

// User created error instances.
let errorConstructors = [Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError];
for (let constructor of errorConstructors) {
    shouldNotThrow(`checkErrorPropertiesWritable(new ${constructor.name})`);
    shouldNotThrow(`checkEmptyErrorPropertiesDescriptors(new ${constructor.name})`);
    shouldNotThrow(`checkNonEmptyErrorPropertiesDescriptors(new ${constructor.name}('message'))`);
}

// Engine created error instances.
var globalError = null;

try {
    eval("{");
} catch (e) {
    globalError = e;
    assert(e.name === "SyntaxError");
    assert(e.message.length);
    shouldNotThrow("checkNonEmptyErrorPropertiesDescriptors(globalError)");
    shouldNotThrow("checkErrorPropertiesWritable(globalError)");
}

try {
    a.b.c;
} catch (e) {
    globalError = e;
    assert(e.name === "ReferenceError");
    assert(e.message.length);
    shouldNotThrow("checkNonEmptyErrorPropertiesDescriptors(globalError)");
    shouldNotThrow("checkErrorPropertiesWritable(globalError)");
}

try {
    undefined.x;
} catch (e) {
    globalError = e;
    assert(e.name === "TypeError");
    assert(e.message.length);
    shouldNotThrow("checkNonEmptyErrorPropertiesDescriptors(globalError)");
    shouldNotThrow("checkErrorPropertiesWritable(globalError)");
}
