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

// This tests that we don't fast path intrinsics when they should not be fast pathed. Currently,
// that means that we don't inline length, byteLength, and byteOffset when they are called
// from a non-TypedArray.

(function body() {
    function foo(a) {
        return a.length + a.byteLength + a.byteOffset;
    }
    noInline(foo);

    let proto = { }

    let properties = ["length", "byteLength", "byteOffset"];
    properties.map(function(name) {
        let getter = Int32Array.prototype.__lookupGetter__(name);
        Object.defineProperty(proto, name, { get : getter });
    });

    function Bar() {
        return this;
    }

    Bar.prototype = proto;
    let bar = new Bar();

    let noThrow = false;
    for (let i = 0; i < 100000; i++) {
        try {
            foo(bar);
            noThrow = true
        } catch (e) {
        }
        if (noThrow)
            throw "broken";
    }
})();
