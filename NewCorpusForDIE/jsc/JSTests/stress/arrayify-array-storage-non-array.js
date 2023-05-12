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

var array = {0:1, 1:2, 2:3, 3:4, 4:5};
var array2 = {0:1, 1:"HELLO", 2:3, 3:4, 4:5};
var array3 = {0:0.1, 1:"OK", 2:0.3, 3:0.4, 4:0.5};
ensureArrayStorage(array2);
array.ok = 42;
array2.ok = 42;
array3.ok = 42;

// Arrayify(ArrayStorage) works with ftl-eager
function testArrayStorage(array)
{
    return array[4];
}
noInline(testArrayStorage);

for (var i = 0; i < 1e6; ++i) {
    shouldBe(testArrayStorage(array), 5);
    shouldBe(testArrayStorage(array2), 5);
    shouldBe(testArrayStorage(array3), 0.5);
}

var array4 = [0, 1, 2, 3, 4];
shouldBe(testArrayStorage(array4), 4);
