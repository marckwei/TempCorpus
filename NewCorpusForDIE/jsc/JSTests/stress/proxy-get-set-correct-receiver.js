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

"use strict";

function assert(b) {
    if (!b)
        throw new Error("Bad")
}

function test(f, count = 1000) {
    noInline(f);
    for (let i = 0; i < count; ++i)
        f();
}

test(function() {
    let called = false;
    let target = {
        set prop(x)
        {
            assert(x === 20);
            called = true;
            assert(this === proxy)
        }
    }

    let proxy = new Proxy(target, {})
    proxy.prop = 20;
    assert(called);
});

test(function() {
    let called = false;
    let target = {
        get prop()
        {
            called = true;
            assert(this === proxy)
        }
    }

    let proxy = new Proxy(target, {})
    proxy.prop
    assert(called);
});

test(function() {
    let target = {
        get prop()
        {
            called = true;
            assert(this === proxy)
        }
    }
    let p1 = new Proxy(target, {});

    let called = false;
    let proxy = new Proxy(p1, {});
    proxy.prop
    assert(called);
});

test(function() {
    let t = {};
    let p1 = new Proxy(t, {
        get(target, prop, receiver) {
            called = true;
            assert(target === t);
            assert(receiver === proxy);
            assert(prop === "prop");
        }
    });

    let called = false;
    let proxy = new Proxy(p1, {});
    proxy.prop
    assert(called);
});

test(function() {
    let t = {};
    let callCount = 0;
    let handler = {
        get(target, prop, receiver) {
            if (callCount === 100)
                assert(target === t);
            ++callCount;
            assert(receiver === proxy);
            assert(prop === "prop");
            return Reflect.get(target, prop, receiver);
        }
    };
    let proxy = new Proxy(t, handler);
    for (let i = 0; i < 100; ++i)
        proxy = new Proxy(proxy, handler);
    proxy.prop
    assert(callCount === 101);
}, 10);

test(function() {
    let t = {};
    let callCount = 0;
    let handler = {
        set(target, prop, value, receiver) {
            if (callCount === 100)
                assert(target === t);
            ++callCount;
            assert(receiver === proxy);
            assert(prop === "prop");
            assert(value === 20);
            return Reflect.set(target, prop, value, receiver);
        }
    };
    let proxy = new Proxy(t, handler);
    for (let i = 0; i < 100; ++i)
        proxy = new Proxy(proxy, handler);
    proxy.prop = 20;
    assert(callCount === 101);
}, 10);
