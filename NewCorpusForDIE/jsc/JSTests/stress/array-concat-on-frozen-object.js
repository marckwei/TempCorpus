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

let totalFailed = 0;

function shouldEqual(testId, actual, expected) {
    if (actual != expected) {
        throw testId + ": ERROR: expect " + expected + ", actual " + actual;
    }
}

function makeArray() {
    return ['unmodifiable'];
}

function makeArrayLikeObject() {
    var obj = {};
    obj[0] = 'unmodifiable';
    obj.length = 1; 
    return obj;
}

function emptyArraySourceMaker() {
    return [];
}

function singleElementArraySourceMaker() {
    return ['modified_1'];
}

// Make test functions with unique codeblocks.
function makeConcatTest(testId) {
    return new Function("arr", "return arr.concat(['" + testId + "'])");
}
function makeConcatOnHoleyArrayTest(testId) {
    return new Function("arr", "var other = ['" + testId + "']; other[1000] = '" + testId + "'; return arr.concat(other);");
}

let numIterations = 10000;

function runTest(testId, testMaker, targetMaker, sourceMaker, expectedValue, expectedException) {
    var test = testMaker(testId);
    noInline(test);

    for (var i = 0; i < numIterations; i++) {
        var exception = undefined;

        var obj = targetMaker();
        obj = Object.freeze(obj);

        var arr = sourceMaker();
        arr.constructor = { [Symbol.species]: function() { return obj; } };

        try {
            test(arr);
        } catch (e) {
            exception = "" + e;
            exception = exception.substr(0, 10); // Search for "TypeError:".
        }
        shouldEqual(testId, exception, expectedException);
        shouldEqual(testId, obj[0], expectedValue);
    }
}

runTest(10010, makeConcatTest, makeArray,           emptyArraySourceMaker,         "unmodifiable", "TypeError:");
runTest(10011, makeConcatTest, makeArray,           singleElementArraySourceMaker, "unmodifiable", "TypeError:");
runTest(10020, makeConcatTest, makeArrayLikeObject, emptyArraySourceMaker,         "unmodifiable", "TypeError:");
runTest(10021, makeConcatTest, makeArrayLikeObject, singleElementArraySourceMaker, "unmodifiable", "TypeError:");

runTest(10110, makeConcatOnHoleyArrayTest, makeArray,           emptyArraySourceMaker,         "unmodifiable", "TypeError:");
runTest(10111, makeConcatOnHoleyArrayTest, makeArray,           singleElementArraySourceMaker, "unmodifiable", "TypeError:");
runTest(10120, makeConcatOnHoleyArrayTest, makeArrayLikeObject, emptyArraySourceMaker,         "unmodifiable", "TypeError:");
runTest(10121, makeConcatOnHoleyArrayTest, makeArrayLikeObject, singleElementArraySourceMaker, "unmodifiable", "TypeError:");
