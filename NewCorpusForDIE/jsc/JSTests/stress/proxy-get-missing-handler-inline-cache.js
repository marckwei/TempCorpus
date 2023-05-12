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

const callableGetTrapError = "TypeError: 'get' property of a Proxy's handler should be callable";

shouldThrow(() => {
    var handler = {get: null};
    var proxy = new Proxy({foo: 1}, handler);

    for (var i = 0; i < 1e7; ++i) {
        var foo = proxy.foo;
        if (i === 1e7 / 2)
            handler.get = 1;
    }
}, callableGetTrapError);

shouldThrow(() => {
    var handler = {get: undefined};
    var proxy = new Proxy({foo: 1}, handler);

    for (var i = 0; i < 1e7; ++i) {
        var bar = proxy.bar;
        if (i === 1e7 / 2)
            handler.get = "foo";
    }
}, callableGetTrapError);

shouldThrow(() => {
    var handler = {get: null};
    var proxy = new Proxy({foo: 1}, handler);

    for (var i = 0; i < 1e7; ++i) {
        var foo = proxy.foo;
        if (i === 1e7 / 2)
            handler.get = {};
    }
}, callableGetTrapError);

shouldThrow(() => {
    var handler = {get: undefined};
    var proxy = new Proxy(() => {}, handler);

    for (var i = 0; i < 1e7; ++i) {
        var bar = proxy.bar;
        if (i === 1e7 / 2)
            handler.get = [];
    }
}, callableGetTrapError);

