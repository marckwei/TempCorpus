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

description("Regression test for 150745");

// We should be able to ORS exit from an inlined tail callee of a getter.  This test shouldn't crash.

"use strict";

class Test {
    constructor(a, b)
    {
        this.a = a;
        this.b = b;
        this.callCount = 0;
    }

    get sum()
    {
        return this.doSum(1, 2);
    }

    doSum(dummy1, dummy2)
    {
        this.callCount++;

        if (this.callCount == 49000)
            this.dfgCompiled = true;

        if (this.callCount == 199000)
            this.ftlCompiled = true;

        return this.a + this.b;
    }
}

var testObj = new Test(40, 2);

function getSum(o)
{
    return o.sum;
}

for (var i = 0; i < 500000; i++) {
    var result = getSum(testObj);
    if (result != 42)
        testFailed("Expected 42 from \"sum\" getter, got " + result);
}

testPassed("Able to OSR exit from an inlined tail callee of a getter.");
