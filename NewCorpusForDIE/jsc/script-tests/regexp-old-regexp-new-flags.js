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

description(
'Test for ES6 RegExp construct a new RegExp from exiting RegExp pattern and new flags'
);

var re = new RegExp("Abc");
shouldBeTrue('re.test("   Abc   ")');
shouldBe('re.flags', '""');

re = new RegExp(re, "i");
shouldBeTrue('re.test(" ABC  ")');
shouldBe('re.flags', '"i"');

re = new RegExp(re, "");
shouldBeTrue('re.test("   Abc   ")');
shouldBe('re.flags', '""');

re = new RegExp(re, "iy");
shouldBe('re.exec("abcABCAbc").toString()', '"abc"');
shouldBe('re.exec("abcABCAbc").toString()', '"ABC"');
shouldBe('re.exec("abcABCAbc").toString()', '"Abc"');
shouldBe('re.flags', '"iy"');

re = new RegExp(re, "");
shouldBeFalse('re.test("abc")');

shouldThrow('new RegExp(re, "bad flags")', '"SyntaxError: Invalid flags supplied to RegExp constructor."');
