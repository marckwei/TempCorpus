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
        throw new Error(`bad value: ${actual}, expected ${expected}`);
}

function testSurrogatePair(testString, expected) {
    for (var i = 0; i < testString.length; ++i)
        shouldBe(testString.codePointAt(i), expected[i]);
}
noInline(testSurrogatePair);

for (var i = 0; i < 1e5; ++i) {
    var testString = 'Cocoa';
    var expected = [
        67,
        111,
        99,
        111,
        97,
    ];
    testSurrogatePair(testString, expected);

    // "\uD842\uDFB7\u91ce\u5bb6"
    var testString = "𠮷野家";
    var expected = [
        0x20BB7,
        0xDFB7,
        0x91CE,
        0x5BB6,
    ];
    testSurrogatePair(testString, expected);

    var testString = "A\uD842";
    var expected = [
        0x0041,
        0xD842,
    ];
    testSurrogatePair(testString, expected);

    var testString = "A\uD842A";
    var expected = [
        0x0041,
        0xD842,
        0x0041,
    ];
    testSurrogatePair(testString, expected);

    var testString = "A\uD842\uDFB7";
    var expected = [
        0x0041,
        0x20BB7,
        0xDFB7,
    ];
    testSurrogatePair(testString, expected);

    var testString = "\uD842A\uDFB7";
    var expected = [
        0xD842,
        0x0041,
        0xDFB7,
    ];
    testSurrogatePair(testString, expected);

    var testString = "\uDFB7\uD842A";
    var expected = [
        0xDFB7,
        0xD842,
        0x0041,
    ];
    testSurrogatePair(testString, expected);
}
