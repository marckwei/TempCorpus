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

function convert(bigInt)
{
    return Number(bigInt);
}
noInline(convert);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(convert(0n), 0);
    shouldBe(convert(0x7fffffffn), 0x7fffffff);
    shouldBe(convert(-0x7fffffffn - 1n), -0x80000000);
}

for (var i = 0; i < 1e4; ++i) {
    shouldBe(convert(0x80000000n), 0x80000000);
    shouldBe(convert(0x7fffffffn + 1n), 0x80000000);
    shouldBe(convert(0x7fffffffn + 2n), 0x80000001);
    shouldBe(convert(-0x7fffffffn - 2n), -0x80000001);
}

for (var i = 0; i < 1e4; ++i) {
    shouldBe(convert(0x20000000000000n), 9007199254740992);
    shouldBe(convert(0x20000000000000n + 1n), 9007199254740992);
    shouldBe(convert(0x20000000000000n + 2n), 9007199254740994);
    shouldBe(convert(0x20000000000000n + 3n), 9007199254740996);
    shouldBe(convert(0x20000000000000n + 4n), 9007199254740996);

    shouldBe(convert(-(0x20000000000000n)), -9007199254740992);
    shouldBe(convert(-(0x20000000000000n + 1n)), -9007199254740992);
    shouldBe(convert(-(0x20000000000000n + 2n)), -9007199254740994);
    shouldBe(convert(-(0x20000000000000n + 3n)), -9007199254740996);
    shouldBe(convert(-(0x20000000000000n + 4n)), -9007199254740996);

    shouldBe(convert(2n ** (1024n - 1n)), 8.98846567431158e+307);
    shouldBe(convert(2n ** (1024n - 1n)), 8.98846567431158e+307);
    shouldBe(convert(0x1fffffffffffffn << 971n), Number.MAX_VALUE);
    shouldBe(convert(0x20000000000000n << 971n), Infinity);
    shouldBe(convert(0x1ffffffffffffffn << 966n), 8.98846567431158e+307);
    shouldBe(convert(0x3fffffffffffffn << 970n), Infinity);
    shouldBe(convert(0x3fffffffffffffn << 969n), 8.98846567431158e+307);

    shouldBe(convert(-(2n ** (1024n - 1n))), -8.98846567431158e+307);
    shouldBe(convert(-(2n ** (1024n - 1n))), -8.98846567431158e+307);
    shouldBe(convert(-0x1fffffffffffffn << 971n), -Number.MAX_VALUE);
    shouldBe(convert(-0x20000000000000n << 971n), -Infinity);
    shouldBe(convert(-0x1ffffffffffffffn << 966n), -8.98846567431158e+307);
    shouldBe(convert(-0x3fffffffffffffn << 970n), -Infinity);
    shouldBe(convert(-0x3fffffffffffffn << 969n), -8.98846567431158e+307);
}
