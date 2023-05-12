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
"This tests that inlining preserves basic function.arguments functionality when said functionality is used from outside of the code where inlining actually happened."
);

function foo() {
    return bar.arguments;
}

function fuzz() {
    return baz.arguments;
}

function bar(a,b,c) {
    return foo(a,b,c);
}

function baz(a,b,c) {
    var array1 = bar(a,b,c);
    var array2 = fuzz(a,b,c);
    var result = [];
    for (var i = 0; i < array1.length; ++i)
        result.push(array1[i]);
    for (var i = 0; i < array2.length; ++i)
        result.push(array2[i]);
    return result;
}

for (var __i = 0; __i < 200; ++__i)
    shouldBe("\"\" + baz(\"a\" + __i, \"b\" + (__i + 1), \"c\" + (__i + 2))",
             "\"a" + __i + ",b" + (__i + 1) + ",c" + (__i + 2) + ",a" + __i + ",b" + (__i + 1) + ",c" + (__i + 2) + "\"");

var successfullyParsed = true;
