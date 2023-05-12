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

(function regExpLastIndex() {
    var regexp = new RegExp('Cocoa');
    regexp.lastIndex = 'Hello';
    shouldBe(Reflect.get(regexp, 'lastIndex'), 'Hello');
    regexp.lastIndex = 42;
    shouldBe(Reflect.get(regexp, 'lastIndex'), 42);

    regexp.lastIndex = "Hello";
    shouldBe(Reflect.get(regexp, 'lastIndex'), 'Hello');

    shouldBe(Reflect.defineProperty(regexp, 'lastIndex', {
        value: 42,
        writable: false
    }), true);
    shouldBe(Reflect.get(regexp, 'lastIndex'), 42);
    shouldThrow(function () {
        'use strict';
        regexp.lastIndex = 'NG';
    }, `TypeError: Attempted to assign to readonly property.`);
    shouldBe(Reflect.get(regexp, 'lastIndex'), 42);

    shouldThrow(function () {
        'use strict';
        regexp.lastIndex = "NG";
    }, `TypeError: Attempted to assign to readonly property.`);

    shouldThrow(function () {
        'use strict';
        Object.defineProperty(regexp, 'lastIndex', {
            value: 'NG'
        });
    }, `TypeError: Attempting to change value of a readonly property.`);
    shouldBe(Reflect.get(regexp, 'lastIndex'), 42);
}());
