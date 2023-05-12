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

// Test that the ClonedArguments created by the Function.arguments will properly
// keep its callee alive.  This test should not crash and should not print any error
// messages.

var cachedArguments = [];
var numberOfEntries = 1000;

function makeTransientFunction(i) {
    function transientFunc() {
        cachedArguments[i] = transientFunc.arguments;
    }
    return transientFunc;
}

for (i = 0; i < numberOfEntries; i++) {
    var transientFunc = makeTransientFunction(i);
    transientFunc();
    // At this point, the only reference to the transient function is from
    // cachedArguments[i].callee.
}

gc();

// Allocate a bunch of memory to stomp over the transient functions that may have been
// erroneously collected. webkit.org/b/145709
for (i = 0; i < numberOfEntries; i++) {
    new Object();
}

for (i = 0; i < numberOfEntries; i++) {
    var callee = cachedArguments[i].callee;
    if (typeof callee != "function")
        print("ERROR: callee is " + callee); 
}
