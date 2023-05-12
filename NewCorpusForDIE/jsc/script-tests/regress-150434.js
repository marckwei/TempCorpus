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

description("Regression test for https://webkit.org/b/150434.");

// This test verifies that we can process an exception thrown from a natively called function
// that was tail called from a JS function that was native called itself.
// We use bind to create a native wrapper around JS functions.

var myException = "This shouldn't crash!";

function bar(a, idx)
{
    "use strict";

    if (idx > 0)
        throw myException;

    return a;
}

boundBar = bar.bind(null, 42);

function foo(a, idx)
{
    "use strict";

    return boundBar(idx);
}

boundFoo = foo.bind(null, 41);

function test()
{
    for (var i = 0; i < 200000; i++) {
        try {
            if (boundFoo(i) != 42)
                testFailed("Got wrong result from foo()!");
        } catch (e) {
            if (e != myException)
                print(e);
        }
    }
}

noInline(test);

test();

testPassed("Properly handled an exception from a tail called native function that was called by a native function");
