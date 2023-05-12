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

function foo(a, b) {
    return a + b;
}

function verify(a, b) {
    if (a !== b)
        throw "Error: the two arguments objects aren't identical.";
    if (a[0] !== 42)
        throw "Error: the first argument isn't 42 (a).";
    if (b[0] !== 42)
        throw "Error: the first argument isn't 42 (b).";
}

noInline(verify);

var global = false;
function bar(x) {
    var a = arguments;
    if (global) {
        x = 42;
        verify(arguments, a);
    }
    return foo.apply(null, a);
}

function baz(a, b) {
    return bar(a, b);
}

noInline(baz);

for (var i = 0; i < 10000; ++i) {
    var result = baz(1, 2);
    if (result != 1 + 2)
        throw "Error: bad result: " + result;
}

global = true;
var result = baz(1, 2);
if (result != 42 + 2)
    throw "Error: bad result at end: " + result;
