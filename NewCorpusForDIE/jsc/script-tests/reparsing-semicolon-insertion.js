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
"This test checks that automatic semicolon insertion for parsing and reparsing agree. In a debug build, this test will fail with an assertion failure if they do not."
);

// According to the ECMA spec, these should all be syntax errors. However, the
// pre-existing behaviour of JavaScriptCore has always been to accept them. If
// JavaScriptCore is changed so that these are syntax errors in the future, then
// this test can simply be changed to reflect that.

// It is important that the closing braces be on the same line as the commas, so
// that a newline doesn't act as a terminator when lexing inbetween.

function commaTest() { a = 1 }

shouldBeUndefined("commaTest()");

function varCommaTest() { var a = 1 }

shouldBeUndefined("varCommaTest()");

function constCommaTest() { const a = 1 }

shouldBeUndefined("constCommaTest()");

function commaParenTest() { (1) }

shouldBeUndefined("commaParenTest()");

function commaParenThrowTest() { (x) }

shouldThrow("commaParenThrowTest()");
