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

function testRegExp(pattern, string, expectedParseError, expectedMatch) {
    const r = new RegExp(pattern);
    let actualResult = null;
    let actualParseError = null;
    try {
        actualResult = r.exec(string);
    } catch(e) {
        actualParseError = e;
    }

    if (expectedParseError && expectedParseError != actualParseError)
        throw("Expected \"" + expectedParseError + "\", but got \"" + actualParseError + "\"");

    if (expectedMatch === undefined) {
        if (actualResult !== null)
            throw("Expected " + r + ".exec(\"" + string + "\") to be null");
    } else {
        if (actualResult === null || actualResult[0] !== expectedMatch)
            throw("Expected " + r + ".exec(\"" + string + "\")[0] to be " + expectedMatch + ".");
    }
}

testRegExp("a{0,4294967295}", "a", undefined, "a");
testRegExp("a{0,4294967296}", "a", undefined, "a");
testRegExp("^a{0,4294967296}$", "a{0,4294967296}", undefined, undefined);
testRegExp("(?:a{0,340282366920}?){0,1}a", "aa", undefined, "aa");
testRegExp("((.{100000000})*.{2100000000})+", "x", "SyntaxError: Invalid regular expression: pattern exceeds string length limits", undefined);
