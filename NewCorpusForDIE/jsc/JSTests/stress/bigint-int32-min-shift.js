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

let int32min = -0x7fffffffn - 1n;
shouldBe(0n >> int32min, 0n);
shouldBe(0n >> (int32min + 1n), 0n);
shouldBe(0n << int32min, 0n);
shouldBe(0n << (int32min + 1n), 0n);
shouldBe(1n << int32min, 0n);
shouldBe(1n << (int32min + 1n), 0n);
shouldBe(-1n << int32min, -1n);
shouldBe(-1n << (int32min + 1n), -1n);
shouldBe(0x7fffffffn << int32min, 0n);
shouldBe(0x7fffffffn << (int32min + 1n), 0n);
shouldBe(0x7fffffffffffn << int32min, 0n);
shouldBe(0x7fffffffffffn << (int32min + 1n), 0n);
shouldBe(-0x7fffffffn << int32min, -1n);
shouldBe(-0x7fffffffn << (int32min + 1n), -1n);
shouldBe(-0x7fffffffffffn << int32min, -1n);
shouldBe(-0x7fffffffffffn << (int32min + 1n), -1n);
shouldThrow(() => {
    1n >> int32min;
}, `RangeError: Out of memory: BigInt generated from this operation is too big`);
shouldThrow(() => {
    -1n >> int32min;
}, `RangeError: Out of memory: BigInt generated from this operation is too big`);
shouldThrow(() => {
    0x7fffffffn >> int32min;
}, `RangeError: Out of memory: BigInt generated from this operation is too big`);
shouldThrow(() => {
    (-0x7fffffffn - 1n) >> int32min;
}, `RangeError: Out of memory: BigInt generated from this operation is too big`);
