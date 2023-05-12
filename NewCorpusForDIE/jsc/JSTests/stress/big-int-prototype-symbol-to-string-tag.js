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

// Original test from test262/test/built-ins/BigInt/prototype/Symbol.toStringTag.js

function assert(a) {
    if (!a)
        throw new Error("Bad assertion");
}

let p = Object.getOwnPropertyDescriptor(BigInt.prototype, Symbol.toStringTag);

assert(p.writable === false);
assert(p.enumerable === false);
assert(p.configurable === true);
assert(p.value === "BigInt");

assert(Object.prototype.toString.call(3n) === "[object BigInt]");
assert(Object.prototype.toString.call(Object(3n)) === "[object BigInt]");

// Verify that Object.prototype.toString does not have special casing for BigInt
// as it does for most other primitive types
Object.defineProperty(BigInt.prototype, Symbol.toStringTag, {
  value: "FooBar",
  writable: false,
  enumerable: false,
  configurable: true
});

assert(Object.prototype.toString.call(3n) === "[object FooBar]");
assert(Object.prototype.toString.call(Object(3n)) === "[object FooBar]");

