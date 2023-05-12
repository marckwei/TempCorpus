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
//@ skip if $architecture == "x86"

function sumOfArithSeries(limit) {
    return limit * (limit + 1) / 2;
}

var n = 5;

function foo() {
    var result = 0;
    for (var i = 0; i < n; ++i) {
        var o = {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: i}}}}}}}}}}}}}}}}}}};
        var p = {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: {f: i + 1}}}}}}}}}}}}}}}}}}};
        result += o.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f + p.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f.f;
    }
    return result;
}

for (var _i = 0; _i < 80000; ++_i) {
    var result = foo();
    if (result != sumOfArithSeries(n - 1) + sumOfArithSeries(n))
        throw "Error: bad result: " + result;
}