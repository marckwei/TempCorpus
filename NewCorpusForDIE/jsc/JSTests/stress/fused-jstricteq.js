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
        throw new Error(`bad value: ${String(actual)} ${String(expected)}`);
}

function testJNSTRICTEQ(a, b)
{
    if (a === b) {
        return 42;
    }
    return 30;
}
noInline(testJNSTRICTEQ);

function testJSTRICTEQ(a, b)
{
    if (a !== b) {
        return 42;
    }
    return 30;
}
noInline(testJSTRICTEQ);

function testJNSTRICTEQB(a, b)
{
    var i = 0;
    do {
        ++i;
    } while (!(a === b));
    return i;
}
noInline(testJNSTRICTEQB);

function testJSTRICTEQB(a, b)
{
    var i = 0;
    do {
        ++i;
    } while (!(a !== b));
    return i;
}
noInline(testJSTRICTEQB);

function testJNSTRICTEQF(a, b)
{
    var i = 0;
    while (!(a === b))
        ++i;
    return i;
}
noInline(testJNSTRICTEQF);

function testJSTRICTEQF(a, b)
{
    var i = 0;
    while (!(a !== b))
        ++i;
    return i;
}
noInline(testJSTRICTEQF);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(testJNSTRICTEQ(0, 42), 30);
    shouldBe(testJSTRICTEQ(0, 42), 42);
    shouldBe(testJNSTRICTEQB(0, 0), 1);
    shouldBe(testJSTRICTEQB(0, 1), 1);
    shouldBe(testJNSTRICTEQF(0, 0), 0);
    shouldBe(testJSTRICTEQF(0, 1), 0);
}
