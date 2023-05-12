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

assert = {
    sameValue: function (input, expected, message) {
        if (input !== expected)
            throw new Error(message);
    }
};

function testBitNot(x, z, message) {
    assert.sameValue(~x, z, message);
}

testBitNot(Object(1n), -2n, "ToPrimitive: unbox object with internal slot");

let o = {
    [Symbol.toPrimitive]: function() {
        return 1n;
    }
};
testBitNot(o, -2n, "ToPrimitive: @@toPrimitive");

o = {
    valueOf: function() {
        return 1n;
    }
};
testBitNot(o, -2n, "ToPrimitive: valueOf");

o = {
    toString: function() {
        return 1n;
    }
}
testBitNot(o, -2n, "ToPrimitive: toString");

// Test priority

function badAssertion() {
    throw new Error("This should never be called");
}

o = {
    [Symbol.toPrimitive]: function() {
        return 1n;
    },
    valueOf: badAssertion,
    toString: badAssertion
};
testBitNot(o, -2n, "ToPrimitive: @@toPrimitive and others throw");

o = {
    valueOf: function() {
        return 1n;
    },
    toString: badAssertion
};
testBitNot(o, -2n, "ToPrimitive: valueOf and toString throws");

