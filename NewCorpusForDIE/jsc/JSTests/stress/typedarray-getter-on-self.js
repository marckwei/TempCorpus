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

// This tests that intrinsics that are attached to self of an object correctly abort
// when the self value is changed.

(function body() {
    function foo(a) {
        return a.length;
    }
    noInline(foo);

    function bar(a) {
        return a.byteLength;
    }
    noInline(bar);

    function baz(a) {
        return a.byteOffset;
    }
    noInline(baz);

    let array = new Int32Array(10);

    let properties = ["length", "byteLength", "byteOffset"];
    properties.map(function(name) {
        let getter = Int32Array.prototype.__lookupGetter__(name);
        Object.defineProperty(array, name, { get: getter, configurable: true });
    });

    for (let i = 0; i < 100000; i++)
        foo(array);

    properties.map(function(name) {
        Object.defineProperty(array, name, { value: null });
    });

    if (foo(array) !== null)
        throw "length should have been null";

    if (bar(array) !== null)
        throw "byteLength should have been null";

    if (baz(array) !== null)
        throw "byteOffset should have been null";
})();
