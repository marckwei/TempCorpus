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

function test(object)
{
    return "hello" in object;
}
noInline(test);

var count = 0;
var target = null;
var key = null;
var handler = {
    has(targetArg, keyArg) {
        ++count;
        target = targetArg;
        key = keyArg;
        return keyArg in targetArg;
    }
};
var targetObject = {};
var proxy = new Proxy(targetObject, handler);
for (var i = 0; i < 1e4; ++i) {
    shouldBe(count, i);
    shouldBe(test(proxy), false);
    shouldBe(target, targetObject);
    shouldBe(key, "hello");
}
targetObject.hello = 42;
for (var i = 0; i < 1e4; ++i) {
    shouldBe(count, i + 1e4);
    shouldBe(test(proxy), true);
    shouldBe(target, targetObject);
    shouldBe(key, "hello");
}
delete targetObject.hello;
for (var i = 0; i < 1e4; ++i) {
    shouldBe(count, i + 2e4);
    shouldBe(test(proxy), false);
    shouldBe(target, targetObject);
    shouldBe(key, "hello");
}
