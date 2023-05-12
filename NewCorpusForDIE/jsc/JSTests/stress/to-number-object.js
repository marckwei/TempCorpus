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
        throw new Error(`bad value: ${String(actual)}`);
}

function test1(object)
{
    // The prediction should be Int32.
    return Number(object);
}
noInline(test1);

function test12(object)
{
    // Should be Int32 comparison.
    return Number(object) <= 42;
}
noInline(test12);

var object1 = { valueOf() { return 42; } };
for (var i = 0; i < 1e4; ++i) {
    shouldBe(test1(object1), 42);
    shouldBe(test12(object1), true);
}

function test2(object)
{
    // The prediction should be Doubles.
    return Number(object);
}
noInline(test2);

function test22(object)
{
    // Should be Double comparison.
    return Number(object) <= 42;
}
noInline(test22);

var object2 = { valueOf() { return 42.195; } };
for (var i = 0; i < 1e4; ++i) {
    shouldBe(test2(object2), 42.195);
    shouldBe(test22(object2), false);
}

function test3(object)
{
    // The prediction should be Int32, and later it should be Doubles.
    return Number(object);
}
noInline(test3);

function test32(object)
{
    // Should be Int32 comparison. And later, OSR exit occurs with 42.195. And it should be recompiled as Double comparison.
    return Number(object) <= 42;
}
noInline(test32);

var value = 42;
var object3 = { valueOf() { return value; } };
for (var i = 0; i < 1e4; ++i) {
    shouldBe(test3(object3), value);
    shouldBe(test32(object3), true);
}
value = 42.195;
for (var i = 0; i < 1e4; ++i) {
    shouldBe(test3(object3), value);
    shouldBe(test32(object3), false);
}
