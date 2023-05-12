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

shouldBe(Number(0n), 0);

// Around Int32 max/min.
shouldBe(Number(0x7fffffffn), 0x7fffffff);
shouldBe(Number(0x80000000n), 0x80000000);
shouldBe(Number(0x7fffffffn + 1n), 0x80000000);
shouldBe(Number(0x7fffffffn + 2n), 0x80000001);
shouldBe(Number(-0x7fffffffn - 1n), -0x80000000);
shouldBe(Number(-0x7fffffffn - 2n), -0x80000001);

// Around Int52 max/min.
shouldBe(Number(0x20000000000000n), 9007199254740992);
shouldBe(Number(0x20000000000000n + 1n), 9007199254740992);
shouldBe(Number(0x20000000000000n + 2n), 9007199254740994);
shouldBe(Number(0x20000000000000n + 3n), 9007199254740996);
shouldBe(Number(0x20000000000000n + 4n), 9007199254740996);

shouldBe(Number(-(0x20000000000000n)), -9007199254740992);
shouldBe(Number(-(0x20000000000000n + 1n)), -9007199254740992);
shouldBe(Number(-(0x20000000000000n + 2n)), -9007199254740994);
shouldBe(Number(-(0x20000000000000n + 3n)), -9007199254740996);
shouldBe(Number(-(0x20000000000000n + 4n)), -9007199254740996);

// mantissa rounding.
shouldBe(Number(0x3fffffffffffffn), 18014398509481984);
shouldBe(Number(-0x3fffffffffffffn), -18014398509481984);
shouldBe(Number(0b1000000000000000000000000000000000000111111111111111111111n), 144115188077953020);
shouldBe(Number(0b1000000000000000000000000000000000000000000000000000000001n), 144115188075855870);
shouldBe(Number(0b1000000000000000000000000000000000000000000000000001000000n), 144115188075855940);
shouldBe(Number(0b1000000000000000000000000000000000000000000000000001000001n), 144115188075855940);
shouldBe(Number(0b1000000000000000000000000000000000000000000000000001000001n), 144115188075855940);
shouldBe(Number(0b10000000000000000000000000000000000000000000000000001n), 4503599627370497);
shouldBe(Number(0b100000000000000000000000000000000000000000000000000010n), 9007199254740994);
shouldBe(Number(0b100000000000000000000000000000000000000000000000000011n), 9007199254740996);

// Around Infinity.
shouldBe(Number(2n ** (1024n - 1n)), 8.98846567431158e+307);
shouldBe(Number(2n ** (1024n - 1n)), 8.98846567431158e+307);
shouldBe(Number(0x1fffffffffffffn << 971n), Number.MAX_VALUE);
shouldBe(Number(0x20000000000000n << 971n), Infinity);
shouldBe(Number(0x1ffffffffffffffn << 966n), 8.98846567431158e+307);
shouldBe(Number(0x3fffffffffffffn << 970n), Infinity);
shouldBe(Number(0x3fffffffffffffn << 969n), 8.98846567431158e+307);

shouldBe(Number(-(2n ** (1024n - 1n))), -8.98846567431158e+307);
shouldBe(Number(-(2n ** (1024n - 1n))), -8.98846567431158e+307);
shouldBe(Number(-0x1fffffffffffffn << 971n), -Number.MAX_VALUE);
shouldBe(Number(-0x20000000000000n << 971n), -Infinity);
shouldBe(Number(-0x1ffffffffffffffn << 966n), -8.98846567431158e+307);
shouldBe(Number(-0x3fffffffffffffn << 970n), -Infinity);
shouldBe(Number(-0x3fffffffffffffn << 969n), -8.98846567431158e+307);

shouldBe(+new Number(0n), +new Number(0));

// Around Int32 max/min.
shouldBe(+new Number(0x7fffffffn), +new Number(0x7fffffff));
shouldBe(+new Number(0x80000000n), +new Number(0x80000000));
shouldBe(+new Number(0x7fffffffn + 1n), +new Number(0x80000000));
shouldBe(+new Number(0x7fffffffn + 2n), +new Number(0x80000001));
shouldBe(+new Number(-0x7fffffffn - 1n), +new Number(-0x80000000));
shouldBe(+new Number(-0x7fffffffn - 2n), +new Number(-0x80000001));

// Around Int52 max/min.
shouldBe(+new Number(0x20000000000000n), +new Number(9007199254740992));
shouldBe(+new Number(0x20000000000000n + 1n), +new Number(9007199254740992));
shouldBe(+new Number(0x20000000000000n + 2n), +new Number(9007199254740994));
shouldBe(+new Number(0x20000000000000n + 3n), +new Number(9007199254740996));
shouldBe(+new Number(0x20000000000000n + 4n), +new Number(9007199254740996));

shouldBe(+new Number(-(0x20000000000000n)), +new Number(-9007199254740992));
shouldBe(+new Number(-(0x20000000000000n + 1n)), +new Number(-9007199254740992));
shouldBe(+new Number(-(0x20000000000000n + 2n)), +new Number(-9007199254740994));
shouldBe(+new Number(-(0x20000000000000n + 3n)), +new Number(-9007199254740996));
shouldBe(+new Number(-(0x20000000000000n + 4n)), +new Number(-9007199254740996));

// mantissa rounding.
shouldBe(+new Number(0x3fffffffffffffn), +new Number(18014398509481984));
shouldBe(+new Number(-0x3fffffffffffffn), +new Number(-18014398509481984));
shouldBe(+new Number(0b1000000000000000000000000000000000000111111111111111111111n), +new Number(144115188077953020));
shouldBe(+new Number(0b1000000000000000000000000000000000000000000000000000000001n), +new Number(144115188075855870));
shouldBe(+new Number(0b1000000000000000000000000000000000000000000000000001000000n), +new Number(144115188075855940));
shouldBe(+new Number(0b1000000000000000000000000000000000000000000000000001000001n), +new Number(144115188075855940));
shouldBe(+new Number(0b1000000000000000000000000000000000000000000000000001000001n), +new Number(144115188075855940));
shouldBe(+new Number(0b10000000000000000000000000000000000000000000000000001n), +new Number(4503599627370497));
shouldBe(+new Number(0b100000000000000000000000000000000000000000000000000010n), +new Number(9007199254740994));
shouldBe(+new Number(0b100000000000000000000000000000000000000000000000000011n), +new Number(9007199254740996));

// Around Infinity.
shouldBe(+new Number(2n ** (1024n - 1n)), +new Number(8.98846567431158e+307));
shouldBe(+new Number(2n ** (1024n - 1n)), +new Number(8.98846567431158e+307));
shouldBe(+new Number(0x1fffffffffffffn << 971n), +new Number(Number.MAX_VALUE));
shouldBe(+new Number(0x20000000000000n << 971n), +new Number(Infinity));
shouldBe(+new Number(0x1ffffffffffffffn << 966n), +new Number(8.98846567431158e+307));
shouldBe(+new Number(0x3fffffffffffffn << 970n), +new Number(Infinity));
shouldBe(+new Number(0x3fffffffffffffn << 969n), +new Number(8.98846567431158e+307));

shouldBe(+new Number(-(2n ** (1024n - 1n))), +new Number(-8.98846567431158e+307));
shouldBe(+new Number(-(2n ** (1024n - 1n))), +new Number(-8.98846567431158e+307));
shouldBe(+new Number(-0x1fffffffffffffn << 971n), +new Number(-Number.MAX_VALUE));
shouldBe(+new Number(-0x20000000000000n << 971n), +new Number(-Infinity));
shouldBe(+new Number(-0x1ffffffffffffffn << 966n), +new Number(-8.98846567431158e+307));
shouldBe(+new Number(-0x3fffffffffffffn << 970n), +new Number(-Infinity));
shouldBe(+new Number(-0x3fffffffffffffn << 969n), +new Number(-8.98846567431158e+307));
