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
function bar() { }

function foo(alpha) {
    var x0 = 0;
    var x1 = 0;
    var x2 = 0;
    var x3 = 0;
    var x4 = 0;
    var x5 = 0;
    var x6 = 0;
    var x7 = 0;
    var x8 = 0;
    var x9 = 0;
    var x10 = 0;
    var x11 = 0;
    var x12 = 0;
    var x13 = 0;
    var x14 = 0;
    var x15 = 0;
    var x16 = 0;
    var x17 = 0;
    var x18 = 0;
    var x19 = 0;
    if (alpha) {
        bar(function () {
                return (x0 + x1 + x2 + x3 + x4 + x5 + x6 + x7 + x8 + x9 + x10 +
                        x11 + x12 + x13 + x14 + x15 + x16 + x17 + x18 + x19);
                });
        return x17;
    }
    return x12;
}

noInline(bar);
noInline(foo);

for (var i = 0; i < 1000000; i++) {
    var result = foo(!(i % 1000));
    if (result !== 0)
        throw "Error: expected undefined, got " + result;
}
