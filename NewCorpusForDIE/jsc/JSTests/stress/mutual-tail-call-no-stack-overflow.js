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

//@ defaultNoSamplingProfilerRun

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

function sloppyCountdown(n) {
    function even(n) {
        if (n == 0)
            return n;
        return odd(n - 1);
    }

    function odd(n) {
        if (n == 1)
            return n;
        return even(n - 1);
    }

    if (n % 2 === 0)
        return even(n);
    else
        return odd(n);
}

function strictCountdown(n) {
    "use strict";

    function even(n) {
        if (n == 0)
            return n;
        return odd(n - 1);
    }

    function odd(n) {
        if (n == 1)
            return n;
        return even(n - 1);
    }

    if (n % 2 === 0)
        return even(n);
    else
        return odd(n);
}

shouldThrow(function () { sloppyCountdown(100000); }, "RangeError: Maximum call stack size exceeded.");
strictCountdown(100000);

// Parity alterning
function odd(n) {
    "use strict";
    if (n > 0)
        return even(n, 0);
}

function even(n) {
    "use strict";
    return odd(n - 1);
}

odd(100000);
