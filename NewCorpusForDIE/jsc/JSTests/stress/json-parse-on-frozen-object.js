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

function frozenArrayReviver(k, v) {
    if (k === "a") {
        this.b = Object.freeze(["unmodifiable"]);
        return v;
    }
    if (k === "0")
        return "modified";
    return v;
}

function frozenArrayLikeObjectReviver(k, v) {
    if (k === "a") {
        var obj = {};
        obj[0] = 'unmodifiable';
        obj.length = 1; 
        this.b = Object.freeze(obj);
        return v;
    }
    if (k === "0")
        return "modified";
    return v;
}

function frozenArrayReviverWithDelete(k, v) {
    if (k === "a") {
        this.b = Object.freeze(["unmodifiable"]);
        return v;
    }
    if (k === "0")
        return undefined;
    return v;
}

function frozenArrayLikeObjectReviverWithDelete(k, v) {
    if (k === "a") {
        var obj = {};
        obj[0] = 'unmodifiable';
        obj.length = 1; 
        this.b = Object.freeze(obj);
        return v;
    }
    if (k === "0")
        return undefined;
    return v;
}

function runTest(testId, reviver, expectedValue, expectedException) {
    let numIterations = 10000;
    for (var i = 0; i < numIterations; i++) {
        var exception = undefined;

        var obj;
        try {
            obj = JSON.parse('{ "a": 0, "b": 0 }', reviver);
        } catch (e) {
            exception = "" + e;
            exception = exception.substr(0, 10); // Search for "TypeError:".
        }
        shouldEqual(testId, exception, expectedException);
        shouldEqual(testId, obj.b[0], expectedValue);
    }
}

runTest(10000, frozenArrayReviver,                     "unmodifiable", undefined);
runTest(10001, frozenArrayLikeObjectReviver,           "unmodifiable", undefined);
runTest(10002, frozenArrayReviverWithDelete,           "unmodifiable", undefined);
runTest(10003, frozenArrayLikeObjectReviverWithDelete, "unmodifiable", undefined);
