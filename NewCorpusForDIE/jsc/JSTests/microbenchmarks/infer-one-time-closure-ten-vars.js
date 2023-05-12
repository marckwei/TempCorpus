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
function fooMaker(xParam) {
    var x = xParam;
    var x2 = xParam + 1;
    var x3 = xParam + 2;
    var x4 = xParam + 3;
    var x5 = xParam + 4;
    var x6 = xParam + 5;
    var x7 = xParam + 6;
    var x8 = xParam + 7;
    var x9 = xParam + 8;
    var x10 = xParam + 9;
    return function (y) {
        for (var i = 0; i < 1000; ++i)
            y += x + x2 + x3 + x4 + x5 + x6 + x7 + x8 + x9 + x10;
        return y;
    }
}

var foo = fooMaker(42);

noInline(foo);

for (var i = 0; i < 10000; ++i) {
    var result = foo(5);
    if (result != 465005)
        throw "Error: bad result: " + result;
}

var result = fooMaker(23)(5);
if (result != 275005)
    throw "Error: bad result: " + result;
