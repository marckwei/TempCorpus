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

description(
"Tests that attempts by the DFG simplification to short-circuit a Phantom to a GetLocal on a variable that is SetLocal'd in the same block, and where the predecessor block(s) make no mention of that variable, do not result in crashes."
);

function baz() {
    // Do something that prevents inlining.
    return function() { }
}

function stuff(z) { }

function foo(x, y) {
    var a = arguments; // Force arguments to be captured, so that x is captured.
    baz();
    var z = x;
    stuff(z); // Force a Flush, and then a Phantom on the GetLocal of x.
    return 42;
}

var o = {
    g: function(x) { }
};

function thingy(o) {
    var p = {};
    var result;
    // Trick to delay control flow graph simplification until after the flush of x above gets turned into a phantom.
    if (o.g)
        p.f = true;
    if (p.f) {
        // Basic block that stores to x in foo(), which is a captured variable, with
        // the predecessor block making no mention of x.
        result = foo("hello", 2);
    }
    return result;
}

dfgShouldBe(thingy, "thingy(o)", "42");
