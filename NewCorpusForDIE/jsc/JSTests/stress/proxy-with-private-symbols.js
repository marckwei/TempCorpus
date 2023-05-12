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
        throw new Error("bad assertion");
}

// Currently, only "get", "getOwnPropertyDescriptor", and "set" are testable.

{
    let theTarget = [];
    let sawPrivateSymbolAsString = false;
    let handler = {
        get: function(target, propName, proxyArg) {
            if (typeof propName === "string")
                sawPrivateSymbolAsString = propName === "PrivateSymbol.arrayIterationKind";
            return target[propName];
        }
    };

    let proxy = new Proxy(theTarget, handler);
    for (let i = 0; i < 100; i++) {
        let threw = false;
        try {
            proxy[Symbol.iterator]().next.call(proxy);
        } catch(e) {
            // this will throw because we convert private symbols to strings.
            assert(e.message === "%ArrayIteratorPrototype%.next requires that |this| be an Array Iterator instance");
            threw = true;
        }
        assert(threw);
        assert(!sawPrivateSymbolAsString);
        sawPrivateSymbolAsString = false;
    }
}

{
    let theTarget = [];
    let sawPrivateSymbolAsString = false;
    let handler = {
        getOwnPropertyDescriptor: function(theTarget, propName) {
            if (typeof propName === "string")
                sawPrivateSymbolAsString = propName === "PrivateSymbol.arrayIterationKind";
            return target[propName];
        }
    };

    let proxy = new Proxy(theTarget, handler);
    for (let i = 0; i < 100; i++) {
        let threw = false;
        try {
            proxy[Symbol.iterator]().next.call(proxy);
        } catch(e) {
            // this will throw because we convert private symbols to strings.
            assert(e.message === "%ArrayIteratorPrototype%.next requires that |this| be an Array Iterator instance");
            threw = true;
        }
        assert(threw);
        assert(!sawPrivateSymbolAsString);
        sawPrivateSymbolAsString = false;
    }
}

{
    let theTarget = [1,2,3,4,5];
    let iterator = theTarget[Symbol.iterator]();
    let sawPrivateSymbolAsString = false;
    let handler = {
        set: function(theTarget, propName, value, receiver) {
            if (typeof propName === "string")
                sawPrivateSymbolAsString = propName === "PrivateSymbol.arrayIterationKind";
            return target[propName];
        }
    };

    let proxy = new Proxy(iterator, handler);
    for (let i = 0; i < 100; i++) {
        let threw = false;
        try {
            proxy.next();
        } catch(e) {
            // this will throw because we convert private symbols to strings.
            assert(e.message === "%ArrayIteratorPrototype%.next requires that |this| be an Array Iterator instance");
            threw = true;
        }
        assert(threw);
        assert(!sawPrivateSymbolAsString);
        sawPrivateSymbolAsString = false;
    }
}
