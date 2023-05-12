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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function test()
{
    var map = new WeakMap();
    var key1 = {};
    var key2 = {};
    var key3 = [];

    var res1 = map.get(key1);
    map.set(key1, 42);
    var res2 = map.get(key1);

    shouldBe(res1, undefined);
    shouldBe(res2, 42);

    var res3 = map.get(key2);
    map.set(key3, 43);
    var res4 = map.get(key2);

    shouldBe(res3, undefined);
    shouldBe(res4, undefined);

    shouldBe(map.get(key3), 43);

    map.delete(key3);
    shouldBe(map.get(key3), undefined);

    shouldBe(map.get(key1), 42);
    map.delete(key1);
    shouldBe(map.get(key1), undefined);
    shouldBe(map.has(key1), false);

    map.set(key1, 44);
    shouldBe(map.get(key1), 44);
    shouldBe(map.has(key1), true);
}
noInline(test);

for (var i = 0; i < 1e4; ++i)
    test();
