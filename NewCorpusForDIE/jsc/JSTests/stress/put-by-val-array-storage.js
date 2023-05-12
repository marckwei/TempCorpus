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

function testArrayStorageInBounds(array, index, value)
{
    array[index] = value;
}
noInline(testArrayStorageInBounds);

for (var i = 0; i < 1e5; ++i) {
    var array = [1, 2, 3, 4, 5];
    ensureArrayStorage(array);
    shouldBe(array[0], 1);
    testArrayStorageInBounds(array, 0, 42);
    shouldBe(array[0], 42);
}
for (var i = 0; i < 1e5; ++i) {
    var array = [, 2, 3, 4];
    ensureArrayStorage(array);
    shouldBe(array[0], undefined);
    shouldBe(array[1], 2);
    testArrayStorageInBounds(array, 0, 42);
    testArrayStorageInBounds(array, 1, 40);
    shouldBe(array[0], 42);
    shouldBe(array[1], 40);
    shouldBe(array.length, 4);
    testArrayStorageInBounds(array, 4, 42);
    shouldBe(array[4], 42);
    shouldBe(array.length, 5);
}
for (var i = 0; i < 1e5; ++i) {
    var array = [, 2, 3, 4];
    ensureArrayStorage(array);
    shouldBe(array[6], undefined);
    testArrayStorageInBounds(array, 6, 42);
    shouldBe(array.length, 7);
    shouldBe(array[6], 42);
}
