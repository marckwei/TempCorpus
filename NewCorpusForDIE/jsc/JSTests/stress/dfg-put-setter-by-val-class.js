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

function testAttribute(object, name, type) {
    shouldBe(Reflect.has(object, name), true);
    let desc = Reflect.getOwnPropertyDescriptor(object, name);
    shouldBe(desc.configurable, true);
    shouldBe(desc.enumerable, false);
    if (type === 'get') {
        shouldBe(typeof desc.get, 'function');
        shouldBe(typeof desc.set, 'undefined');
    } else if (type === 'set') {
        shouldBe(typeof desc.get, 'undefined');
        shouldBe(typeof desc.set, 'function');
    } else {
        shouldBe(typeof desc.get, 'function');
        shouldBe(typeof desc.set, 'function');
    }
}
noInline(testAttribute);

function setter(name)
{
    class Cocoa {
        constructor() {
            this.ok = 0;
        }
        set [name](value) {
            this.ok = value;
        }
    }

    let object = new Cocoa();
    testAttribute(object.__proto__, 'hello', 'set');
    object.hello = 42;
    return object.ok;

}
noInline(setter);

for (var i = 0; i < 10000; ++i)
    shouldBe(setter('hello'), 42);
