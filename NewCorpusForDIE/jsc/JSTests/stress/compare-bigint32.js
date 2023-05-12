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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

const Greater = 0;
const Less = 1;
const Equal = 2;

function result(func, data)
{
    if (func === lessThan)
        return data === Less;
    if (func === lessThanEqual)
        return data === Less || data === Equal;
    if (func === greaterThan)
        return data === Greater;
    if (func === greaterThanEqual)
        return data === Greater || data === Equal;
    if (func === equal)
        return data === Equal;
    return false;
}

var list = [
    [1n, 2n, Less],
    [1n, 1n, Equal],
    [1n, 0n, Greater],
    [1n, -1n, Greater],
    [1n, -2n, Greater],
    [0n, 2n, Less],
    [0n, 1n, Less],
    [0n, 0n, Equal],
    [0n, -1n, Greater],
    [0n, -2n, Greater],
    [-1n, 2n, Less],
    [-1n, 1n, Less],
    [-1n, 0n, Less],
    [-1n, -1n, Equal],
    [-1n, -2n, Greater],
];

function lessThan(a, b)
{
    return a < b;
}
noInline(lessThan);

function lessThanEqual(a, b)
{
    return a <= b;
}
noInline(lessThanEqual);

function greaterThan(a, b)
{
    return a > b;
}
noInline(greaterThan);

function greaterThanEqual(a, b)
{
    return a >= b;
}
noInline(greaterThanEqual);

function equal(a, b)
{
    return a == b;
}
noInline(equal);

for (var i = 0; i < 1e3; ++i) {
    for (let [a, b, res] of list) {
        shouldBe(lessThan(a, b), result(lessThan, res));
        shouldBe(lessThanEqual(a, b), result(lessThanEqual, res));
        shouldBe(greaterThan(a, b), result(greaterThan, res));
        shouldBe(greaterThanEqual(a, b), result(greaterThanEqual, res));
        shouldBe(equal(a, b), result(equal, res));
    }
}
