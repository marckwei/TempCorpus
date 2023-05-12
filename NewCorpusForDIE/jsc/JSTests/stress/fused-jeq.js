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

function testJNEQ(a, b)
{
    if (a == b) {
        return 42;
    }
    return 30;
}
noInline(testJNEQ);

function testJEQ(a, b)
{
    if (a != b) {
        return 42;
    }
    return 30;
}
noInline(testJEQ);

function testJNEQB(a, b)
{
    var i = 0;
    do {
        ++i;
    } while (!(a == b));
    return i;
}
noInline(testJNEQB);

function testJEQB(a, b)
{
    var i = 0;
    do {
        ++i;
    } while (!(a != b));
    return i;
}
noInline(testJEQB);

function testJNEQF(a, b)
{
    var i = 0;
    while (!(a == b))
        ++i;
    return i;
}
noInline(testJNEQF);

function testJEQF(a, b)
{
    var i = 0;
    while (!(a != b))
        ++i;
    return i;
}
noInline(testJEQF);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(testJNEQ(0, 42), 30);
    shouldBe(testJEQ(0, 42), 42);
    shouldBe(testJNEQB(0, 0), 1);
    shouldBe(testJEQB(0, 1), 1);
    shouldBe(testJNEQF(0, 0), 0);
    shouldBe(testJEQF(0, 1), 0);
}
