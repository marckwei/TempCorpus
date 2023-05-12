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

function test(array) {
    return [array.pop(), array.pop(), array.pop(), array.pop()];
}

noInline(test);

for (var i = 0; i < 1e4; ++i) {
    var array = ["foo", "bar", "baz"];
    ensureArrayStorage(array);
    var result = test(array);
    shouldBe(result[0], "baz");
    shouldBe(result[1], "bar");
    shouldBe(result[2], "foo");
    shouldBe(result[3], undefined);
    shouldBe(array.length, 0);
}

for (var i = 0; i < 1e4; ++i) {
    var array = ["foo", "bar", , "baz"];
    ensureArrayStorage(array);
    var result = test(array);
    shouldBe(result[0], "baz");
    shouldBe(result[1], undefined);
    shouldBe(result[2], "bar");
    shouldBe(result[3], "foo");
    shouldBe(array.length, 0);
}

for (var i = 0; i < 1e4; ++i) {
    var array = ["foo", "bar", , "baz", , , "OK"];
    ensureArrayStorage(array);
    shouldBe(array.length, 7);
    var result = test(array);
    shouldBe(result[0], "OK");
    shouldBe(result[1], undefined);
    shouldBe(result[2], undefined);
    shouldBe(result[3], "baz");
    shouldBe(array.length, 3);
    shouldBe(array[0], "foo");
    shouldBe(array[1], "bar");
    shouldBe(array[2], undefined);
    shouldBe(array[3], undefined);
}

for (var i = 0; i < 1e4; ++i) {
    var array = ["foo", "bar", "baz"];
    ensureArrayStorage(array);
    array.length = 0xffffffff - 1;
    shouldBe(array.length, 0xffffffff - 1);
    var result = test(array);
    shouldBe(result[0], undefined);
    shouldBe(result[1], undefined);
    shouldBe(result[2], undefined);
    shouldBe(result[3], undefined);
    shouldBe(array.length, 0xffffffff - 5);
    shouldBe(array[0], "foo");
    shouldBe(array[1], "bar");
    shouldBe(array[2], "baz");
    shouldBe(array[3], undefined);
}
