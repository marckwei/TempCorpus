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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

{
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(Array.prototype.filter).sort()), `["length","name"]`);
    shouldBe(Array.prototype.filter.name, "filter");
    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(Array.prototype.filter, 'name')), `{"value":"filter","writable":false,"enumerable":false,"configurable":true}`);
    shouldBe(delete Array.prototype.filter.name, true);
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(Array.prototype.filter).sort()), `["length"]`);
}

{
    shouldThrow(function () {
        "use strict";
        Array.prototype.forEach.name = 42;
    }, `TypeError: Attempted to assign to readonly property.`);
}

{
    var resolve = null;
    var reject = null;
    new Promise(function (arg0, arg1) {
        resolve = arg0;
        reject = arg1;
    });
    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(resolve, 'name')), `{"value":"","writable":false,"enumerable":false,"configurable":true}`);
    shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(reject, 'name')), `{"value":"","writable":false,"enumerable":false,"configurable":true}`);
}
