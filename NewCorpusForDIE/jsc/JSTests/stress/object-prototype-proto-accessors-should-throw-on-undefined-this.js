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

//@ runFTLNoCJIT

function shouldEqual(testId, actual, expected) {
    if (actual != expected) {
        throw testId + ": ERROR: expect " + expected + ", actual " + actual;
    }
}

let numberOfIterations = 10000;

function testInvokeGetter() {
    var getter = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").get;
    return (function() { return getter(); })();
}
noInline(testInvokeGetter);

function testInvokeSetter() {
    var setter = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set;
    return (function() { return setter({}); })();
}
noInline(testInvokeSetter);

function runTest(testId, test, expectedResult, expectedException) {
    for (var i = 0; i < numberOfIterations; i++) {
        var exception;
        var result;
        try {
            result = test({});
        } catch (e) {
            exception = "" + e;
        }
        shouldEqual(testId, result, expectedResult);
        shouldEqual(testId, exception, expectedException);
    }
}

runTest(10000, testInvokeGetter, undefined, "TypeError: undefined is not an object (evaluating 'getter()')");
runTest(10100, testInvokeSetter, undefined, "TypeError: Object.prototype.__proto__ called on null or undefined");
