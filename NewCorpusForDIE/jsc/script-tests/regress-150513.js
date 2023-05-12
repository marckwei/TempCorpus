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

description("Regression test for https://webkit.org/b/150513.");

// This test verifies that we can properly handle calling a virtual JavaScript
// function that fails during CodeBlock generation.

var functions = [];

function init()
{
    functions.push(new Function("a", "return a"));
    functions.push(new Function("a", "return a"));
    functions.push(new Function("a", "return a"));
}

function test()
{
    for (var i = 0; i < 100000; i++) {
        var f;
        if (i % 1000 == 999) {
            testRunner.failNextNewCodeBlock();
            f = functions[2];
        } else
            f = functions[i % 2];

        try {
            var result = f(1);
            if (result != 1)
                testFailed("Wrong result, expected 1, got " + result);
        } catch (e) {
        }
    }
}

init();

test();

testPassed("Didn't crash when calling a virtual JavaScript function that doesn't have a CodeBlock.");
