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
'Test regular expression processing with alternatives.'
);

var s1 = "<p>content</p>";
shouldBe('s1.match(/<((\\/([^>]+)>)|(([^>]+)>))/)', '["<p>","p>",undefined,undefined,"p>","p"]');
shouldBe('s1.match(/<((ABC>)|(\\/([^>]+)>)|(([^>]+)>))/)', '["<p>","p>",undefined,undefined,undefined,"p>","p"]');
shouldBe('s1.match(/<(a|\\/p|.+?)>/)', '["<p>","p"]');

// Force YARR to use Interpreter by using iterative parentheses
shouldBe('s1.match(/<((\\/([^>]+)>)|((([^>])+)>))/)', '["<p>","p>",undefined,undefined,"p>","p","p"]');
shouldBe('s1.match(/<((ABC>)|(\\/([^>]+)>)|((([^>])+)>))/)', '["<p>","p>",undefined,undefined,undefined,"p>","p","p"]');
shouldBe('s1.match(/<(a|\\/p|(.)+?)>/)', '["<p>","p","p"]');

// Force YARR to use Interpreter by using backreference
var s2 = "<p>p</p>";
shouldBe('s2.match(/<((\\/([^>]+)>)|(([^>]+)>))\\5/)', '["<p>p","p>",undefined,undefined,"p>","p"]');
shouldBe('s2.match(/<((ABC>)|(\\/([^>]+)>)|(([^>]+)>))\\6/)', '["<p>p","p>",undefined,undefined,undefined,"p>","p"]');
shouldBe('s2.match(/<(a|\\/p|.+?)>\\1/)', '["<p>p","p"]');
