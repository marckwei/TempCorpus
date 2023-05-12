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
        throw new Error('bad value: ' + actual);
}

function test1(array)
{
    return 2 in array;
}
noInline(test1);

var array = [1, 2, 3, 4];
ensureArrayStorage(array);
for (var i = 0; i < 1e5; ++i)
    shouldBe(test1(array), true);

var array = [1, 2, , 4];
ensureArrayStorage(array);
shouldBe(test1(array), false);

var array = [];
ensureArrayStorage(array);
shouldBe(test1(array), false);

function test2(array)
{
    return 2 in array;
}
noInline(test2);

var array1 = [1, 2, 3, 4];
ensureArrayStorage(array1);
var array2 = [1, 2];
ensureArrayStorage(array2);
for (var i = 0; i < 1e5; ++i)
    shouldBe(test2(array2), false);
shouldBe(test2(array2), false);
shouldBe(test2(array1), true);
