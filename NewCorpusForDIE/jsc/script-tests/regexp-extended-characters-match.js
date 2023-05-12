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
"This test checks regular expressions using extended (> 255) characters and character classes."
);

shouldBe('(new RegExp("[\u0100-\u0101]")).exec("a")', 'null');
shouldBe('(new RegExp("[\u0100]")).exec("a")', 'null');
shouldBe('(new RegExp("\u0100")).exec("a")', 'null');
shouldBe('(new RegExp("[\u0061]")).exec("a").toString()', '"a"');
shouldBe('(new RegExp("[\u0100-\u0101a]")).exec("a").toString()', '"a"');
shouldBe('(new RegExp("[\u0100a]")).exec("a").toString()', '"a"');
shouldBe('(new RegExp("\u0061")).exec("a").toString()', '"a"');
shouldBe('(new RegExp("[a-\u0100]")).exec("a").toString()', '"a"');
shouldBe('(new RegExp("[\u0100]")).exec("\u0100").toString()', '"\u0100"');
shouldBe('(new RegExp("[\u0100-\u0101]")).exec("\u0100").toString()', '"\u0100"');
shouldBe('(new RegExp("\u0100")).exec("\u0100").toString()', '"\u0100"');
