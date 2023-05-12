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

shouldBe(Reflect.hasOwnProperty("has"), true);
shouldBe(Reflect.has.length, 2);

shouldThrow(() => {
    Reflect.has("hello", 42);
}, `TypeError: Reflect.has requires the first argument be an object`);

var object = { hello: 42 };
shouldBe(Reflect.has(object, 'hello'), true);
shouldBe(Reflect.has(object, 'world'), false);
shouldBe(Reflect.has(object, 'prototype'), false);
shouldBe(Reflect.has(object, '__proto__'), true);
shouldBe(Reflect.has(object, 'hasOwnProperty'), true);
shouldBe(Reflect.deleteProperty(object, 'hello'), true);
shouldBe(Reflect.has(object, 'hello'), false);

shouldBe(Reflect.has([], 'length'), true);
shouldBe(Reflect.has([0,1,2], 0), true);
shouldBe(Reflect.has([0,1,2], 200), false);

var object = {
    [Symbol.iterator]: 42
};
shouldBe(Reflect.has(object, Symbol.iterator), true);
shouldBe(Reflect.has(object, Symbol.unscopables), false);
shouldBe(Reflect.deleteProperty(object, Symbol.iterator), true);
shouldBe(Reflect.has(object, Symbol.iterator), false);

var toPropertyKey = {
    toString() {
        throw new Error('toString called.');
    }
};

shouldThrow(() => {
    Reflect.has("hello", toPropertyKey);
}, `TypeError: Reflect.has requires the first argument be an object`);

shouldThrow(() => {
    Reflect.has({}, toPropertyKey);
}, `Error: toString called.`);

var toPropertyKey = {
    toString() {
        return 'ok';
    }
};
shouldBe(Reflect.has({ 'ok': 42 }, toPropertyKey), true);
