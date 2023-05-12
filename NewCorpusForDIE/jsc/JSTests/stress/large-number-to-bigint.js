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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

shouldThrow(() => {
    BigInt(Infinity);
}, `RangeError: Not an integer`);

shouldThrow(() => {
    BigInt(-Infinity);
}, `RangeError: Not an integer`);

shouldThrow(() => {
    BigInt(-NaN);
}, `RangeError: Not an integer`);

shouldThrow(() => {
    BigInt(0.42);
}, `RangeError: Not an integer`);

shouldThrow(() => {
    BigInt(-0.42);
}, `RangeError: Not an integer`);

shouldBe(BigInt(Number.MAX_SAFE_INTEGER), 9007199254740991n);
shouldBe(BigInt(Number.MIN_SAFE_INTEGER), -9007199254740991n);
shouldBe(BigInt(Number.MAX_SAFE_INTEGER + 1), 9007199254740992n);
shouldBe(BigInt(Number.MIN_SAFE_INTEGER - 1), -9007199254740992n);
shouldBe(BigInt(Number.MAX_SAFE_INTEGER - 1), 9007199254740990n);
shouldBe(BigInt(Number.MIN_SAFE_INTEGER + 1), -9007199254740990n);
shouldBe(BigInt(Number.MAX_VALUE), 0xfffffffffffff800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n);
shouldBe(BigInt(-Number.MAX_VALUE), -0xfffffffffffff800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n);

shouldBe(BigInt(0x1fffffffffffff), 9007199254740991n);
shouldBe(BigInt(0x1fffffffffffff00), 2305843009213693696n);
shouldBe(BigInt(0x1fffffffffffff000), 36893488147419099136n);
shouldBe(BigInt(0b111111111111111111111111111111111111111111111111111110000000000), 9223372036854774784n);
shouldBe(BigInt(0b1111111111111111111111111111111111111111111111111111100000000000), 18446744073709549568n);
shouldBe(BigInt(0b11111111111111111111111111111111111111111111111111111000000000000), 36893488147419099136n);
shouldBe(BigInt(-0x1fffffffffffff), -9007199254740991n);
shouldBe(BigInt(-0x1fffffffffffff00), -2305843009213693696n);
shouldBe(BigInt(-0x1fffffffffffff000), -36893488147419099136n);
shouldBe(BigInt(-0b111111111111111111111111111111111111111111111111111110000000000), -9223372036854774784n);
shouldBe(BigInt(-0b1111111111111111111111111111111111111111111111111111100000000000), -18446744073709549568n);
shouldBe(BigInt(-0b11111111111111111111111111111111111111111111111111111000000000000), -36893488147419099136n);
