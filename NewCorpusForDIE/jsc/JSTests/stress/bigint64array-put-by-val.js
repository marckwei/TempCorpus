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

var array1 = new BigInt64Array([-1n, -2n, -3n]);
var array2 = new BigUint64Array([1n, 2n, 3n]);

function test11(array, value) {
    for (var i = 0; i < array.length; ++i)
        array[i] = value;
}
noInline(test11);

function test12(array) {
    var result = 0n;
    for (var i = 0; i < array.length; ++i)
        result += array[i];
    return result;
}
noInline(test12);

function test21(array, value) {
    for (var i = 0; i < array.length; ++i)
        array[i] = value;
}
noInline(test21);

function test22(array) {
    var result = 0n;
    for (var i = 0; i < array.length; ++i)
        result += array[i];
    return result;
}
noInline(test22);

for (var i = 0; i < 1e5; ++i) {
    test11(array1, -1n)
    shouldBe(test12(array1), -3n);
    test11(array1, -2n);
    shouldBe(test12(array1), -6n);
    test21(array2, 1n);
    shouldBe(test22(array2), 3n);
    test21(array2, 2n);
    shouldBe(test22(array2), 6n);
}
