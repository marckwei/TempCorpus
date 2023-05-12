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

function assert(v, e, m) {
    if (v !== e)
        throw new Error(m);
}

assert(Object(2n) < 1n, false, "Object(2n) < 1n");
assert(1n < Object(2n), true, "1n < Object(2n)");
assert(Object(2n) < Object(1n), false, "Object(2n) < Object(1n)");
assert(Object(1n) < Object(2n), true, "Object(1n) < Object(2n)");

let o = {
    [Symbol.toPrimitive]: function() {
        return 2n;
    }
}

let o2 = {
    [Symbol.toPrimitive]: function() {
        return 1n;
    }
}

assert(o < 1n, false, "ToPrimitive(2n) < 1n");
assert(1n < o, true, "1n < ToPrimitive(2n)");
assert(o < o2, false, "ToPrimitive(2n) < ToPrimitive(1n)");
assert(o2 < o, true, "ToPrimitive(1n) < ToPrimitive(2n)");

o = {
    valueOf: function() {
        return 2n;
    }
}

o2 = {
    valueOf: function() {
        return 1n;
    }
}

assert(o < 1n, false, "ToPrimitive(2n) < 1n");
assert(1n < o, true, "1n < ToPrimitive(2n)");
assert(o < o2, false, "ToPrimitive(2n) < ToPrimitive(1n)");
assert(o2 < o, true, "ToPrimitive(1n) < ToPrimitive(2n)");

o = {
    toString: function() {
        return 2n;
    }
}

o2 = {
    toString: function() {
        return 1n;
    }
}

assert(o < 1n, false, "ToPrimitive(2n) < 1n");
assert(1n < o, true, "1n < ToPrimitive(2n)");
assert(o < o2, false, "ToPrimitive(2n) < ToPrimitive(1n)");
assert(o2 < o, true, "ToPrimitive(1n) < ToPrimitive(2n)");

