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
noInline(shouldBe);

function test(a, b, c, d, e)
{
    return a + b + c + d + e;
}
noInline(test);

function test2(a, b, c, d, e, f)
{
    return a + b + c + d + e + f;
}
noInline(test2);

for (var i = 0; i < 3e4; ++i) {
    shouldBe(test.bind(undefined)(1, 2, 3, 4, 5), 15);
    shouldBe(test.bind(undefined, 1)(2, 3, 4, 5), 15);
    shouldBe(test.bind(undefined, 2, 3)(4, 5, 6), 20);
    shouldBe(test.bind(undefined, 2, 3, 4)(5, 6), 20);
    shouldBe(test.bind(undefined, 2, 3, 4, 5)(6), 20);
    shouldBe(test.bind(undefined, 2, 3, 4, 5, 6)(), 20);

    shouldBe(test2.bind(undefined)(1, 1, 2, 3, 4, 5), 16);
    shouldBe(test2.bind(undefined, 1)(1, 2, 3, 4, 5), 16);
    shouldBe(test2.bind(undefined, 1, 1)(2, 3, 4, 5), 16);
    shouldBe(test2.bind(undefined, 1, 2, 3)(4, 5, 6), 21);
    shouldBe(test2.bind(undefined, 1, 2, 3, 4)(5, 6), 21);
    shouldBe(test2.bind(undefined, 1, 2, 3, 4, 5)(6), 21);
    shouldBe(test2.bind(undefined, 1, 2, 3, 4, 5, 6)(), 21);
}
