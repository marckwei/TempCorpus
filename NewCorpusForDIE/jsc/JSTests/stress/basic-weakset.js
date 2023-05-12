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
    var set = new WeakSet();
    var key1 = {};
    var key2 = {};
    var key3 = [];

    var res1 = set.has(key1);
    set.add(key1);
    var res2 = set.has(key1);

    shouldBe(res1, false);
    shouldBe(res2, true);

    var res3 = set.has(key2);
    set.add(key3);
    var res4 = set.has(key2);

    shouldBe(res3, false);
    shouldBe(res4, false);

    shouldBe(set.has(key3), true);

    set.delete(key3);
    shouldBe(set.has(key3), false);

    shouldBe(set.has(key1), true);
    set.delete(key1);
    shouldBe(set.has(key1), false);

    set.add(key1);
    shouldBe(set.has(key1), true);
}
noInline(test);

for (var i = 0; i < 1e4; ++i)
    test();
