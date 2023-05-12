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

function userFunction(a, b, c) { }

shouldBe(userFunction.length, 3);
shouldBe(userFunction.bind().length, 3);
userFunction.length = 4;
shouldBe(userFunction.length, 3); // Because it is ReadOnly
shouldBe(userFunction.bind().length, 3);
delete userFunction.length;
shouldBe(userFunction.length, 0);
Object.defineProperty(userFunction, "length", {
    writable: true,
    configurable: true,
    value: 4
});
shouldBe(userFunction.length, 4);
shouldBe(userFunction.bind().length, 4);

var hostFunction = String.prototype.replace;
shouldBe(hostFunction.length, 2);
shouldBe(hostFunction.bind().length, 2);
hostFunction.length = 4;
shouldBe(hostFunction.length, 2); // Because it is ReadOnly
shouldBe(hostFunction.bind().length, 2);
delete hostFunction.length;
shouldBe(hostFunction.length, 0);
Object.defineProperty(hostFunction, "length", {
    writable: true,
    configurable: true,
    value: 4
});
shouldBe(hostFunction.length, 4);
shouldBe(hostFunction.bind().length, 4);

function userFunction2(a, b, c) { }

var boundFunction = userFunction2.bind();
shouldBe(boundFunction.length, 3);
shouldBe(boundFunction.bind().length, 3);
boundFunction.length = 4;
shouldBe(boundFunction.length, 3); // Because it is ReadOnly
shouldBe(boundFunction.bind().length, 3);
delete boundFunction.length;
shouldBe(boundFunction.length, 0);
Object.defineProperty(boundFunction, "length", {
    writable: true,
    configurable: true,
    value: 4
});
shouldBe(boundFunction.length, 4);
shouldBe(boundFunction.bind().length, 4);
