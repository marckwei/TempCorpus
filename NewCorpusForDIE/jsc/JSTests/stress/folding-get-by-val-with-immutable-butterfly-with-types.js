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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var array0 = [1, 2, 3, 4, 5];
var array1 = [1.2, 2.3, 3.4, 4.5, 5.6];
var array2 = ["Hello", "New", "World", "Cappuccino", "Cocoa"];
var array3 = [null, null, null, null, null];
var array4 = [undefined, undefined, undefined, undefined, undefined];
var array5 = [false, true, false, true, false];

function test0()
{
    return array0[0];
}
noInline(test0);

function test1()
{
    return array1[0];
}
noInline(test1);

function test2()
{
    return array2[0];
}
noInline(test2);

function test3()
{
    return array3[0];
}
noInline(test3);

function test4()
{
    return array4[0];
}
noInline(test4);

function test5()
{
    return array5[0];
}
noInline(test5);

for (var i = 0; i < 1e6; ++i) {
    shouldBe(test0(), 1);
    shouldBe(test1(), 1.2);
    shouldBe(test2(), "Hello");
    shouldBe(test3(), null);
    shouldBe(test4(), undefined);
    shouldBe(test5(), false);
}
