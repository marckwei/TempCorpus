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

// Reduced and tweaked code from const-semantics.js to reproduce https://bugs.webkit.org/show_bug.cgi?id=190693 easily.
"use strict";
function truth() {
    return true;
}
noInline(truth);

function assert(cond) {
    if (!cond)
        throw new Error("broke assertion");
}
noInline(assert);
function shouldThrowInvalidConstAssignment(f) {
    var threw = false;
    try {
        f();
    } catch(e) {
        if (e.name.indexOf("TypeError") !== -1 && e.message.indexOf("readonly") !== -1)
            threw = true;
    }
    assert(threw);
}
noInline(shouldThrowInvalidConstAssignment);


// ========== tests below ===========

const NUM_LOOPS = 6000;

;(function() {
    function taz() {
        const x = 20;
        shouldThrowInvalidConstAssignment(function() { x = 20; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x += 20; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x -= 20; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x *= 20; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x /= 20; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x >>= 20; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x <<= 20; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x ^= 20; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x++; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { x--; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { ++x; });
        assert(x === 20);
        shouldThrowInvalidConstAssignment(function() { --x; });
        assert(x === 20);
    }
    for (var i = 0; i < NUM_LOOPS; i++) {
        taz();
    }
})();

for(var i = 0; i < 1e6; ++i);
