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

let called = false;
function defineSetter() {
    Array.prototype.__defineSetter__(0, function (x) {
        assert(x === 42);
        called = true;
    });
}

class DerivedArray extends Array {
    constructor(...args) {
        super()
    }
}

function iterate(a) {
    for (let i = 0; i < a.length; i++) { }
}

let arr = [[[1, 2, 3, 4, 5], [ 2], 5], [[1, 2, 3], [ -4]]];
let d = new DerivedArray();
d[1] = 20;
d[2] = 40;
arr.push([d, [2]  -9]);

function doSlice(a) {
    let r = a.slice();
    defineSetter();
    return r;
}

for (let i = 0; i < 10000; i++) {
    for (let [a, b, ...c] of arr) {
        let s = doSlice(a);
        iterate(s);
        delete s[0];
        called = false;
        s[0] = 42;
        if (a === d) {
            assert(called);
            called = false;
        }
    }
}
