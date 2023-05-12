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

// This tests that the lazy watchpoints we set for Symbol.species in our Builtin arrayPrototype functions work.


function test(array) {
    array = array.splice(2, 2);
    array = array.slice(0, 5);
    array = array.concat([1,2,3]);
    return array;
}
noInline(test);

function arrayEq(a, b) {
    if (a.length !== b.length)
        throw new Error();

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            throw new Error();
    }
}

for (let i = 0; i < 100; i++)
    arrayEq(test([1,2,3,4,5,6,7,8,9]), [3,4,1,2,3]);

class A extends Array { }

for (let i = 0; i < 100; i++) {
    let result = test(new A(1,2,3,4,5,6,7,8,9));
    arrayEq(result, [3,4,1,2,3]);
    if (!(result instanceof A))
        throw new Error();
}

for (let i = 0; i < 100; i++)
    arrayEq(test([1,2,3,4,5,6,7,8,9]), [3,4,1,2,3]);

delete Array.prototype.sort;

for (let i = 0; i < 100; i++)
    arrayEq(test([1,2,3,4,5,6,7,8,9]), [3,4,1,2,3]);

for (let i = 0; i < 100; i++) {
    let result = test(new A(1,2,3,4,5,6,7,8,9));
    arrayEq(result, [3,4,1,2,3]);
    if (!(result instanceof A))
        throw new Error();
}
