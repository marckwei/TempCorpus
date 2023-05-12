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

var realm = createGlobalObject();
var OtherPromise = realm.Promise;
var other = new OtherPromise(function (resolve) { resolve(42); });

class DerivedOtherPromise extends OtherPromise {
    constructor(executor) {
        super(executor);
    }
};

shouldBe(other.__proto__, OtherPromise.prototype);
for (var i = 0; i < 1e4; ++i) {
    var promise = new DerivedOtherPromise(function (resolve) { resolve(i); });
    shouldBe(promise.__proto__, DerivedOtherPromise.prototype);
    shouldBe(promise.__proto__.__proto__, OtherPromise.prototype);
}
drainMicrotasks();

function createPromise(i) {
    return new OtherPromise(function (resolve) { resolve(i); });
}
noInline(createPromise);

for (var i = 0; i < 1e4; ++i) {
    var promise = createPromise(i);
    shouldBe(promise.__proto__, OtherPromise.prototype);
    shouldBe(promise.__proto__ !== Promise.prototype, true);
}
