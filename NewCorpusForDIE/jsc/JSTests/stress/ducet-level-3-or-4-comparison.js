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

var collator = new Intl.Collator('en-US');

shouldBe(collator.compare("ABC", "ABD Ã"), -1);
shouldBe(collator.compare("ABD Ã", "AbE"), -1);
shouldBe(collator.compare("AbE", "ABC"), 1);
shouldBe(collator.compare("ABC", "abc"), 1);
shouldBe(collator.compare("ABC", "ABC"), 0);
shouldBe(collator.compare("abc", "abc"), 0);
shouldBe(collator.compare("abc", "abC"), -1);

shouldBe(collator.compare("AB - AS Foobar", "AB - AS Pulheim KÃƒÂ¤ther"), -1);
shouldBe(collator.compare("AB - AS Pulheim KÃƒÂ¤ther", "Abz - Baz Qux"), -1);
shouldBe(collator.compare("Abz - Baz Qux", "AB - AS Foobar"), 1);
