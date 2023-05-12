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
 *  File Name:          String/match-001.js
 *  ECMA Section:       15.6.4.9
 *  Description:        Based on ECMA 2 Draft 7 February 1999
 *
 *  Author:             christine@netscape.com
 *  Date:               19 February 1999
 */

/*
 *  String.match( regexp )
 *
 *  If regexp is not an object of type RegExp, it is replaced with result
 *  of the expression new RegExp(regexp). Let string denote the result of
 *  converting the this value to a string.  If regexp.global is false,
 *  return the result obtained by invoking RegExp.prototype.exec (see
 *  section 15.7.5.3) on regexp with string as parameter.
 *
 *  Otherwise, set the regexp.lastIndex property to 0 and invoke
 *  RegExp.prototype.exec repeatedly until there is no match. If there is a
 *  match with an empty string (in other words, if the value of
 *  regexp.lastIndex is left unchanged) increment regexp.lastIndex by 1.
 *  The value returned is an array with the properties 0 through n-1
 *  corresponding to the first element of the result of each matching
 *  invocation of RegExp.prototype.exec.
 *
 *  Note that the match function is intentionally generic; it does not
 *  require that its this value be a string object.  Therefore, it can be
 *  transferred to other kinds of objects for use as a method.
 */

    var SECTION = "String/match-001.js";
    var VERSION = "ECMA_2";
    var TITLE   = "String.prototype.match( regexp )";

    startTest();

    // the regexp argument is not a RegExp object
    // this is not a string object

    // cases in which the regexp global property is false

     AddRegExpCases( 3, "3",   "1234567890", 1, 2, ["3"] );

    // cases in which the regexp object global property is true

    AddGlobalRegExpCases( /34/g, "/34/g", "343443444",  3, ["34", "34", "34"] );
    AddGlobalRegExpCases( /\d{1}/g,  "/d{1}/g",  "123456abcde7890", 10,
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] );

    AddGlobalRegExpCases( /\d{2}/g,  "/d{2}/g",  "123456abcde7890", 5,
        ["12", "34", "56", "78", "90"] );

    AddGlobalRegExpCases( /\D{2}/g,  "/d{2}/g",  "123456abcde7890", 2,
        ["ab", "cd"] );

    test();


function AddRegExpCases(
    regexp, str_regexp, string, length, index, matches_array ) {

    AddTestCase(
        "( " + string  + " ).match(" + str_regexp +").length",
        length,
        string.match(regexp).length );

    AddTestCase(
        "( " + string + " ).match(" + str_regexp +").index",
        index,
        string.match(regexp).index );

    AddTestCase(
        "( " + string + " ).match(" + str_regexp +").input",
        string,
        string.match(regexp).input );

    for ( var matches = 0; matches < matches_array.length; matches++ ) {
        AddTestCase(
            "( " + string + " ).match(" + str_regexp +")[" + matches +"]",
            matches_array[matches],
            string.match(regexp)[matches] );
    }
}

function AddGlobalRegExpCases(
    regexp, str_regexp, string, length, matches_array ) {

    AddTestCase(
        "( " + string  + " ).match(" + str_regexp +").length",
        length,
        string.match(regexp).length );

    for ( var matches = 0; matches < matches_array.length; matches++ ) {
        AddTestCase(
            "( " + string + " ).match(" + str_regexp +")[" + matches +"]",
            matches_array[matches],
            string.match(regexp)[matches] );
    }
}
