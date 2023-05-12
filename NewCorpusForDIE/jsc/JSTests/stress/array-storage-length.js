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

function testInBound(array)
{
    return array.length;
}
noInline(testInBound);
for (var i = 0; i < 1e5; ++i)
    shouldBe(testInBound(array), 6);

function testUncountable(array)
{
    return array.length;
}
noInline(testUncountable);
for (var i = 0; i < 1e5; ++i)
    shouldBe(testUncountable(array), 6);
array.length = 0xffffffff - 1;
for (var i = 0; i < 1e5; ++i)
    shouldBe(testUncountable(array), 0xffffffff - 1);


var slowPutArray = [ 0, 1, 2, 3, 4, 5 ];
ensureArrayStorage(slowPutArray);
slowPutArray.__proto__ = object;

function testSlowPutInBound(array)
{
    return array.length;
}
noInline(testSlowPutInBound);
for (var i = 0; i < 1e5; ++i)
    shouldBe(testSlowPutInBound(slowPutArray), 6);

function testSlowPutUncountable(array)
{
    return array.length;
}
noInline(testSlowPutUncountable);
for (var i = 0; i < 1e5; ++i)
    shouldBe(testSlowPutUncountable(slowPutArray), 6);
slowPutArray.length = 0xffffffff - 1;
for (var i = 0; i < 1e5; ++i)
    shouldBe(testSlowPutUncountable(slowPutArray), 0xffffffff - 1);
