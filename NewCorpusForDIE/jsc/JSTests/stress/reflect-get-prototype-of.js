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

shouldBe(Reflect.getPrototypeOf.length, 1);

shouldThrow(() => {
    Reflect.getPrototypeOf("hello");
}, `TypeError: Reflect.getPrototypeOf requires the first argument be an object`);

var object = { hello: 42 };
shouldBe(Reflect.getPrototypeOf(object), Object.prototype);
shouldBe(Reflect.getPrototypeOf(Reflect.getPrototypeOf(object)), null);
var proto = [];
object.__proto__ = proto;
shouldBe(Reflect.getPrototypeOf(object), proto);

var array = [];
shouldBe(Reflect.getPrototypeOf(array), Array.prototype);
var proto = [];
array.__proto__ = Object.prototype;
shouldBe(Reflect.getPrototypeOf(array), Object.prototype);

class Base {
}

class Derived extends Base {
}

shouldBe(Reflect.getPrototypeOf(new Derived), Derived.prototype);
shouldBe(Reflect.getPrototypeOf(Reflect.getPrototypeOf(new Derived)), Base.prototype);
shouldBe(Reflect.getPrototypeOf(Reflect.getPrototypeOf(Reflect.getPrototypeOf(new Derived))), Object.prototype);
shouldBe(Reflect.getPrototypeOf(Reflect.getPrototypeOf(Reflect.getPrototypeOf(Reflect.getPrototypeOf(new Derived)))), null);

var object = Object.create(null);
shouldBe(Reflect.getPrototypeOf(object), null);
