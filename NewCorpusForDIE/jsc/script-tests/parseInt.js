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

description('Tests for the parseInt function.');

shouldBe("parseInt.length", "2");
shouldBe('var origParseInt = parseInt; Number.parseInt = function () {}; origParseInt', 'parseInt');

// Simple hex & dec integer values.
shouldBe("parseInt('123')", '123');
shouldBe("parseInt('123x4')", '123');
shouldBe("parseInt('-123')", '-123');
shouldBe("parseInt('0x123')", '0x123');
shouldBe("parseInt('0x123x4')", '0x123');
shouldBe("parseInt('-0x123x4')", '-0x123');
shouldBe("parseInt('-')", 'Number.NaN');
shouldBe("parseInt('0x')", 'Number.NaN');
shouldBe("parseInt('-0x')", 'Number.NaN');

// These call default to base 10, unless radix is explicitly 16.
shouldBe("parseInt('123', undefined)", '123');
shouldBe("parseInt('123', null)", '123');
shouldBe("parseInt('123', 0)", '123');
shouldBe("parseInt('123', 10)", '123');
shouldBe("parseInt('123', 16)", '0x123');
// These call default to base 16, unless radix is explicitly 10.
shouldBe("parseInt('0x123', undefined)", '0x123');
shouldBe("parseInt('0x123', null)", '0x123');
shouldBe("parseInt('0x123', 0)", '0x123');
shouldBe("parseInt('0x123', 10)", '0');
shouldBe("parseInt('0x123', 16)", '0x123');

// Test edge cases for the Number.toString exponential ranges.
shouldBe("parseInt(Math.pow(10, 20))", '100000000000000000000');
shouldBe("parseInt(Math.pow(10, 21))", '1');
shouldBe("parseInt(Math.pow(10, -6))", '0');
shouldBe("parseInt(Math.pow(10, -7))", '1');
shouldBe("parseInt(-Math.pow(10, 20))", '-100000000000000000000');
shouldBe("parseInt(-Math.pow(10, 21))", '-1');
shouldBe("parseInt(-Math.pow(10, -6))", '-0');
shouldBe("parseInt(-Math.pow(10, -7))", '-1');

// Test correct handling for -0.
shouldBe("parseInt('0')", '0');
shouldBe("parseInt('-0')", '-0');
shouldBe("parseInt(0)", '0');
shouldBe("parseInt(-0)", '0');

// Test edge cases of our optimized int handling.
shouldBe("parseInt(2147483647)", '2147483647');
shouldBe("parseInt(2147483648)", '2147483648');
shouldBe("parseInt('2147483647')", '2147483647');
shouldBe("parseInt('2147483648')", '2147483648');

// Add test cases where the ToString/ToInt32 conversions throw.
var state;
var throwingRadix = { valueOf: function(){ state = "throwingRadix"; throw null; } };
var throwingString = { toString: function(){ state = "throwingString"; throw null; } };
shouldBe("state = null; try { parseInt('123', throwingRadix); } catch (e) {} state;", '"throwingRadix"');
shouldBe("state = null; try { parseInt(throwingString, throwingRadix); } catch (e) {} state;", '"throwingString"');
