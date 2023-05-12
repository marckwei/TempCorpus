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
var g;
(function() {
    for (var i = 0; i < 10000000; ++i) {
        g = i + 0;
        g = i + 1;
        g = i + 2;
        g = i + 3;
        g = i + 4;
        g = i + 5;
        g = i + 6;
        g = i + 7;
        g = i + 8;
        g = i + 9;
        g = i + 10;
        g = i + 11;
        g = i + 12;
        g = i + 13;
        g = i + 14;
        g = i + 15;
        g = i + 0;
        g = i + 1;
        g = i + 2;
        g = i + 3;
        g = i + 4;
        g = i + 5;
        g = i + 6;
        g = i + 7;
        g = i + 8;
        g = i + 9;
        g = i + 10;
        g = i + 11;
        g = i + 12;
        g = i + 13;
        g = i + 14;
        g = i + 15;
    }
    return g;
})();
