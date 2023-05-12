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

function foo(a, b, c) {
    return (a|0) + (b|0) + (c|0);
}

function bar(o) {
    // Save a bunch of state in local variables.
    var a = o.f;
    var b = o.g;
    var c = o.h;
    var d = o.i;
    var e = o.j;
    var f = o.k;
    var g = o.l;
    // Make a call that will be subject to arity fixup and then use the saved state. We're
    // counting on LLVM to put those variables in callee-saves, since that's pretty much the
    // only sensible choice.
    return foo(42) + a + b + c + d + e + f + g;
}

noInline(foo);
noInline(bar);

for (var i = 0; i < 100000; ++i) {
    // Call bar() in such a way that all of those callee-save variables have fairly unique
    // looking values, to maximize the chances of foo() clobbering them in a recognizable
    // way.
    var result = bar({
        f:i * 3, g:i - 1, h:(i / 2)|0, i:-i, j:13 + ((i / 5)|0), k:14 - ((i / 6)|0),
        l:1 - i});
    
    var expected = 42 + i * 3 + i - 1 + ((i / 2)|0) - i + 13 + ((i / 5)|0) + 14 -
        ((i / 6)|0) + 1 - i;
    
    if (result != expected)
        throw "Error: for iteration " + i + " expected " + expected + " but got " + result;
}
