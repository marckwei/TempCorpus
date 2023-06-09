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

// Regression test for 159744.  This test should not crash or throw an exception.

function testRegExp(pattern, flags, string, result)
{
    let r = new RegExp(pattern, flags);
    if (r.exec(string) !== result)
        throw("Expected " + r + "exec(\"" + string + "\") to return " + result + ".");
}

testRegExp("(\\w+)(?:\\s(\\1)){1100000000,}", "i", "word Word WORD WoRd", null);
testRegExp("\\d{4,}.{1073741825}", "", "1234567\u1234", null);
testRegExp("(?:abcd){2148473648,}", "", "abcdabcdabcd", null);
testRegExp("(?:abcd){2148473648,}", "y", "abcdabcdabcd", null);
testRegExp("(ab){1073741825,}(xy){1073741825,}", "", "abxyabxy", null);
