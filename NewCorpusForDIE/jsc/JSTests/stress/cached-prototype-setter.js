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

// [ARM] stress/cached-prototype-setter.js.no-llint fails intermittently on Aarch64 Linux
// https://bugs.webkit.org/show_bug.cgi?id=142277
//@ skip if $architecture == "arm64" and $hostOS == "linux"

(function() {
    var xSetterCalled = false;

    function MyConstructor()
    {
        this.x = 1;
    }
    
    new MyConstructor;
    new MyConstructor;
    function setter() {
        xSetterCalled = true;
    }
    Object.prototype.__defineSetter__("x", setter);
    new MyConstructor;

    if (!xSetterCalled)
        throw new Error("FAIL: 'x' setter was not called.");
})();

(function() {
    var xSetterCalled = false;

    function makeO()
    {
        var o = { };
        o.x = 1;
        return o;
    }

    makeO();
    makeO();
    function setter(x) {
        xSetterCalled = true;
    }
    Object.prototype.__defineSetter__("x", setter);
    makeO();

    if (!xSetterCalled)
        throw new Error("FAIL: 'x' setter was not called.");
})();
