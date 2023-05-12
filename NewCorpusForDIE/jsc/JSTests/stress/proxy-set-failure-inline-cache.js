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

//@ $skipModes << :lockdown if ($buildType == "debug")
function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}!`);
}

function shouldThrow(fn, expectedError) {
    let errorThrown = false;
    try {
        fn();
    } catch (error) {
        errorThrown = true;
        if (error.toString() !== expectedError)
            throw new Error(`Bad error: ${error}`);
    }
    if (!errorThrown)
        throw new Error("Didn't throw!");
}



(function() {
    var setCalls = 0;
    var proxy = new Proxy({}, {
        set(target, propertyName, value, receiver) {
            "use strict";
            setCalls++;
            return value !== 1e7 - 10;
        }
    });

    for (var i = 0; i < 1e7; ++i)
        proxy.foo = i; // shouldn't throw

    shouldBe(setCalls, 1e7);
})();

shouldThrow(function() {
    "use strict";

    var proxy = new Proxy({}, {
        set(target, propertyName, value, receiver) {
            return value !== 1e7 - 10;
        }
    });

    for (var i = 0; i < 1e7; ++i)
        proxy.foo = i;
}, "TypeError: Proxy object's 'set' trap returned falsy value for property 'foo'");

(function() {
    var setCalls = 0;

    var target = {};
    var handler = { set() { "use strict"; setCalls++; return true; } };
    var proxy = new Proxy(target, handler);
    Object.defineProperty(target, "foo", { value: {}, writable: false, enumerable: true, configurable: true });

    for (var i = 0; i < 1e7; ++i) {
        if (i === 1e7 - 10)
            handler.set = undefined;
        proxy.foo = i; // shouldn't throw
    }

    shouldBe(setCalls, 1e7 - 10);
})();

shouldThrow(function() {
    "use strict";

    var target = {};
    var handler = { set: () => true };
    var proxy = new Proxy(target, handler);
    Object.defineProperty(target, "foo", { value: {}, writable: false, enumerable: true, configurable: true });

    for (var i = 0; i < 1e7; ++i) {
        if (i === 1e7 - 10)
            handler.set = null;
        proxy.foo = i;
    }
}, "TypeError: Attempted to assign to readonly property.");
