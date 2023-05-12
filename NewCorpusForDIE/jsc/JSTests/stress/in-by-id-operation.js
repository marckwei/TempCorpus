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

for (var i = 0; i < 1e6; ++i) {
    shouldBe(test({
        hello: 42
    }), true);
    shouldBe(test({
        hello: undefined,
        world: 44
    }), true);
    shouldBe(test({
        helloworld: 43,
        ok: 44
    }), false);
}

function selfCache(object)
{
    return "hello" in object;
}
noInline(selfCache);

var object = {};
object.hello = 42;
for (var i = 0; i < 1e6; ++i)
    shouldBe(selfCache(object), true);
object.world = 43;
shouldBe(selfCache(object), true);
object.world = 43;
shouldBe(selfCache({ __proto__: object }), true);
delete object.hello;
shouldBe(selfCache(object), false);
shouldBe(selfCache({ __proto__: object }), false);
