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
function foo() {
    return a + b;
}

noInline(foo);

var a;
var b;

function setA(p, value) {
    if (p)
        a = value;
}

function setB(p, value) {
    if (p)
        b = value;
}

noInline(setA);
noInline(setB);

setA(true, 4);
setB(true, 5);

for (var i = 0; i < 1000; ++i) {
    setA(false, 42);
    setB(false, 42);
}

function check(actual, expected) {
    if (actual == expected)
        return;
    throw "Error: expected " + expected + " but got " + actual;
}

for (var i = 0; i < 100; ++i)
    check(foo(), 9);

setA(true, 6);

for (var i = 0; i < 1000; ++i)
    check(foo(), 11);

setB(true, 7);

for (var i = 0; i < 10000; ++i)
    check(foo(), 13);