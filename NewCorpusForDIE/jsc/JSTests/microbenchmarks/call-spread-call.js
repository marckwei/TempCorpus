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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py

Function.prototype.c = Function.prototype.call;

function testFunction(a, b)
{
    "use strict"
    return this * 10000 + a * 1000 + b * 100 + arguments[2] * 10 + arguments.length;
}

var arrayArguments = [1, 2, 3, 4]

for (var i = 0; i < 15000; i++) {
    var result1 = testFunction.call(...arrayArguments);
    var result2 = testFunction.c(...arrayArguments);
    if (result1 != result2) 
        throw "Call with spread array failed at iteration " + i + ": " + result1 + " vs " + result2;
}

function test2() {
    for (var i = 0; i < 15000; i++) {
        var result1 = testFunction.call(...arguments);
        var result2 = testFunction.c(...arguments);
        if (result1 != result2)
           throw "Call with spread arguments failed at iteration " + i + ": " + result1 + " vs " + result2;
    }
}

test2(1,2,3,4)


function test3() {
    aliasedArguments = arguments;
    for (var i = 0; i < 15000; i++) {
        var result1 = testFunction.call(...aliasedArguments);
        var result2 = testFunction.c(...aliasedArguments);
        if (result1 != result2)
           throw "Call with spread arguments failed at iteration " + i + ": " + result1 + " vs " + result2;
    }
}

test3(1,2,3,4)
