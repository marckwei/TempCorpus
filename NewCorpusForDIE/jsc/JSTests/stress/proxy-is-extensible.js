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
    let target = {};
    let error = null;
    let handler = {
        get isExtensible() {
            error = new Error;
            throw error;
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            Reflect.isExtensible(proxy);
        } catch(e) {
            assert(e === error);
            threw = true;
        }
        assert(threw);
    }
}

{
    let target = {};
    let error = null;
    let handler = {
        isExtensible: function() {
            error = new Error;
            throw error;
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            Reflect.isExtensible(proxy);
        } catch(e) {
            assert(e === error);
            threw = true;
        }
        assert(threw);
    }
}

{
    let error = null;
    let target = new Proxy({}, {
        isExtensible: function() {
            error = new Error;
            throw error;
        }
    });
    let handler = {
        isExtensible: function(theTarget) {
            return Reflect.isExtensible(theTarget);
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            Reflect.isExtensible(proxy);
        } catch(e) {
            assert(e === error);
            threw = true;
        }
        assert(threw);
    }
}

{
    let target = {};
    let handler = {
        isExtensible: function(theTarget) {
            return false;
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            Reflect.isExtensible(proxy);
        } catch(e) {
            assert(e.toString() === "TypeError: Proxy object's 'isExtensible' trap returned false when the target is extensible. It should have returned true");
            threw = true;
        }
        assert(threw);
    }
}

{
    let target = {};
    Reflect.preventExtensions(target);
    let handler = {
        isExtensible: function(theTarget) {
            return true;
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            Reflect.isExtensible(proxy);
        } catch(e) {
            assert(e.toString() === "TypeError: Proxy object's 'isExtensible' trap returned true when the target is non-extensible. It should have returned false");
            threw = true;
        }
        assert(threw);
    }
}

{
    let target = {};
    Object.freeze(target);
    let handler = {
        isExtensible: function(theTarget) {
            return true;
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            Reflect.isExtensible(proxy);
        } catch(e) {
            assert(e.toString() === "TypeError: Proxy object's 'isExtensible' trap returned true when the target is non-extensible. It should have returned false");
            threw = true;
        }
        assert(threw);
    }
}

{
    let target = {};
    Object.seal(target);
    let handler = {
        isExtensible: function(theTarget) {
            return true;
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            Reflect.isExtensible(proxy);
        } catch(e) {
            assert(e.toString() === "TypeError: Proxy object's 'isExtensible' trap returned true when the target is non-extensible. It should have returned false");
            threw = true;
        }
        assert(threw);
    }
}

{
    let target = {};
    Object.preventExtensions(target);
    let handler = {
        isExtensible: function(theTarget) {
            return true;
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        try {
            Reflect.isExtensible(proxy);
        } catch(e) {
            assert(e.toString() === "TypeError: Proxy object's 'isExtensible' trap returned true when the target is non-extensible. It should have returned false");
            threw = true;
        }
        assert(threw);
    }
}

{
    let target = {};
    let called = false;
    let handler = {
        isExtensible: function(theTarget) {
            called = true;
            return true;
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        let result = Reflect.isExtensible(proxy);
        assert(result);
        assert(called);
        called = false;
    }
}

{
    let target = {};
    let called = false;
    Reflect.preventExtensions(target);
    let handler = {
        isExtensible: function(theTarget) {
            assert(theTarget === target);
            called = true;
            return Reflect.isExtensible(theTarget);
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        let result = Object.isExtensible(proxy);
        assert(!result);
        assert(called);
        called = false;
        
        result = Object.isFrozen(proxy);
        assert(result);
        assert(called);
        called = false;

        result = Object.isSealed(proxy);
        assert(result);
        assert(called);
        called = false;
    }
}

{
    let target = {};
    let called = false;
    Object.freeze(target);
    let handler = {
        isExtensible: function(theTarget) {
            assert(theTarget === target);
            called = true;
            return Reflect.isExtensible(theTarget);
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        let result = Object.isExtensible(proxy);
        assert(!result);
        assert(called);
        called = false;
        
        result = Object.isFrozen(proxy);
        assert(result);
        assert(called);
        called = false;

        result = Object.isSealed(proxy);
        assert(result);
        assert(called);
        called = false;
    }
}

{
    let target = {};
    let called = false;
    Object.seal(target);
    let handler = {
        isExtensible: function(theTarget) {
            assert(theTarget === target);
            called = true;
            return Reflect.isExtensible(theTarget);
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        let result = Object.isExtensible(proxy);
        assert(!result);
        assert(called);
        called = false;
        
        result = Object.isFrozen(proxy);
        assert(result);
        assert(called);
        called = false;

        result = Object.isSealed(proxy);
        assert(result);
        assert(called);
        called = false;
    }
}

{
    let target = {};
    Object.defineProperty(target, "x", {
        writable: true,
        configurable: true,
        value: 45,
        enumerable: true
    });
    let called = false;
    Reflect.preventExtensions(target);
    let handler = {
        isExtensible: function(theTarget) {
            assert(theTarget === target);
            called = true;
            return Reflect.isExtensible(theTarget);
        }
    };
    
    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let threw = false;
        let result = Object.isExtensible(proxy);
        assert(!result);
        assert(called);
        called = false;
        
        result = Object.isFrozen(proxy);
        assert(!result);
        assert(called);
        called = false;

        result = Object.isSealed(proxy);
        assert(!result);
        assert(called);
        called = false;
    }
}
