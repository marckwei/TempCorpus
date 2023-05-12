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

let theTarget = {};
Object.defineProperty(theTarget, "x", {
    writable: false,
    configurable: false,
    value: 45
});

Object.defineProperty(theTarget, "y", {
    writable: false,
    configurable: false,
    value: 45
});

Object.defineProperty(theTarget, "getter", {
    configurable: false,
    set: function(x) { }
});

Object.defineProperty(theTarget, "badGetter", {
    configurable: false,
    set: function(x) { }
});

let handler = {
    get: function(target, propName, proxyArg) {
        assert(target === theTarget);
        assert(proxyArg === proxy);
        if (propName === "x")
            return 45;
        else if (propName === "y")
            return 30;
        else if (propName === "getter")
            return undefined;
        else {
            assert(propName === "badGetter");
            return 25;
        }
    }
};

let proxy = new Proxy(theTarget, handler);

for (let i = 0; i < 1000; i++) {
    assert(proxy.x === 45);
    assert(proxy["x"] === 45);
}

for (let i = 0; i < 1000; i++) {
    try {
        if (i % 2)
            proxy.y;
        else
            proxy["y"];
    } catch(e) {
        threw = true;
        assert(e.toString() === "TypeError: Proxy handler's 'get' result of a non-configurable and non-writable property should be the same value as the target's property");
    }
    assert(threw === true);
}

for (let i = 0; i < 1000; i++) {
    assert(proxy.getter === undefined);
    assert(proxy["getter"] === undefined);
}

for (let i = 0; i < 1000; i++) {
    try {
        if (i % 2)
            proxy.badGetter;
        else
            proxy["badGetter"];

    } catch(e) {
        threw = true;
        assert(e.toString() === "TypeError: Proxy handler's 'get' result of a non-configurable accessor property without a getter should be undefined");
    }
    assert(threw === true);
}
