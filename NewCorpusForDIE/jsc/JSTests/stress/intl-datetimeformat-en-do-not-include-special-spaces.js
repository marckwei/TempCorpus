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

function test(result) {
    shouldBe(result.includes('\u202f'), false);
    shouldBe(result.includes('\u2009'), false);
}

let date1 = new Date("2023-02-13T05:18:08.347Z");
let date2 = new Date("2023-02-23T05:18:08.347Z");
{
    let result = date1.toLocaleString('en');
    test(result);
}
{
    let result = date1.toLocaleString('en-US');
    test(result);
}
{
    let fmt = new Intl.DateTimeFormat('en', { timeStyle: "long" });
    test(fmt.format(date1));
    test(fmt.formatRange(date1, date2));
    fmt.formatToParts(date1).forEach((part) => {
        test(part.value);
    });
    fmt.formatRangeToParts(date1, date2).forEach((part) => {
        test(part.value);
    });
}
{
    let fmt = new Intl.DateTimeFormat('en-US', { timeStyle: "long" });
    test(fmt.format(date1));
    test(fmt.formatRange(date1, date2));
    fmt.formatToParts(date1).forEach((part) => {
        test(part.value);
    });
    fmt.formatRangeToParts(date1, date2).forEach((part) => {
        test(part.value);
    });
}
