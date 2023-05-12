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

//@ runDefault("--useRandomizingFuzzerAgent=1", "--useConcurrentJIT=0")

let totalFailed = 0;

function shouldEqual(testId, iteration, actual, expected) {
    if (actual != expected) {
        throw new Error("Test #" + testId + ", iteration " + iteration + ", ERROR: expected \"" + expected + "\", got \"" + actual + "\"");
    }
}

function makeUnwriteableUnconfigurableObject()
{
    return Object.defineProperty([], 0, {value: "frozen", writable: false, configurable: false});
}

function testArrayOf(obj)
{
    Array.of.call(function() { return obj; }, "no longer frozen");
}

noInline(testArrayOf);

let numIterations = 10000;

function runTest(testId, test, sourceMaker, expectedException) {
    for (var i = 0; i < numIterations; i++) {
        var exception = "No exception";
        var obj = sourceMaker();

        try {
            test(obj);
        } catch (e) {
            exception = "" + e;
            exception = exception.substr(0, 10); // Search for "TypeError:".
        }
        shouldEqual(testId, i, exception, expectedException);
    }
}

runTest(1, testArrayOf, makeUnwriteableUnconfigurableObject, "TypeError:");
