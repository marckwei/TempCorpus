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

class DerivedPromise extends Promise {
    constructor(executor) {
        super(executor);
    }
};

class DerivedPromise2 extends DerivedPromise {
    constructor(executor) {
        super(executor);
    }
};

var array = [];
var array2 = [];
for (var i = 0; i < 1e4; ++i) {
    array.push(new DerivedPromise(function (resolve, reject) {
        resolve(i);
    }));
}
for (var i = 0; i < 1e4; ++i) {
    array2.push(new DerivedPromise2(function (resolve, reject) {
        resolve(i);
    }));
}
drainMicrotasks();

for (var i = 0; i < array.length; ++i)
    shouldBe(array[i].__proto__, DerivedPromise.prototype);
for (var i = 0; i < array2.length; ++i)
    shouldBe(array2[i].__proto__, DerivedPromise2.prototype);
