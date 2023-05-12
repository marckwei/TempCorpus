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

function parseIntDouble(value) {
    return parseInt(value, 10);
}
noInline(parseIntDouble);

for (var i = 0; i < 1e5; ++i) {
    shouldBe(Object.is(parseIntDouble(-0.0), 0), true); // Not -0 since -0.0.toString() is "0".
    shouldBe(Object.is(parseIntDouble(-1.0), -1.0), true);
    shouldBe(Object.is(parseIntDouble(-0.01), -0), true);
    shouldBe(Object.is(parseIntDouble(-1.1), -1.0), true);
    shouldBe(Object.is(parseIntDouble(-1.0), -1.0), true);
    shouldBe(Object.is(parseIntDouble(-0.9), -0.0), true);
    shouldBe(Object.is(parseIntDouble(-1.000000001), -1.0), true);
    shouldBe(Object.is(parseIntDouble(-0.000000001), -1), true); // Since it is -1e-9.
    shouldBe(Object.is(parseIntDouble(0.000000001), 1), true); // Since it is 1e-9.
    shouldBe(Object.is(parseIntDouble(0.000001), 0), true);
    shouldBe(Object.is(parseIntDouble(0.000001), 0), true);
    shouldBe(Object.is(parseIntDouble(0.0000001), 1), true); // Since it is 1e-6.
    shouldBe(Object.is(parseIntDouble(-0.0000001), -1), true); // Since it is -1e-6.
    shouldBe(Object.is(parseIntDouble(1e+21), 1), true); // Since it is 1e+21.
    shouldBe(Object.is(parseIntDouble(1e+20), 1e+20), true);
    shouldBe(Object.is(parseIntDouble(NaN), NaN), true);
    shouldBe(Object.is(parseIntDouble(Infinity), NaN), true);
    shouldBe(Object.is(parseIntDouble(-Infinity), NaN), true);
}
