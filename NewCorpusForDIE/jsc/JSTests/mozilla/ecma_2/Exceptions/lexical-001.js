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

/**
    File Name:          lexical-001.js
    CorrespondsTo:      ecma/LexicalConventions/7.2.js
    ECMA Section:       7.2 Line Terminators
    Description:        - readability
                        - separate tokens
                        - may occur between any two tokens
                        - cannot occur within any token, not even a string
                        - affect the process of automatic semicolon insertion.

                        white space characters are:
                        unicode     name            formal name     string representation
                        \u000A      line feed       <LF>            \n
                        \u000D      carriage return <CR>            \r

                        this test uses onerror to capture line numbers.  because
                        we use on error, we can only have one test case per file.

    Author:             christine@netscape.com
    Date:               11 september 1997
*/
    var SECTION = "lexical-001";
    var VERSION = "JS1_4";
    var TITLE   = "Line Terminators";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    var result = "Failed";
    var exception = "No exception thrown";
    var expect = "Passed";

    try {
        result = eval("\r\n\expect");
    } catch ( e ) {
        exception = e.toString();
    }

    testcases[tc++] = new TestCase(
        SECTION,
        "OBJECT = new Object; result = new OBJECT()" +
        " (threw " + exception +")",
        expect,
        result );

    test();
