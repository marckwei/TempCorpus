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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

{
    let i = 2;
    let j = 3;
    shouldBe(2 ** 3, 8);
    shouldBe(i ** 3, 8);
    shouldBe(2 ** j, 8);
    shouldBe(i ** j, 8);
}

{
    shouldBe(2 ** 3 ** 3, 134217728);
    shouldBe(2 ** 3 + 3, 11);
    shouldBe(2 ** 3 + 3 ** 3, 35);
    shouldBe(2 ** 3 * 3, 24);
    shouldBe(2 ** 3 * 3 ** 3, 216);

    shouldBe(2 + 3 ** 3, 29);
    shouldBe(2 * 3 ** 3, 54);
}

{
    let i = 2;
    i **= 4;
    shouldBe(i, 16);
    i **= 1 + 1;
    shouldBe(i, 256);
}

for (let i = 0; i < 1e4; ++i) {
    let a = Math.random();
    let b = Math.random();
    shouldBe(a ** b, Math.pow(a, b));
}
