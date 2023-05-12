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

description("This test makes sure we don't hang when setting cyclic prototype values: http://bugs.webkit.org/show_bug.cgi?id=6985")

var o1 = { p1: 1 };
var o2 = { p2: 2 };
o2.__proto__ = o1;
var o3 = { p3: 3 };
o3.__proto__ = o2;

// Try to create a cyclical prototype chain.
shouldThrow("o1.__proto__ = o3;", "'TypeError: cyclic __proto__ value'");
shouldThrow("Object.setPrototypeOf(o1, o3)", "'TypeError: cyclic __proto__ value'");
var globalException;
try {
    o1.__proto__ = o3;
} catch (e) {
    globalException = e;
}
shouldBe("globalException.constructor", "TypeError");

globalException = undefined;
try {
    Object.setPrototypeOf(o1, o3);
} catch (e) {
    globalException = e;
}
shouldBe("globalException.constructor", "TypeError");

// This changes __proto__ setter behaviour, since __proto__ is an accessor on Object.prototype.
o1.__proto__ = null;
shouldBeFalse("({}).hasOwnProperty.call(o1, '__proto__')");
o1.__proto__ = o3;
shouldBeTrue("({}).hasOwnProperty.call(o1, '__proto__')");
shouldBe("Object.getPrototypeOf(o1)", "null");

// But setPrototypeOf will still work, and will still detect the cycle.
shouldThrow("Object.setPrototypeOf(o1, o3)");
