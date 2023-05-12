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

// This test verifies that a Unicode regular expression does not read past the end of a string.
// It should run without a crash or throwing an exception.

function testRegExpInbounds(re, str, substrEnd)
{
    let subStr = str.substring(0, substrEnd);

    let match = subStr.match(re);

    if (match !== null && match[0] === str) 
        throw "Error: Read past end of a Unicode substring processing a Unicode RegExp";
    else if (match === null || match[0] !== subStr) {
        throw "Error: Didn't properly match a Unicode substring with a matching Unicode RegExp";
    }
}

testRegExpInbounds(/ab\u{10400}c\u{10a01}d|ab\u{10400}c\u{10a01}/iu, "ab\u{10428}c\u{10a01}d", 7);
testRegExpInbounds(/ab\u{10400}c\u{10a01}d|ab\u{10400}c\u{10a01}/iu, "ab\u{10428}c\u{10a01}d", 7);
testRegExpInbounds(/ab[\u{10428}x]c[\u{10a01}x]defg|ab\u{10428}c\u{10a01}def/u, "ab\u{10428}c\u{10a01}defg", 10);
testRegExpInbounds(/[\u{10428}x]abcd|\u{10428}abc/u, "\u{10428}abcdef", 5);
testRegExpInbounds(/ab\u{10400}c\u{10a01}[^d]|ab\u{10400}c\u{10a01}/iu, "ab\u{10428}c\u{10a01}X", 7);
testRegExpInbounds(/ab\u{10400}c\u{10a01}.|ab\u{10400}c\u{10a01}/iu, "ab\u{10428}c\u{10a01}d", 7);
testRegExpInbounds(/ab\u{10428}c\u{10a01}\u{10000}|ab\u{10428}c\u{10a01}/iu, "ab\u{10428}c\u{10a01}\u{10000}", 7);
testRegExpInbounds(/ab\u{10428}c\u{10a01}.|ab\u{10428}c\u{10a01}/u, "ab\u{10428}c\u{10a01}\u{10000}", 7);
testRegExpInbounds(/ab\u{10428}c\u{10a01}[^x]|ab\u{10428}c\u{10a01}/u, "ab\u{10428}c\u{10a01}\u{10000}", 7);
