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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

// 9.1.9.1 4-a
shouldThrow(function () {
    'use strict';
    var target = {};
    var handler = {};
    var proxy = new Proxy(target, handler);
    shouldBe(Reflect.defineProperty(target, 'cocoa', {
        writable: false,
        value: 42,
    }), true);
    proxy.cocoa = 'NG';
}, `TypeError: Attempted to assign to readonly property.`);

// 9.1.9.1 4-b
(function () {
    'use strict';
    var target = {};
    var handler = {};
    var proxy = new Proxy(target, handler);
    shouldBe(Reflect.defineProperty(target, 'cocoa', {
        writable: false,
        value: 42,
    }), true);
    shouldBe(Reflect.set(proxy, 'cocoa', 'NG', 'Cocoa'), false);
}());

// 9.1.9.1 4-d-i
shouldThrow(function () {
    'use strict';
    var target = {};
    var proxy = new Proxy(target, {
        get set()
        {
            shouldBe(Reflect.defineProperty(receiver, 'cocoa', {
                set() { }
            }), true);
            return undefined;
        }
    });
    var receiver = { __proto__: proxy };
    shouldBe(Reflect.defineProperty(target, 'cocoa', {
        writable: true,
        value: 42,
    }), true);
    receiver.cocoa = 'NG';
}, `TypeError: Attempted to assign to readonly property.`);

// 9.1.9.1 4-d-ii
shouldThrow(function () {
    'use strict';
    var target = {};
    var proxy = new Proxy(target, {
        get set()
        {
            shouldBe(Reflect.defineProperty(receiver, 'cocoa', {
                value: 'hello',
                writable: false
            }), true);
            return undefined;
        }
    });
    var receiver = { __proto__: proxy };
    shouldBe(Reflect.defineProperty(target, 'cocoa', {
        writable: true,
        value: 42,
    }), true);
    receiver.cocoa = 'NG';
}, `TypeError: Attempted to assign to readonly property.`);

// 9.1.9.1 7
shouldThrow(function () {
    'use strict';
    var target = {};
    var proxy = new Proxy(target, {});
    var receiver = { __proto__: proxy };
    shouldBe(Reflect.defineProperty(target, 'cocoa', {
        get() { }
    }), true);
    receiver.cocoa = 'NG';
}, `TypeError: Attempted to assign to readonly property.`);
