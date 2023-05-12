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

shouldBe(Reflect.setPrototypeOf.length, 2);

shouldThrow(() => {
    Reflect.setPrototypeOf("hello");
}, `TypeError: Reflect.setPrototypeOf requires the first argument be an object`);

shouldThrow(() => {
    Reflect.setPrototypeOf(null);
}, `TypeError: Reflect.setPrototypeOf requires the first argument be an object`);

shouldThrow(() => {
    Reflect.setPrototypeOf({}, 30);
}, `TypeError: Reflect.setPrototypeOf requires the second argument be either an object or null`);

shouldThrow(() => {
    Reflect.setPrototypeOf({}, undefined);
}, `TypeError: Reflect.setPrototypeOf requires the second argument be either an object or null`);

var object = {};
var prototype = {};
shouldBe(Reflect.getPrototypeOf(object), Object.prototype);
shouldBe(Reflect.setPrototypeOf(object, prototype), true);
shouldBe(Reflect.getPrototypeOf(object), prototype);

var object = {};
shouldBe(Reflect.getPrototypeOf(object), Object.prototype);
shouldBe(Reflect.setPrototypeOf(object, null), true);
shouldBe(Reflect.getPrototypeOf(object), null);

var array = [];
var prototype = {};
shouldBe(Reflect.getPrototypeOf(array), Array.prototype);
shouldBe(Reflect.setPrototypeOf(array, prototype), true);
shouldBe(Reflect.getPrototypeOf(array), prototype);

var array = [];
shouldBe(Reflect.getPrototypeOf(array), Array.prototype);
shouldBe(Reflect.setPrototypeOf(array, null), true);
shouldBe(Reflect.getPrototypeOf(array), null);

var object = Object.create(null);
shouldBe(Reflect.getPrototypeOf(object), null);
shouldBe(Reflect.setPrototypeOf(object, Object.prototype), true);
shouldBe(Reflect.getPrototypeOf(object), Object.prototype);

// Extensible check.
var object = {};
shouldBe(Reflect.preventExtensions(object), true);
shouldBe(Reflect.setPrototypeOf(object, null), false);
shouldBe(Reflect.getPrototypeOf(object), Object.prototype);

// Cyclic check.
var prototype = {};
var object = { __proto__: prototype };
shouldBe(Reflect.setPrototypeOf(prototype, object), false);
shouldBe(Reflect.getPrototypeOf(prototype), Object.prototype);

