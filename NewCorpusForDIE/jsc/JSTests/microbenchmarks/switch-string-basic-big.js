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
function foo(x) {
    switch (x) {
    case "aaa": return 1;
    case "aab": return 2;
    case "aac": return 3;
    case "aba": return 10;
    case "abb": return 20;
    case "abc": return 30;
    case "baaa": return 4;
    case "baab": return 5;
    case "baac": return 6;
    case "bbaa": return 40;
    case "bbab": return 50;
    case "bbac": return 60;
    case "bbba": return 400;
    case "bbbb": return 500;
    case "bbbc": return 600;
    case "caaaa": return 7;
    case "caaab": return 8;
    case "caaac": return 9;
    case "cbaaa": return 70;
    case "cbaab": return 80;
    case "cbaac": return 90;
    case "cbbaa": return 700;
    case "cbbab": return 800;
    case "cbbac": return 900;
    case "cbbba": return 7000;
    case "cbbbb": return 8000;
    case "cbbbc": return 9000;
    case "dbbba": return 70000;
    case "dbbbb": return 80000;
    case "dbbbc": return 90000;
    case "ebaaa": return 400000;
    case "ebaab": return 500000;
    case "ebaac": return 600000;
    default: return 10;
    }
}

function make(pre, post) { return pre + "a" + post; }

var strings = ["aaa", "aab", "aac", "baaa", "baab", "baac", "caaaa", "caaab", "caaac", "aad", "baad", "caaad", "d", "daa"];

var result = 0;
for (var i = 0; i < 1000000; ++i)
    result += foo(strings[i % strings.length]);

if (result != 6785696)
    throw "Bad result: " + result;
