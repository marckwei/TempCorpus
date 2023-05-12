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

var object = {
    a: 42,
    b: 44,
};
Object.defineProperty(object, "c", {
    value: 45,
    writable: true,
    enumerable: false,
    configurable: true,
});
var symbol = Symbol("d");
object[symbol] = 46;

for (var i = 0; i < 100; ++i)
    shouldBe(JSON.stringify(Object.keys(object)), `["a","b"]`)
for (var i = 0; i < 100; ++i)
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(object)), `["a","b","c"]`)
for (var i = 0; i < 100; ++i)
    shouldBe(Object.getOwnPropertySymbols(object)[0], symbol)
for (var i = 0; i < 100; ++i) {
    var keys = Reflect.ownKeys(object);
    shouldBe(keys.length, 4);
    shouldBe(keys[0], "a");
    shouldBe(keys[1], "b");
    shouldBe(keys[2], "c");
    shouldBe(keys[3], symbol);
}
Reflect.ownKeys(object);
Reflect.ownKeys(object);
shouldBe(JSON.stringify(Object.getOwnPropertyNames(object)), `["a","b","c"]`)
Reflect.ownKeys(object);
Reflect.ownKeys(object);
shouldBe(JSON.stringify(Object.keys(object)), `["a","b"]`)
