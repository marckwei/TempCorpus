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


description('Tests for ES6 class syntax default constructor');

function shouldThrow(s, message) {
    var threw = false;
    try {
        eval(s);
    } catch(e) {
        threw = true;
        if (!message || e.toString() === eval(message))
            testPassed(s + ":::" + e.toString());
        else
            testFailed(s);
    }
    if (!threw)
        testFailed(s);
}

function shouldBe(a, b) {
    var r1 = eval(a);
    var r2 = eval(b)
    if (r1 === r2)
        testPassed(a + ":::" + b);
    else
        testFailed(r1 + ":::" + r2);
}

function shouldBeTrue(s) {
    if (eval(s) === true)
        testPassed(s);
    else
        testFailed(s);
}

function assert(b) {
    if (!b)
        testFailed("Failed assert");
    else
        testPassed("Passed assert");
}

class A { };
class B extends A { };

shouldBeTrue('new A instanceof A');
shouldThrow('A()', '"TypeError: Cannot call a class constructor without |new|"');
shouldBeTrue('A.prototype.constructor instanceof Function');
shouldBe('A.prototype.constructor.name', '"A"');
shouldBeTrue('new B instanceof A; new B instanceof A');
shouldThrow('B()', '"TypeError: Cannot call a class constructor without |new|"');
shouldBe('B.prototype.constructor.name', '"B"');
shouldBeTrue('A !== B');
shouldBeTrue('A.prototype.constructor !== B.prototype.constructor');
var result = new (class extends (class { constructor(a, b) { return [a, b]; } }) {})(1, 2);
assert(result[0] === 1);
assert(result[1] === 2);


var successfullyParsed = true;
