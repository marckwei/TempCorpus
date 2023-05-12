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
        throw new Error(`bad value: ${String(actual)}`);
}

(function() {
    "use strict";
    var cols = {"col":{"title":"&nbsp;","type":"sys","events":[],"name":0,"id":0,"_i":0}};
    var len = 0;
    var remapcols = ['col'];
    for (var i = 0; i < remapcols.length; i++) {
        cols[cols[remapcols[i]].name] = cols[remapcols[i]];
        delete cols[remapcols[i]];
    }
    var count = 0;
    for (var col2 in cols) {
        count++;
        shouldBe(col2, '0');
    }
    shouldBe(count, 1);
}());

(function() {
    "use strict";
    var cols = {"col":{"title":"&nbsp;","type":"sys","events":[],"name":0,"id":0,"_i":0}};
    var len = 0;
    var remapcols = ['col'];
    for (var i = 0; i < remapcols.length; i++) {
        cols[cols[remapcols[i]].name] = cols[remapcols[i]];
        delete cols[remapcols[i]];
    }
    var count = 0;
    for (var col2 in cols) {
        count++;
        shouldBe(col2, '0');
    }
    shouldBe(count, 1);
}());
