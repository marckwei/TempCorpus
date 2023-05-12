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

function testRound(value)
{
    return Math.round(value);
}
noInline(testRound);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(1 / testRound(-0.4), -Infinity);
    shouldBe(1 / testRound(-0.5), -Infinity);
    shouldBe(1 / testRound(-0.6), -1.0);
    shouldBe(1 / testRound(-0.0), -Infinity);
    shouldBe(1 / testRound(0.1), Infinity);
}

function testFloor(value)
{
    return Math.floor(value);
}
noInline(testFloor);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(1 / testFloor(-0.0), -Infinity);
}

function testCeil(value)
{
    return Math.ceil(value);
}
noInline(testCeil);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(1 / testCeil(-0.0), -Infinity);
    shouldBe(1 / testCeil(-0.9), -Infinity);
}

function testRoundNonNegativeZero(value)
{
    return Math.round(value) | 0;
}
noInline(testRoundNonNegativeZero);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(testRoundNonNegativeZero(0.4), 0);
    shouldBe(testRoundNonNegativeZero(0.5), 1);
    shouldBe(testRoundNonNegativeZero(0.6), 1);
    shouldBe(testRoundNonNegativeZero(0.0), 0);
    shouldBe(testRoundNonNegativeZero(0.1), 0);
}
shouldBe(1 / testRoundNonNegativeZero(-0.4), Infinity);

function testRoundNonNegativeZero2(value)
{
    return Math.round(value) | 0;
}
noInline(testRoundNonNegativeZero2);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(1 / testRoundNonNegativeZero2(-0.4), Infinity);
    shouldBe(1 / testRoundNonNegativeZero2(-0.5), Infinity);
    shouldBe(1 / testRoundNonNegativeZero2(-0.6), -1.0);
    shouldBe(1 / testRoundNonNegativeZero2(-0.0), Infinity);
    shouldBe(1 / testRoundNonNegativeZero2(0.1), Infinity);
}

function testTrunc(value)
{
    return Math.trunc(value);
}
noInline(testTrunc);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(1 / testTrunc(0.0), Infinity);
    shouldBe(1 / testTrunc(-0.0), -Infinity);
}
