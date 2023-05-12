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

function opaque1n()
{
    return 1n;
}
noInline(opaque1n);

function testMap(map) {
    map.set(1n, 42);
    shouldBe(map.has(1n), true);
    shouldBe(map.has(opaque1n()), true);
    shouldBe(map.has(createHeapBigInt(opaque1n())), true);
    shouldBe(map.get(1n), 42);
    shouldBe(map.get(opaque1n()), 42);
    shouldBe(map.get(createHeapBigInt(opaque1n())), 42);
    map.set(1n, 40);
    shouldBe(map.get(1n), 40);
    shouldBe(map.get(opaque1n()), 40);
    shouldBe(map.get(createHeapBigInt(opaque1n())), 40);
}
noInline(testMap);

function testSet(set) {
    set.add(1n);
    shouldBe(set.has(1n), true);
    shouldBe(set.has(opaque1n()), true);
    shouldBe(set.has(createHeapBigInt(opaque1n())), true);
    set.delete(createHeapBigInt(opaque1n()));
    shouldBe(set.has(1n), false);
    shouldBe(set.has(opaque1n()), false);
    shouldBe(set.has(createHeapBigInt(opaque1n())), false);
}
noInline(testSet);

let map = new Map();
let set = new Set();
for (let i = 0; i < 1e4; ++i) {
    testMap(map);
    testSet(set);
}
