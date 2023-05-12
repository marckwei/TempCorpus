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

let o = {
    [Symbol.toPrimitive]: function() {
        throw new Error("Calling @toPrimitive");
    }
}

try {
    o < Symbol(2);
    assert(true, false, "")
} catch(e) {
    assert(e.message, "Calling @toPrimitive", "Bad Exception when object is left operand");
}

try {
    Symbol(2) < o;
    assert(true, false, "")
} catch(e) {
    assert(e instanceof TypeError, true, "Bad Exception when Symbol is left operand");
}

o = {
    [Symbol.toPrimitive]: function() {
        return 2n;
    },

    toString: function() {
        throw new Error("Should never call toString");
    },

    valueOf: function() {
        throw new Error("Should never call valueOf");
    }
}

assert(o < 3n, true, "ToPrimitive(2n) < 3n");

o = {
    toString: function() {
        throw new Error("Should never call toString");
    },

    valueOf: function() {
        return 2n;
    }
}

assert(o < 3n, true, "valueOf(2n) < 3n");

