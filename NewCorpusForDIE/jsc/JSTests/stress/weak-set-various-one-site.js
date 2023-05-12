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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function hasTest(set, key)
{
    return set.has(key);
}
noInline(hasTest);

function addTest(set, key)
{
    return set.add(key);
}
noInline(addTest);

function deleteTest(set, key)
{
    return set.delete(key);
}
noInline(deleteTest);

var s1 = Symbol("A");
var s2 = Symbol("B");
var s3 = Symbol("C");
var o1 = {};
var o2 = {};
var o3 = {};

function test() {
    var set = new WeakSet();
    shouldBe(hasTest(set, s1), false);
    shouldBe(hasTest(set, s2), false);
    shouldBe(hasTest(set, s3), false);
    shouldBe(hasTest(set, o1), false);
    shouldBe(hasTest(set, o2), false);
    shouldBe(hasTest(set, o3), false);

    shouldBe(addTest(set, s1), set);
    shouldBe(addTest(set, s2), set);
    shouldBe(addTest(set, o1), set);
    shouldBe(addTest(set, o2), set);

    shouldBe(hasTest(set, s1), true);
    shouldBe(hasTest(set, s2), true);
    shouldBe(hasTest(set, s3), false);
    shouldBe(hasTest(set, o1), true);
    shouldBe(hasTest(set, o2), true);
    shouldBe(hasTest(set, o3), false);

    shouldBe(deleteTest(set, s1), true);
    shouldBe(hasTest(set, s1), false);

    shouldBe(deleteTest(set, o1), true);
    shouldBe(hasTest(set, o1), false);
}
noInline(test);

for (var i = 0; i < 1e4; ++i)
    test();

{
    var set = new WeakSet();
    shouldBe(hasTest(set, "hey"), false);
    shouldBe(deleteTest(set, "hey"), false);
    shouldThrow(() => {
        addTest(set, "hey");
    }, `TypeError: WeakSet values must be objects or non-registered symbols`);

    shouldBe(hasTest(set, 42), false);
    shouldBe(deleteTest(set, 42), false);
    shouldThrow(() => {
        addTest(set, 42);
    }, `TypeError: WeakSet values must be objects or non-registered symbols`);
}
