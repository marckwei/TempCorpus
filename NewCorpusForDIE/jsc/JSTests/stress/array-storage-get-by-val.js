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

'use strict';

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var object = { a: 10 };
Object.defineProperties(object, {
    "0": {
        get: function() { return this.a; },
        set: function(x) { this.a = x; },
    },
});

var array = [ 0, 1, 2, 3, 4, 5 ];
ensureArrayStorage(array);

function testOutOfBound()
{
    var results = 0;
    for (var i = 0; i < 1e5; ++i) {
        for (var j = 0; j < 7; ++j) {
            var value = array[j];
            if (value !== undefined)
                results += value;
        }
    }
    return results;
}
noInline(testOutOfBound);

function testInBound()
{
    var results = 0;
    for (var i = 0; i < 1e5; ++i) {
        for (var j = 0; j < 6; ++j)
            results += array[j];
    }
    return results;
}
noInline(testInBound);

var slowPutArray = [ 0, 1, 2, 3, 4, 5 ];
ensureArrayStorage(slowPutArray);
slowPutArray.__proto__ = object;

function testSlowPutOutOfBound()
{
    var results = 0;
    for (var i = 0; i < 1e5; ++i) {
        for (var j = 0; j < 7; ++j) {
            var value = slowPutArray[j];
            if (value !== undefined)
                results += value;
        }
    }
    return results;
}
noInline(testSlowPutOutOfBound);

function testSlowPutInBound()
{
    var results = 0;
    for (var i = 0; i < 1e5; ++i) {
        for (var j = 0; j < 6; ++j)
            results += slowPutArray[j];
    }
    return results;
}
noInline(testSlowPutInBound);

shouldBe(testOutOfBound(), 1500000);
shouldBe(testInBound(), 1500000);
shouldBe(testSlowPutOutOfBound(), 1500000);
shouldBe(testSlowPutInBound(), 1500000);
