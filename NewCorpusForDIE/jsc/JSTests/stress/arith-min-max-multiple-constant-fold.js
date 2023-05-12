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

function test1()
{
    return Math.min(0, -1, -2, -3, -4);
}
noInline(test1);

function test2()
{
    return Math.max(0, -1, -2, -3, -4, 20000);
}
noInline(test2);

function test3()
{
    return Math.min(0.1, 0.2, 0.3, -1.3);
}
noInline(test3);

function test4()
{
    return Math.max(0.1, 0.2, 0.3, -1.3, 2.5);
}
noInline(test4);

function test5()
{
    return Math.min(0.1, 0.2, 0.3, -1.3, NaN);
}
noInline(test5);

function test6()
{
    return Math.max(0.1, 0.2, 0.3, -1.3, 2.5, NaN);
}
noInline(test6);

for (let i = 0; i < 1e5; ++i) {
    shouldBe(test1(), -4);
    shouldBe(test2(), 20000);
    shouldBe(test3(), -1.3);
    shouldBe(test4(), 2.5);
    shouldBe(Number.isNaN(test5()), true);
    shouldBe(Number.isNaN(test6()), true);
}
