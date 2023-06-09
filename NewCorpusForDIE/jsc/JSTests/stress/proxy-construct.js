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

function assert(b) {
    if (!b)
        throw new Error("Bad assertion");
}

{
    let target = function() { }
    let handler = {
        construct: 45
    };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            new proxy;
        } catch(e) {
            threw = true;
            assert(e.toString() === "TypeError: 'construct' property of a Proxy's handler should be callable");
        }
        assert(threw);
    }
}

{
    let target = function() { }
    let handler = {
        construct: "hello"
    };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            new proxy;
        } catch(e) {
            threw = true;
            assert(e.toString() === "TypeError: 'construct' property of a Proxy's handler should be callable");
        }
        assert(threw);
    }
}

{
    let target = function() { }
    let error = null;
    let handler = {
        get construct() {
            error = new Error;
            throw error;
        }
    };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            new proxy;
        } catch(e) {
            threw = true;
            assert(e === error);
        }
        assert(threw);
        error = null;
    }
}

{
    let target = function() { }
    let error = null;
    let handler = {
        construct: function() {
            error = new Error;
            throw error;
        }
    };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            new proxy;
        } catch(e) {
            threw = true;
            assert(e === error);
        }
        assert(threw);
        error = null;
    }
}

{
    let error = null;
    let target = function() {
        assert(new.target === proxy);
        error = new Error;
        throw error;
    };
    let handler = { };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            new proxy;
        } catch(e) {
            assert(e === error);
            error = null;
            threw = true;
        }
        assert(threw);
    }
}

{
    let target = function() { }
    let handler = {
        construct: function() {
            return 25;
        }
    };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            new proxy;
        } catch(e) {
            threw = true;
            assert(e.toString() === "TypeError: Result from Proxy handler's 'construct' method should be an object");
        }
        assert(threw);
    }
}

{
    let target = function() { }
    let handler = {
        construct: function() {
            return "hello";
        }
    };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            new proxy;
        } catch(e) {
            threw = true;
            assert(e.toString() === "TypeError: Result from Proxy handler's 'construct' method should be an object");
        }
        assert(threw);
    }
}

{
    let target = function() { }
    let handler = {
        construct: function() {
            return Symbol();
        }
    };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            new proxy;
        } catch(e) {
            threw = true;
            assert(e.toString() === "TypeError: Result from Proxy handler's 'construct' method should be an object");
        }
        assert(threw);
    }
}

{
    let a = {};
    let b = {};
    let retValue = null;
    let target = function() {
        return retValue;
    };
    let error = null;
    let handler = {
        construct: function(theTarget, argArray, newTarget) {
            assert(theTarget === target);
            assert(newTarget === proxy);
            return new theTarget(...argArray);
        }
    };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        retValue = i % 2 ? a : b;
        assert(new proxy === retValue);
    }
}

{
    let a = {};
    let b = {};
    let target = function() {
        assert(new.target === proxy);
        return a;
    };
    let error = null;
    let construct = function(theTarget, argArray, newTarget) {
        assert(theTarget === target);
        assert(newTarget === proxy);
        return b;
    };
    let handler = { };
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        if (i % 2)
            handler.construct = construct;
        else
            handler.construct = null;
        let result = new proxy;
        if (i % 2)
            assert(result === b)
        else
            assert(result === a);
    }
}

{
    let target = function(...args) {
        assert(new.target === target);
        assert(args[0] === 0);
        assert(args[1] === 1);
        assert(args[2] === "foo");
    };
    let error = null;
    let construct = function(theTarget, argArray, newTarget) {
        assert(theTarget === target);
        assert(newTarget === proxy);
        return new target(...argArray);
    };
    let handler = { };
    handler.construct = construct;
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        new proxy(0, 1, "foo");
    }
}

{
    let obj = null;
    let target = function(...args) {
        assert(new.target === target);
        assert(args[0] === 0);
        assert(obj);
        assert(args[1] === obj);
        assert(args[2] === "foo");
    };
    let error = null;
    let construct = function(theTarget, argArray, newTarget) {
        assert(theTarget === target);
        assert(newTarget === proxy);
        return new target(...argArray);
    };
    let handler = { };
    handler.construct = construct;
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        obj = {};
        new proxy(0, obj, "foo");
    }
}
