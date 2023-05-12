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

function shouldThrow(func, message) {
    var error = null;
    try {
        func();
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("not thrown.");
    if (String(error) !== message)
        throw new Error("bad error: " + String(error));
}

function shouldBeArray(actual, expected) {
    shouldBe(actual.length, expected.length);
    for (var i = 0; i < expected.length; ++i) {
        try {
            shouldBe(actual[i], expected[i]);
        } catch(e) {
            print(JSON.stringify(actual));
            throw e;
        }
    }
}

shouldBe(Reflect.ownKeys.length, 1);

shouldThrow(() => {
    Reflect.ownKeys("hello");
}, `TypeError: Reflect.ownKeys requires the first argument be an object`);

var cocoa = Symbol("Cocoa");
var cappuccino = Symbol("Cappuccino");

shouldBeArray(Reflect.ownKeys({}), []);
shouldBeArray(Reflect.ownKeys({42:42}), ['42']);
shouldBeArray(Reflect.ownKeys({0:0,1:1,2:2}), ['0','1','2']);
shouldBeArray(Reflect.ownKeys({0:0,1:1,2:2,hello:42}), ['0','1','2','hello']);
shouldBeArray(Reflect.ownKeys({hello:42,0:0,1:1,2:2,world:42}), ['0','1','2','hello','world']);
shouldBeArray(Reflect.ownKeys({[cocoa]:42,hello:42,0:0,1:1,2:2,world:42}), ['0','1','2','hello','world', cocoa]);
shouldBeArray(Reflect.ownKeys({[cocoa]:42,hello:42,0:0,1:1,2:2,[cappuccino]:42,world:42}), ['0','1','2','hello','world', cocoa, cappuccino]);
