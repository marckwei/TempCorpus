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

description("Make sure that we correctly handle binary literals");

shouldBe("0b0", "0");
shouldBe("0b1", "1");
shouldBe("0B1", "1");
shouldBe("0b00000000000000000000000000000000", "0");
shouldThrow("0B2");
shouldThrow("0ba");
shouldThrow("0b0.0");
shouldThrow("x=0b1y=42");
shouldBe("0b1010", "0xa");
shouldBe("0b00000001001000110100010101100111", "0x01234567");
shouldBe("0b10001001101010111100110111101111", "0x89abcdef");
shouldBe("0o100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "3.00300673152188e+256");

// Try 53 bits
shouldBe("0b11111111111111111111111111111111111111111111111111110", "9007199254740990");
shouldBe("0b11111111111111111111111111111111111111111111111111111", "9007199254740991");

// 54 bits and above should add zeroes
shouldBe("0b111111111111111111111111111111111111111111111111111110", "18014398509481982");
shouldBe("0b111111111111111111111111111111111111111111111111111111", "18014398509481984");

shouldBeTrue("!!0b1");
shouldBeFalse("!!0b0");

shouldBe("Number('0b0')", "0");
shouldBe("Number('0b1')", "1");
shouldBe("Number('0B1')", "1");
shouldBe("Number('0b00000000000000000000000000000000')", "0");
shouldBeNaN("Number('0B2')");
shouldBeNaN("Number('0ba')");
shouldBeNaN("Number('0b0.0')");
shouldBe("Number('0b1010')", "0xa");
shouldBe("Number('0b00000001001000110100010101100111')", "0x01234567");
shouldBe("Number('0b10001001101010111100110111101111')", "0x89abcdef");

// Try 53 bits
shouldBe("Number('0b11111111111111111111111111111111111111111111111111110')", "9007199254740990");
shouldBe("Number('0b11111111111111111111111111111111111111111111111111111')", "9007199254740991");

// 54 bits and above should add zeroes
shouldBe("Number('0b111111111111111111111111111111111111111111111111111110')", "18014398509481982");
shouldBe("Number('0b111111111111111111111111111111111111111111111111111111')", "18014398509481984");

shouldBeTrue("!!Number('0b1')");
shouldBeFalse("!!Number('0b0')");
