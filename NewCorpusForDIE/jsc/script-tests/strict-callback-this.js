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

description(
"This tests that a call to array/string prototype methods pass the correct this value (undefined) to strict callees."
);

var undefinedString = String(undefined);
var globalObjectString = String(this);

function strictThrowThisString()
{
    "use strict";
    throw String(this);
}

function nonstrictThrowThisString()
{
    throw String(this);
}

function testArrayPrototypeSort(callback)
{
    try {
        [1,2].sort(callback);
    } catch (e) {
        return e;
    }
    return "FAILED";
}

function testArrayPrototypeFilter(callback)
{
    try {
        [1,2].filter(callback);
    } catch (e) {
        return e;
    }
    return "FAILED";
}

function testArrayPrototypeMap(callback)
{
    try {
        [1,2].map(callback);
    } catch (e) {
        return e;
    }
    return "FAILED";
}

function testArrayPrototypeEvery(callback)
{
    try {
        [1,2].every(callback);
    } catch (e) {
        return e;
    }
    return "FAILED";
}

function testArrayPrototypeForEach(callback)
{
    try {
        [1,2].forEach(callback);
    } catch (e) {
        return e;
    }
    return "FAILED";
}

function testArrayPrototypeSome(callback)
{
    try {
        [1,2].some(callback);
    } catch (e) {
        return e;
    }
    return "FAILED";
}

function testStringPrototypeReplace(callback)
{
    try {
        "1,2".replace('1', callback);
    } catch (e) {
        return e;
    }
    return "FAILED";
}

shouldBe('testArrayPrototypeSort(strictThrowThisString)', 'undefinedString');
shouldBe('testArrayPrototypeFilter(strictThrowThisString)', 'undefinedString');
shouldBe('testArrayPrototypeMap(strictThrowThisString)', 'undefinedString');
shouldBe('testArrayPrototypeEvery(strictThrowThisString)', 'undefinedString');
shouldBe('testArrayPrototypeForEach(strictThrowThisString)', 'undefinedString');
shouldBe('testArrayPrototypeSome(strictThrowThisString)', 'undefinedString');
shouldBe('testStringPrototypeReplace(strictThrowThisString)', 'undefinedString');

shouldBe('testArrayPrototypeSort(nonstrictThrowThisString)', 'globalObjectString');
shouldBe('testArrayPrototypeFilter(nonstrictThrowThisString)', 'globalObjectString');
shouldBe('testArrayPrototypeMap(nonstrictThrowThisString)', 'globalObjectString');
shouldBe('testArrayPrototypeEvery(nonstrictThrowThisString)', 'globalObjectString');
shouldBe('testArrayPrototypeForEach(nonstrictThrowThisString)', 'globalObjectString');
shouldBe('testArrayPrototypeSome(nonstrictThrowThisString)', 'globalObjectString');
shouldBe('testStringPrototypeReplace(nonstrictThrowThisString)', 'globalObjectString');
