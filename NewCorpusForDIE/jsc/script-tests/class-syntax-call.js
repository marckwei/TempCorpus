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

description('Tests for calling the constructors of ES6 classes');

class A { constructor() {} };
class B extends A { constructor() { super() } };

function shouldThrow(s, message) {
    var threw = false;
    try {
        eval(s);
    } catch(e) {
        threw = true;
        if (e.toString() === eval(message))
            testPassed(s + ":::" + message);
        else
            testFailed(e.toString() + ":::" + message);
    }
    if (!threw)
        testFailed(s);
}

function shouldNotThrow(s) {
    var threw = false;
    try {
        eval(s);
    } catch(e) {
        threw = true;
    }
    if (threw)
        testFailed(s);
    else
        testPassed(s);
}

shouldNotThrow('new A');
shouldThrow('A()', '"TypeError: Cannot call a class constructor without |new|"');
shouldNotThrow('new B');
shouldThrow('B()', '"TypeError: Cannot call a class constructor without |new|"');
shouldNotThrow('new (class { constructor() {} })()');
shouldThrow('(class { constructor() {} })()', '"TypeError: Cannot call a class constructor without |new|"');
shouldThrow('new (class extends null { constructor() { super() } })()', '"TypeError: function is not a constructor (evaluating \'super()\')"');
shouldThrow('(class extends null { constructor() { super() } })()', '"TypeError: Cannot call a class constructor without |new|"');

var successfullyParsed = true;
