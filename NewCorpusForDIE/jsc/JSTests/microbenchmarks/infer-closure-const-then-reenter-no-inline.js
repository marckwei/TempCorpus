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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
function foo(a_, b_, c_, d_, e_, f_, g_) {
    var a = a_;
    var b = b_;
    var c = c_;
    var d = d_;
    var e = e_;
    var f = f_;
    var g = g_;
    return {
        foo: function() {
            return a + b + c + d + e + f + g;
        }
    };
}

noInline(foo);

var thingy = foo(42, 23, 84, 13, 90, 34, 52);
noInline(thingy.foo);
for (var i = 0; i < 10000000; ++i) {
    var result = thingy.foo();
    if (result != 42 + 23 + 84 + 13 + 90 + 34 + 52)
        throw "Error: bad result: " + result;
}

var result = foo(1, 2, 3, 4, 5, 6, 7).foo();
if (result != 1 + 2 + 3 + 4 + 5 + 6 + 7)
    throw "Error: bad result: " + result;
