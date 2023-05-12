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

var s1 = Symbol("A");
var s2 = Symbol("B");
var s3 = Symbol("C");
var o1 = {};
var o2 = {};
var o3 = {};

function test() {
    var map = new WeakMap();
    shouldBe(map.get(s1), undefined);
    shouldBe(map.get(s2), undefined);
    shouldBe(map.get(s3), undefined);
    shouldBe(map.get(o1), undefined);
    shouldBe(map.get(o2), undefined);
    shouldBe(map.get(o3), undefined);

    shouldBe(map.has(s1), false);
    shouldBe(map.has(s2), false);
    shouldBe(map.has(s3), false);
    shouldBe(map.has(o1), false);
    shouldBe(map.has(o2), false);
    shouldBe(map.has(o3), false);

    shouldBe(map.set(s1, 1), map);
    shouldBe(map.set(s2, 2), map);
    shouldBe(map.set(o1, 3), map);
    shouldBe(map.set(o2, 4), map);

    shouldBe(map.get(s1), 1);
    shouldBe(map.get(s2), 2);
    shouldBe(map.get(s3), undefined);
    shouldBe(map.get(o1), 3);
    shouldBe(map.get(o2), 4);
    shouldBe(map.get(o3), undefined);

    shouldBe(map.has(s1), true);
    shouldBe(map.has(s2), true);
    shouldBe(map.has(s3), false);
    shouldBe(map.has(o1), true);
    shouldBe(map.has(o2), true);
    shouldBe(map.has(o3), false);

    shouldBe(map.delete(s1), true);
    shouldBe(map.has(s1), false);

    shouldBe(map.delete(s3), false);
    shouldBe(map.has(s3), false);

    shouldBe(map.delete(o1), true);
    shouldBe(map.has(o1), false);

    shouldBe(map.delete(o3), false);
    shouldBe(map.has(o3), false);
}
noInline(test);

for (var i = 0; i < 1e4; ++i)
    test();
