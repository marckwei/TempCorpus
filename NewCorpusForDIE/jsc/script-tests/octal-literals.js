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

description("Make sure that we correctly handle octal literals");

shouldBe("0o0", "0");
shouldBe("0o1", "1");
shouldBe("0O1", "1");
shouldBe("0o000000000000", "0");
shouldThrow("0O8");
shouldThrow("0oa");
shouldThrow("0o0.0");
shouldThrow("x=0o1y=42");
shouldBe("0o12", "0xa");
shouldBe("0o110642547", "0x01234567");
shouldBe("0o21152746757", "0x89abcdef");
shouldBe("0o70000000000000000000000000000000000000000000000000000000", "3.00300673152188e+256");

// Try 53 bits
shouldBe("0o377777777777777776", "9007199254740990");
shouldBe("0o377777777777777777", "9007199254740991");

// 54 bits and above should add zeroes
shouldBe("0o777777777777777776", "18014398509481982");
shouldBe("0o777777777777777777", "18014398509481984");

shouldBeTrue("!!0o1");
shouldBeFalse("!!0o0");

shouldBe("Number('0o0')", "0");
shouldBe("Number('0o1')", "1");
shouldBe("Number('0O1')", "1");
shouldBe("Number('0o00000000000000000')", "0");
shouldBeNaN("Number('0O8')");
shouldBeNaN("Number('0oa')");
shouldBeNaN("Number('0o0.0')");
shouldBe("Number('0o77')", "0x3f");
shouldBe("Number('0o110642547')", "0x01234567");
shouldBe("Number('0o21152746757')", "0x89abcdef");

// Try 53 bits
shouldBe("Number('0o377777777777777776')", "9007199254740990");
shouldBe("Number('0o377777777777777777')", "9007199254740991");

// 54 bits and above should add zeroes
shouldBe("Number('0o777777777777777776')", "18014398509481982");
shouldBe("Number('0o777777777777777777')", "18014398509481984");

shouldBeTrue("!!Number('0o1')");
shouldBeFalse("!!Number('0o0')");
