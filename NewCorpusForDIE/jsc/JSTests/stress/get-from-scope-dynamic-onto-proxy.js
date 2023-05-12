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
        throw new Error(`bad value: ${String(actual)}`);
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

// LLInt slow path operation.
shouldThrow(function () {
    var target = {};
    var handler = {
        has: function (receiver, name)
        {
            return name === 'i';
        },
        get: function (target, name, receiver)
        {
            if (name === 'i')
                throw new Error("NG");
            return 42;
        }
    };
    var proxy = new Proxy(target, handler);
    with (proxy) {
        i;
    }
}, `Error: NG`);

// Baseline JIT operation.
shouldThrow(function () {
    var flag = false;
    var target = {};
    var handler = {
        has: function (receiver, name)
        {
            return name === 'i';
        },
        get: function (target, name, receiver)
        {
            if (name === 'i' && flag)
                throw new Error("NG");
            return 42;
        }
    };
    var proxy = new Proxy(target, handler);
    for (var i = 0; i < 1e4; ++i) {
        with (proxy) {
            i;
        }
        if (i === 1e3)
            flag = true;
    }
}, `Error: NG`);

// DFG JIT operation.
var thrown = null;
try {
    (() => {
        var flag = false;
        var target = {
            __proto__: null
        };
        var handler = {
            has: function (receiver, name)
            {
                return name === 'arguments';
            },

            get: function (target, name, receiver)
            {
                if (name === 'arguments' && flag)
                    throw new Error("NG");
                return 42;
            }
        };
        var proxy = new Proxy(target, handler);
        proxy.__proto__ = null;
        Object.prototype.__proto__ = {
            __proto__: proxy,
        };
        (() => {
            for (var i = 0; i < 1e4; ++i) {
                arguments;
                if (i === (1e4 - 2))
                    flag = true;
            }
        })();
    })();
} catch (e) {
    thrown = e;
}
Object.prototype.__proto__ = null;
shouldBe(String(thrown), `TypeError: Cannot set prototype of immutable prototype object`);
