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

//@ run("--useConcurrentJIT=false")

// This test is set up delicately to:
// 1. cause the test() function to DFG compile with just the right amount of profiling
//    so that ...
// 2. the DFG identifies the "return Function()" path as dead, and ...
// 3. the DFG compiled function doesn't OSR exit too many times before ...
// 4. we change the implementation of the inlined foo() and execute test() again.
// 
// This test should not crash.

eval("\"use strict\"; var w;");
foo = function() { throw 0; }
var x;

(function() {
    eval("test = function() { ~foo(~(0 ? ~x : x) ? 0 : 0); return Function(); }");
})();

// This loop count of 2000 was empirically determined to be the right amount to get this
// this issue to manifest.  Dropping or raising it may mask the issue and prevent it from
// manifesting.
for (var i = 0; i < 2000; ++i) {
    try {
        test();
    } catch(e) {
    }
}

foo = function() { };
test();
