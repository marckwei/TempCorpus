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

// This tests that TypedArray length and byteLength correctly dump code when the prototypes move.

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

    let array = new Int32Array(15);

    for (let i = 0; i < 5000; ++i) {
        foo(array);
        bar(array);
        baz(array);
    }

    Object.setPrototypeOf(array, null);

    let passed = false;

    if (foo(array) !== undefined)
        throw "length should have become undefined when the prototype changed";
    if (bar(array) !== undefined)
        throw "byteLength should have become undefined when the prototype changed";
    if (baz(array) !== undefined)
        throw "byteOffset should have become undefined when the prototype changed";


})();
