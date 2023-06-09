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

function assert(b) {
    if (!b)
        throw new Error;
}

function onlyDouble(x) {
    return Number.isInteger(x);
}
noInline(onlyDouble);

let interestingValues = [
    [Infinity, false],
    [-Infinity, false],
    [NaN, false],
    [0.0, true],
    [-0.0, true],
    [90071992547490009021129120, true],
    [9007199254749001000, true],
    [Number.MAX_SAFE_INTEGER, true],
    [Number.MIN_SAFE_INTEGER, true],
    [0.5, false],
    [Math.PI, false],
    [42, true],
    [0, true],
    [-10, true],
    [2147483647, true],
    [-2147483648, true],
    [Number.MIN_VALUE, false],
    [Number.MAX_VALUE, true],
    [-Number.MAX_VALUE, true],
];

for (let i = 0; i < 10000; ++i) {
    for (let [value, result] of interestingValues) {
        assert(onlyDouble(value) === result);
    }
}

interestingValues.push(
    [true, false],
    [false, false],
    [undefined, false],
    [null, false],
    [{}, false],
    [{valueOf() { throw new Error("Should not be called"); }}, false],
    [function(){}, false],
);

function generic(x) {
    return Number.isInteger(x);
}
noInline(generic);

for (let i = 0; i < 10000; ++i) {
    for (let [value, result] of interestingValues) {
        assert(generic(value) === result);
    }
}

function onlyInts(x) {
    return Number.isInteger(x);
}
noInline(onlyInts);

for (let i = 0; i < 10000; ++i) {
    assert(onlyInts(i) === true);
}
for (let i = 0; i < 10000; ++i) {
    for (let [value, result] of interestingValues) {
        assert(onlyInts(value) === result);
    }
}
