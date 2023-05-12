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

description("Verify the various properties of Array.prototype[@@unscopables]");

shouldBeEqualToString("typeof Array.prototype[Symbol.unscopables]", "object");
shouldBe("Object.getPrototypeOf(Array.prototype[Symbol.unscopables])", "null");
shouldBeFalse("Object.getOwnPropertyDescriptor(Array.prototype, Symbol.unscopables).writable");
shouldBeFalse("Object.getOwnPropertyDescriptor(Array.prototype, Symbol.unscopables).enumerable");
shouldBeTrue("Object.getOwnPropertyDescriptor(Array.prototype, Symbol.unscopables).configurable");

let expectedEntries = [
    "at",
    "copyWithin",
    "entries",
    "fill",
    "find",
    "findIndex",
    "findLast",
    "findLastIndex",
    "flat",
    "flatMap",
    "includes",
    "keys",
    "toReversed",
    "toSorted",
    "toSpliced",
    "values",
];
shouldBe("Object.getOwnPropertyNames(Array.prototype[Symbol.unscopables])", "expectedEntries");
shouldBe("Object.getOwnPropertySymbols(Array.prototype[Symbol.unscopables])", "[]");

for (let entry of expectedEntries) {
    shouldBeTrue("Array.prototype[Symbol.unscopables][\"" + entry + "\"]");
    shouldBeTrue("Object.getOwnPropertyDescriptor(Array.prototype[Symbol.unscopables], \"" + entry + "\").writable");
    shouldBeTrue("Object.getOwnPropertyDescriptor(Array.prototype[Symbol.unscopables], \"" + entry + "\").enumerable");
    shouldBeTrue("Object.getOwnPropertyDescriptor(Array.prototype[Symbol.unscopables], \"" + entry + "\").configurable");
}
