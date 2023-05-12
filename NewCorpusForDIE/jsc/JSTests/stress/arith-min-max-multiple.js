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

function test1(num)
{
    return Math.min(0, -1, -2, -3, -4, num);
}
noInline(test1);

function test2(num)
{
    return Math.max(0, -1, -2, -3, -4, 20000, num);
}
noInline(test2);

function test3(num)
{
    return Math.min(0.1, 0.2, 0.3, -1.3, num);
}
noInline(test3);

function test4(num)
{
    return Math.max(0.1, 0.2, 0.3, -1.3, 2.5, num);
}
noInline(test4);

function test5(num)
{
    return Math.min(0.1, 0.2, 0.3, -1.3, num, NaN);
}
noInline(test5);

function test6(num)
{
    return Math.max(0.1, 0.2, 0.3, -1.3, 2.5, num, NaN);
}
noInline(test6);

function test7(num)
{
    return Math.max(44.3, 0.2, 0.3, -1.3, 2.5, num);
}
noInline(test7);

function test8(num)
{
    return Math.min(-44.3, 0.2, 0.3, -1.3, 2.5, num);
}
noInline(test8);

for (let i = 0; i < 1e5; ++i) {
    shouldBe(test1(0), -4);
    shouldBe(test1(-100), -100);
    shouldBe(test2(0), 20000);
    shouldBe(test2(10000000), 10000000);
    shouldBe(test3(0), -1.3);
    shouldBe(test3(-2222222200.1), -2222222200.1);
    shouldBe(test4(0), 2.5);
    shouldBe(test4(1e1000), 1e1000);
    shouldBe(Number.isNaN(test5(0)), true);
    shouldBe(Number.isNaN(test6(2000.1)), true);
    shouldBe(test7(10), 44.3);
    shouldBe(test8(10), -44.3);
}
