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
    let a = Int32Array.from([0, , , 6]);
    shouldBe(a.length, 4);
    shouldBe(a[0], 0);
    shouldBe(a[1], 0);
    shouldBe(a[2], 0);
    shouldBe(a[3], 6);
}
{
    let a = Int32Array.from([0.2, , , 6.1]);
    shouldBe(a.length, 4);
    shouldBe(a[0], 0);
    shouldBe(a[1], 0);
    shouldBe(a[2], 0);
    shouldBe(a[3], 6);
}
{
    let a = Float64Array.from([0, , , 6]);
    shouldBe(a.length, 4);
    shouldBe(a[0], 0);
    shouldBe(Number.isNaN(a[1]), true);
    shouldBe(Number.isNaN(a[2]), true);
    shouldBe(a[3], 6);
}
{
    let a = Float64Array.from([0.2, , , 6.1]);
    shouldBe(a.length, 4);
    shouldBe(a[0], 0.2);
    shouldBe(Number.isNaN(a[1]), true);
    shouldBe(Number.isNaN(a[2]), true);
    shouldBe(a[3], 6.1);
}
