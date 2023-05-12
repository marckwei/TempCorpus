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

description('This test case tests the Number constructor.');

// isFinite
shouldBeTrue('Number.isFinite(0)');
shouldBeTrue('Number.isFinite(-0)');
shouldBeTrue('Number.isFinite(1)');
shouldBeTrue('Number.isFinite(-1)');
shouldBeTrue('Number.isFinite(1.0)');
shouldBeTrue('Number.isFinite(1.1)');
shouldBeTrue('Number.isFinite(-1.0)');
shouldBeTrue('Number.isFinite(-1.1)');
shouldBeTrue('Number.isFinite(Number.MAX_SAFE_INTEGER)');
shouldBeTrue('Number.isFinite(Number.MIN_SAFE_INTEGER)');
shouldBeTrue('Number.isFinite(Number.MAX_VALUE)');
shouldBeTrue('Number.isFinite(Number.MIN_VALUE)');
shouldBeFalse('Number.isFinite()');
shouldBeFalse('Number.isFinite({})');
shouldBeFalse('Number.isFinite([])');
shouldBeFalse('Number.isFinite(true)');
shouldBeFalse('Number.isFinite(false)');
shouldBeFalse('Number.isFinite(null)');
shouldBeFalse('Number.isFinite(Number.NaN)');
shouldBeFalse('Number.isFinite(Number.POSITIVE_INFINITY)');
shouldBeFalse('Number.isFinite(Number.NEGATIVE_INFINITY)');
shouldThrow('Number.isFinite(foo)');

// isInteger
shouldBeTrue('Number.isInteger(0)');
shouldBeTrue('Number.isInteger(-0)');
shouldBeTrue('Number.isInteger(1)');
shouldBeTrue('Number.isInteger(-1)');
shouldBeTrue('Number.isInteger(1.0)');
shouldBeTrue('Number.isInteger(-1.0)');
shouldBeTrue('Number.isInteger(Number.MAX_SAFE_INTEGER)');
shouldBeTrue('Number.isInteger(Number.MIN_SAFE_INTEGER)');
shouldBeTrue('Number.isInteger(Number.MAX_VALUE)');
shouldBeFalse('Number.isInteger(Number.MIN_VALUE)');
shouldBeFalse('Number.isInteger(1.1)');
shouldBeFalse('Number.isInteger(-1.1)');
shouldBeFalse('Number.isInteger()');
shouldBeFalse('Number.isInteger({})');
shouldBeFalse('Number.isInteger([])');
shouldBeFalse('Number.isInteger(true)');
shouldBeFalse('Number.isInteger(false)');
shouldBeFalse('Number.isInteger(null)');
shouldBeFalse('Number.isInteger(Number.NaN)');
shouldBeFalse('Number.isInteger(Number.POSITIVE_INFINITY)');
shouldBeFalse('Number.isInteger(Number.NEGATIVE_INFINITY)');
shouldThrow('Number.isInteger(foo)');

// isNaN
shouldBeTrue('Number.isNaN(Number.NaN)');
shouldBeFalse('Number.isNaN(0)');
shouldBeFalse('Number.isNaN(-0)');
shouldBeFalse('Number.isNaN(1)');
shouldBeFalse('Number.isNaN(-1)');
shouldBeFalse('Number.isNaN(1.0)');
shouldBeFalse('Number.isNaN(1.1)');
shouldBeFalse('Number.isNaN(-1.0)');
shouldBeFalse('Number.isNaN(-1.1)');
shouldBeFalse('Number.isNaN()');
shouldBeFalse('Number.isNaN({})');
shouldBeFalse('Number.isNaN([])');
shouldBeFalse('Number.isNaN(true)');
shouldBeFalse('Number.isNaN(false)');
shouldBeFalse('Number.isNaN(null)');
shouldBeFalse('Number.isNaN(Number.POSITIVE_INFINITY)');
shouldBeFalse('Number.isNaN(Number.NEGATIVE_INFINITY)');
shouldBeFalse('Number.isNaN(Number.MAX_SAFE_INTEGER)');
shouldBeFalse('Number.isNaN(Number.MIN_SAFE_INTEGER)');
shouldBeFalse('Number.isNaN(Number.MAX_VALUE)');
shouldBeFalse('Number.isNaN(Number.MIN_VALUE)');
shouldThrow('Number.isNaN(foo)');

// isSafeInteger
shouldBeTrue('Number.isSafeInteger(0)');
shouldBeTrue('Number.isSafeInteger(-0)');
shouldBeTrue('Number.isSafeInteger(1)');
shouldBeTrue('Number.isSafeInteger(-1)');
shouldBeTrue('Number.isSafeInteger(1.0)');
shouldBeTrue('Number.isSafeInteger(-1.0)');
shouldBeTrue('Number.isSafeInteger(Number.MAX_SAFE_INTEGER)');
shouldBeTrue('Number.isSafeInteger(Number.MAX_SAFE_INTEGER - 1)');
shouldBeTrue('Number.isSafeInteger(Number.MIN_SAFE_INTEGER)');
shouldBeTrue('Number.isSafeInteger(Number.MIN_SAFE_INTEGER + 1)');
shouldBeFalse('Number.isSafeInteger(1.1)');
shouldBeFalse('Number.isSafeInteger(-1.1)');
shouldBeFalse('Number.isSafeInteger()');
shouldBeFalse('Number.isSafeInteger({})');
shouldBeFalse('Number.isSafeInteger([])');
shouldBeFalse('Number.isSafeInteger(true)');
shouldBeFalse('Number.isSafeInteger(false)');
shouldBeFalse('Number.isSafeInteger(null)');
shouldBeFalse('Number.isSafeInteger(Number.NaN)');
shouldBeFalse('Number.isSafeInteger(Number.MAX_VALUE)');
shouldBeFalse('Number.isSafeInteger(Number.MIN_VALUE)');
shouldBeFalse('Number.isSafeInteger(Number.POSITIVE_INFINITY)');
shouldBeFalse('Number.isSafeInteger(Number.NEGATIVE_INFINITY)');
shouldBeFalse('Number.isSafeInteger(Number.MAX_SAFE_INTEGER + 1)');
shouldBeFalse('Number.isSafeInteger(Number.MIN_SAFE_INTEGER - 1)');
shouldThrow('Number.isSafeInteger(foo)');

// parseFloat
shouldBe('Number.parseFloat("0")', '0');
shouldBe('Number.parseFloat("-0")', '-0');
shouldBe('Number.parseFloat("1")', '1');
shouldBe('Number.parseFloat("-1")', '-1');
shouldBe('Number.parseFloat("1.1")', '1.1');
shouldBe('Number.parseFloat("-1.1")', '-1.1');
shouldBe('Number.parseFloat("10E6")', '10E6');
shouldBe('Number.parseFloat("0xA")', '0');
shouldBe('Number.parseFloat("050")', '50');
shouldBe('Number.parseFloat(050)', '40');
shouldBe('Number.parseFloat("0x20")', '0');
shouldBe('Number.parseFloat(0x20)', '32');
shouldBe('Number.parseFloat()', 'NaN');
shouldBe('Number.parseFloat({})', 'NaN');
shouldBe('Number.parseFloat([])', 'NaN');
shouldBe('Number.parseFloat(true)', 'NaN');
shouldBe('Number.parseFloat(false)', 'NaN');
shouldBe('Number.parseFloat(null)', 'NaN');
shouldBe('Number.parseFloat(undefined)', 'NaN');
shouldBe('Number.parseFloat(Number.NaN)', 'NaN');
shouldBe('Number.parseFloat("1.7976931348623157E308")', '1.7976931348623157e+308');
shouldBe('Number.parseFloat("1.80E308")', "Infinity");
shouldBe('Number.parseFloat("5E-324")', '5e-324');
shouldBe('Number.parseFloat("5E-325")', '0');
shouldBe('Number.parseFloat("20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")', '2e+307');
shouldBe('Number.parseFloat("200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")', 'Infinity');
shouldThrow('Number.parseFloat(foo)');

// parseInt
shouldBe('Number.parseInt', 'parseInt');
shouldBe('var numberParseInt = Number.parseInt; parseInt = function () {}; numberParseInt', 'Number.parseInt');
shouldBe('Number.parseInt.length', '2');
shouldBe('Number.parseInt("0")', '0');
shouldBe('Number.parseInt("-0")', '-0');
shouldBe('Number.parseInt("1")', '1');
shouldBe('Number.parseInt("-1")', '-1');
shouldBe('Number.parseInt("1.1")', '1');
shouldBe('Number.parseInt("-1.1")', '-1');
shouldBe('Number.parseInt("10E6")', '10');
shouldBe('Number.parseInt("0xA")', '10');
shouldBe('Number.parseInt("050")', '50');
shouldBe('Number.parseInt("050", 8)', '40');
shouldBe('Number.parseInt(050)', '40');
shouldBe('Number.parseInt("0x20")', '32');
shouldBe('Number.parseInt("0x20", 16)', '32');
shouldBe('Number.parseInt("20", 16)', '32');
shouldBe('Number.parseInt(0x20)', '32');
shouldBe('Number.parseInt()', 'NaN');
shouldBe('Number.parseInt({})', 'NaN');
shouldBe('Number.parseInt([])', 'NaN');
shouldBe('Number.parseInt(true)', 'NaN');
shouldBe('Number.parseInt(false)', 'NaN');
shouldBe('Number.parseInt(null)', 'NaN');
shouldBe('Number.parseInt(undefined)', 'NaN');
shouldBe('Number.parseInt(Number.NaN)', 'NaN');
shouldBe('Number.parseInt("1.7976931348623157E308")', '1');
shouldBe('Number.parseInt("1.80E308")', '1');
shouldBe('Number.parseInt("5E-324")', '5');
shouldBe('Number.parseInt("5E-325")', '5');
shouldBe('Number.parseInt("20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")', '2e+307');
shouldBe('Number.parseInt("200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")', 'Infinity');
shouldThrow('Number.parseInt(foo)');
