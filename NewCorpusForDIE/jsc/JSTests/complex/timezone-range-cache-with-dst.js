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

{
    let date1 = new Date(2020, 1, 8, 0);
    shouldBe(date1.getTime(), 1581148800000);
    let date2 = new Date(2020, 2, 2, 0);
    shouldBe(date2.getTime(), 1583136000000);
    let date3 = new Date(2020, 2, 8, 3);
    shouldBe(date3.getTime(), 1583661600000);
    let date4 = new Date(2020, 3, 9, 3);
    shouldBe(date4.getTime(), 1586426400000);
}
{
    let date1 = new Date(2020, 11, 1, 0);
    shouldBe(date1.getTime(), 1606809600000);
    let date2 = new Date(2020, 10, 3, 0);
    shouldBe(date2.getTime(), 1604390400000);
    let date3 = new Date(2020, 10, 1, 0);
    shouldBe(date3.getTime(), 1604214000000);
    let date4 = new Date(2020, 9, 10, 0);
    shouldBe(date4.getTime(), 1602313200000);
    let date5 = new Date(2020, 6, 10, 0);
    shouldBe(date5.getTime(), 1594364400000);
}
