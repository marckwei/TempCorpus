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

// This failure will be resolved by https://bugs.webkit.org/show_bug.cgi?id=150279.
//@ skip

function foo(f, p, args) {
    var x = 100;
    var result = 101;
    var pf = p.g;
    try {
        x = 102;
        pf++;
        result = f.apply(this, args);
        f = 104;
        pf++;
        x = 106;
    } catch (e) {
        return {outcome: "exception", values: [f, pf, x, result]};
    }
    return {outcome: "return", values: [f, pf, x, result]};
}

noInline(foo);

function bar(a, b, c) {
    return a + b + c;
}

noInline(bar);

// Warm up foo().
for (var i = 0; i < 100000; ++i) {
    var result = foo(bar, {g:200}, [105, 1, 1]);
    if (result.outcome !== "return")
        throw "Error in loop: bad outcome: " + result.outcome;
    if (result.values.length !== 4)
        throw "Error in loop: bad number of values: " + result.values.length;
    if (result.values[0] !== 104)
        throw "Error in loop: bad values[0]: " + result.values[0];
    if (result.values[1] !== 202)
        throw "Error in loop: bad values[1]: " + result.values[1];
    if (result.values[2] !== 106)
        throw "Error in loop: bad values[2]: " + result.values[2];
    if (result.values[3] !== 107)
        throw "Error in loop: bad values[3]: " + result.values[3];
}

// Now throw an exception.
var result = foo(bar, {g:300}, 42);
if (result.outcome !== "exception")
    throw "Error at end: bad outcome: " + result.outcome;
if (result.values.length !== 4)
    throw "Error at end: bad number of values: " + result.values.length;
if (result.values[0] !== bar)
    throw "Error at end: bad values[0]: " + result.values[0];
if (result.values[1] !== 301)
    throw "Error at end: bad values[1]: " + result.values[1];
if (result.values[2] !== 102)
    throw "Error at end: bad values[2]: " + result.values[2];
if (result.values[3] !== 101)
    throw "Error at end: bad values[3]: " + result.values[3];

