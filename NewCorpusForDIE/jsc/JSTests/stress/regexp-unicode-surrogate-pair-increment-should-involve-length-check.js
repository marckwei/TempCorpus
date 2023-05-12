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

// This test checks for proper incrementing around / over individual surrogates and surrogate pairs.
// This test should run without crashing.

function testRegExpMatch(re, str)
{
    for (let i = 0; i < 100; ++i) {
        let match = re.exec(str);
        if (!match || match[0] != str) {
            print(match);
            throw "Expected " + re + " to match \"" + str + "\" but it didn't";
        }
    }
}

function testRegExpNotMatch(re, str)
{
    for (let i = 0; i < 100; ++i) {
        let match = re.exec(str);
        if (match) {
            print(match);
            throw "Expected " + re + " to match \"" + str + "\" but it didn't";
        }
    }
}

let testString = "\ud800\ud800\udc00";
let greedyRegExp = /([^x]+)[^]*\1([^])/u;

testRegExpNotMatch(greedyRegExp, testString);

let nonGreedyRegExp = /(.*[^x]+?)[^]*([^])/u;

testRegExpMatch(nonGreedyRegExp, testString);

let testString2 = "\ud800\ud800\udc00Test\udc00123";
let backtrackGreedyRegExp = /.*[\x20-\udffff].\w*.\d{3}/u;

testRegExpMatch(backtrackGreedyRegExp, testString2);

let nonGreedyRegExp2 = /(.*[^x]+?)[^]*([1])/u;

testRegExpNotMatch(nonGreedyRegExp2, testString);
