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
 *  File Name:          RegExp/regress-001.js
 *  ECMA Section:       N/A
 *  Description:        Regression test case:
 *  JS regexp anchoring on empty match bug
 *  http://bugzilla.mozilla.org/show_bug.cgi?id=2157
 *
 *  Author:             christine@netscape.com
 *  Date:               19 February 1999
 */
    var SECTION = "RegExp/hex-001.js";
    var VERSION = "ECMA_2";
    var TITLE   = "JS regexp anchoring on empty match bug";
    var BUGNUMBER = "http://bugzilla.mozilla.org/show_bug.cgi?id=2157";

    startTest();

    AddRegExpCases( /a||b/(''),
                    "//a||b/('')",
                    1,
                    [''] );

    test();

function AddRegExpCases( regexp, str_regexp, length, matches_array ) {

    AddTestCase(
        "( " + str_regexp + " ).length",
        regexp.length,
        regexp.length );


    for ( var matches = 0; matches < matches_array.length; matches++ ) {
        AddTestCase(
            "( " + str_regexp + " )[" + matches +"]",
            matches_array[matches],
            regexp[matches] );
    }
}
