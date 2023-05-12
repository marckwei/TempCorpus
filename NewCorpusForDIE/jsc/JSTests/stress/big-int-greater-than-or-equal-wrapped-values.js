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

assert(Object(2n) >= 1n, true, "Object(2n) >= 1n");
assert(1n >= Object(2n), false, "1n >= Object(2n)");
assert(Object(2n) >= Object(1n), true, "Object(2n) >= Object(1n)");
assert(Object(1n) >= Object(2n), false, "Object(1n) >= Object(2n)");

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

assert(o >= 1n, true, "ToPrimitive(2n) >= 1n");
assert(1n >= o, false, "1n >= ToPrimitive(2n)");
assert(o >= o2, true, "ToPrimitive(2n) >= ToPrimitive(1n)");
assert(o2 >= o, false, "ToPrimitive(1n) >= ToPrimitive(2n)");

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

assert(o >= 1n, true, "valueOf(2n) >= 1n");
assert(1n >= o, false, "1n >= valueOf(2n)");
assert(o >= o2, true, "valueOf(2n) >= valueOf(1n)");
assert(o2 >= o, false, "valueOf(1n) >= valueOf(2n)");

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

assert(o >= 1n, true, "toString(2n) >= 1n");
assert(1n >= o, false, "1n >= ToPrimitive(2n)");
assert(o >= o2, true, "toString(2n) < toString(1n)");
assert(o2 >= o, false, "toString(1n) < toString(2n)");

