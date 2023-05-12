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

function testMap(map, key)
{
    return map.has(key);
}
noInline(testMap);

function testSet(set, key)
{
    return set.has(key);
}
noInline(testSet);

let map = new Map();
map.set("Hey", "Hey");
map.set(null, null);
map.set(1n, 1n);
map.set(2n, 2n);
map.set(0xffffffffffffffffn, 0xffffffffffffffffn);
map.set("Hello", "Hello");

let set = new Set();
set.add("Hey");
set.add(null);
set.add(1n);
set.add(2n);
set.add(0xffffffffffffffffn);
set.add("Hello");

for (let i = 0; i < 1e4; ++i) {
    shouldBe(testMap(map, 1n), true);
    shouldBe(testSet(set, 1n), true);
    shouldBe(testMap(map, 2n), true);
    shouldBe(testSet(set, 2n), true);
    shouldBe(testMap(map, 3n), false);
    shouldBe(testSet(set, 3n), false);
}
