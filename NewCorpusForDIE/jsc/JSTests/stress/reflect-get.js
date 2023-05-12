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

shouldBe(Reflect.get.length, 2);

shouldThrow(() => {
    Reflect.get("hello");
}, `TypeError: Reflect.get requires the first argument be an object`);

var object = { hello: 42 };
shouldBe(Reflect.get(object, 'hello'), 42);
shouldBe(Reflect.get(object, 'world'), undefined);
var proto = [];
object.__proto__ = proto;
shouldBe(Reflect.get(object, 'length'), 0);

var array = [ 0, 1, 2 ];
shouldBe(Reflect.get(array, 0), 0);
var proto = [ 0, 1, 2, 5, 6 ];
array.__proto__ = proto;
shouldBe(Reflect.get(array, 3), 5);
array.__proto__ = Object.prototype;
shouldBe(Reflect.get(array, 3), undefined);

var object = {
    value: 42,
    world: 200,
    get hello()
    {
        return this.value;
    }
};
shouldBe(Reflect.get(object, 'hello'), 42);
shouldBe(Reflect.get(object, 'hello', { value: 200 }), 200);
shouldBe(Reflect.get(object, 'hello', "OK"), undefined);
shouldBe(Reflect.get(object, 'world'), 200);
shouldBe(Reflect.get(object, 'world', { value: 200 }), 200);
shouldBe(Reflect.get(object, 'world', "OK"), 200);
var value = 400;
shouldBe(Reflect.get(object, 'hello', null), 400);
shouldBe(Reflect.get(object, 'hello', undefined), 400);

var object = {
    value: 42,
    world: 200,
    get hello()
    {
        "use strict";
        return this.value;
    }
};
shouldBe(Reflect.get(object, 'hello'), 42);
shouldBe(Reflect.get(object, 'hello', { value: 200 }), 200);
shouldBe(Reflect.get(object, 'hello', "OK"), undefined);
shouldBe(Reflect.get(object, 'world'), 200);
shouldBe(Reflect.get(object, 'world', { value: 200 }), 200);
shouldBe(Reflect.get(object, 'world', "OK"), 200);

shouldThrow(() => {
    Reflect.get(object, 'hello', null);
}, `TypeError: null is not an object (evaluating 'this.value')`);

shouldThrow(() => {
    Reflect.get(object, 'hello', undefined);
}, `TypeError: undefined is not an object (evaluating 'this.value')`);

var object = {
    value: 42,
    world: 200,
    set hello(value)
    {
    }
};
shouldBe(Reflect.get(object, 'hello'), undefined);
shouldBe(Reflect.get(object, 'hello', { hello: 42 }), undefined);
shouldBe(Reflect.get(object, 'ok', { ok: 42 }), undefined);
