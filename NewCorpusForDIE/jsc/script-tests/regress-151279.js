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

description("Regression test for https://webkit.org/b/151279.");

// This test verifies that a megamorphic tail call from the first callee from C++ code
// works without crashing.

function bar() {
    return 11;
}

noInline(bar);

function foo(thisArgument)
{
    "use strict";

    return this.call(...arguments);
}

var fixedDate = new Date(2011, 11, 11, 11, 11, 11);
var boundFuncs = [];

boundFuncs[0] = foo.bind(Date.prototype.getSeconds, fixedDate);
boundFuncs[1] = foo.bind(Date.prototype.getMinutes, fixedDate);
boundFuncs[2] = foo.bind(Date.prototype.getHours, fixedDate);
boundFuncs[3] = foo.bind(Date.prototype.getDate, fixedDate);
boundFuncs[4] = foo.bind(Date.prototype.getMonth, fixedDate);
boundFuncs[5] = foo.bind(bar, 0);

function test()
{
    for (var i = 0; i < 200000; i++) {
        got = boundFuncs[i % 6]();
        if (got != 11)
            testFailed("Function returned " + got + " but expected 11!");
    }
}

noInline(test);

test();

testPassed("Properly handled megamorphic tail call from a JS entry function");
