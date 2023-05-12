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
function foo(a, b) {
    return a == b;
}

function bar(a, b) {
    if (a == b)
        return "yes";
    else
        return "no";
}

function baz(a, b) {
    if (a != b)
        return "no";
    else
        return "yes";
}

var o = {f:1};
var p = {f:2};
var q = {f:3};

var array1 = [o, p, q];
var array2 = [o, null];
var expecteds = [true,"yes","yes",false,"no","no",false,"no","no",false,"no","no",false,"no","no",false,"no","no"];

var expectedsIndex = 0;

function dostuff(result) {
    if (result == expecteds[expectedsIndex % expecteds.length]) {
        expectedsIndex++;
        return;
    }
    
    print("Bad result with a = " + a + ", b = " + b + ": wanted " + expecteds[expectedsIndex % expecteds.length] + " but got " + result);
    throw "Error";
}

for (var i = 0; i < 100000; ++i) {
    var a = array1[i % array1.length];
    var b = array2[i % array2.length];
    dostuff(foo(a, b));
    dostuff(bar(a, b));
    dostuff(baz(a, b));
}


