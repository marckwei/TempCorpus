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
function foo(a, b, c, d) {
    var result = a;
    if (a < 0)
        throw "what!";
    else if (a < 1) {
        for (var i = b; i < c; ++i)
            result += d[i];
    } else if (a < 2) {
        for (var i = b + 1; i < c - 1; ++i)
            result += d[i] * a;
    } else if (a < 3) {
        for (var i = b + 2; i < c - 2; ++i)
            result += d[i] * b;
    } else if (a < 4) {
        for (var i = b + 3; i < c - 3; ++i)
            result += d[i] * c;
    } else
        throw "huh?";
    return result;
}

var array = [];
for (var i = 0; i < 20; ++i)
    array.push(i);

var limit = 20000;
var phases = 4;
var result = 0;
for (var i = 0; i < limit; ++i) {
    var phase = (i * phases / limit) | 0;
    result += foo(i % (phase + 1), ((i % array.length) / 2) | 0, array.length - (((i % array.length) / 2) | 0), array);
}

if (result != 3072367)
    throw "Bad result: " + result;


