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

// Original tests from https://github.com/tc39/test262/blob/master/test/language/expressions/unary-minus/bigint.js

function assert(a, b, message) {
    if (a !== b)
        throw new Error(message);
}

function assertNotEqual(a, b, message) {
    if (a === b)
        throw new Error(message);
}

assert(-0n, 0n, "-0n === 0n");
assert(-(0n), 0n, "-(0n) === 0n");
assertNotEqual(-1n, 1n, "-1n !== 1n");
assert(-(1n), -1n, "-(1n) === -1n");
assertNotEqual(-(1n), 1n, "-(1n) !== 1n");
assert(-(-1n), 1n, "-(-1n) === 1n");
assertNotEqual(-(-1n), -1n, "-(-1n) !== -1n");
assert(- - 1n, 1n, "- - 1n === 1n");
assertNotEqual(- - 1n, -1n, "- - 1n !== -1n");
assert(-(0x1fffffffffffff01n), -0x1fffffffffffff01n, "-(0x1fffffffffffff01n) === -0x1fffffffffffff01n");
assertNotEqual(-(0x1fffffffffffff01n), 0x1fffffffffffff01n, "-(0x1fffffffffffff01n) !== 0x1fffffffffffff01n");
assertNotEqual(-(0x1fffffffffffff01n), -0x1fffffffffffff00n, "-(0x1fffffffffffff01n) !== -0x1fffffffffffff00n");

// Non-primitive cases

assert(-Object(1n), -1n, "-Object(1n) === -1n");
assertNotEqual(-Object(1n), 1n, "-Object(1n) !== 1n");
assertNotEqual(-Object(1n), Object(-1n), "-Object(1n) !== Object(-1n)");
assert(-Object(-1n), 1n, "-Object(-1n) === 1n");
assertNotEqual(-Object(-1n), -1n, "-Object(-1n) !== -1n");
assertNotEqual(-Object(-1n), Object(1n), "-Object(-1n) !== Object(1n)");

let obj = {
    [Symbol.toPrimitive]: function() {
        return 1n;
    },
    valueOf: function() {
        throw new Error("Should never be called");
    },
    toString: function() {
        throw new Error("Should never be called");
    }
};
assert(-obj, -1n, "@@toPrimitive not called properly");

obj = {
    valueOf: function() {
        return 1n;
    },
    toString: function() {
        throw new Error("Should never be called");
    }
}
assert(-obj, -1n, "valueOf not called properly");

obj = {
    toString: function() {
        return 1n;
    }
};

assert(-obj, -1n, "-{toString: function() { return 1n; }} === -1n");

let x = 1n;
let y = -x;
let z = -y;
assert(x, z, "-(-x) !== z");

