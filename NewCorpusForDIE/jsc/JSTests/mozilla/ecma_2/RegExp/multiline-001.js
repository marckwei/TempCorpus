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
 *  File Name:          RegExp/multiline-001.js
 *  ECMA Section:
 *  Description:        Based on ECMA 2 Draft 7 February 1999
 *
 *  Date:               19 February 1999
 */

    var SECTION = "RegExp/multiline-001";
    var VERSION = "ECMA_2";
    var TITLE   = "RegExp: multiline flag";
    var BUGNUMBER="343901";

    startTest();

    var woodpeckers = "ivory-billed\ndowny\nhairy\nacorn\nyellow-bellied sapsucker\n" +
        "northern flicker\npileated\n";

    AddRegExpCases( /.*[y]$/m, woodpeckers, woodpeckers.indexOf("downy"), ["downy"] );

    AddRegExpCases( /.*[d]$/m, woodpeckers, woodpeckers.indexOf("ivory-billed"), ["ivory-billed"] );

    test();


function AddRegExpCases
    ( regexp, pattern, index, matches_array ) {

    // prevent a runtime error

    if ( regexp.exec(pattern) == null || matches_array == null ) {
        AddTestCase(
            regexp + ".exec(" + pattern +")",
            matches_array,
            regexp.exec(pattern) );

        return;
    }

    AddTestCase(
        regexp.toString() + ".exec(" + pattern +").length",
        matches_array.length,
        regexp.exec(pattern).length );

    AddTestCase(
        regexp.toString() + ".exec(" + pattern +").index",
        index,
        regexp.exec(pattern).index );

    AddTestCase(
        regexp + ".exec(" + pattern +").input",
        pattern,
        regexp.exec(pattern).input );


    for ( var matches = 0; matches < matches_array.length; matches++ ) {
        AddTestCase(
            regexp + ".exec(" + pattern +")[" + matches +"]",
            matches_array[matches],
            regexp.exec(pattern)[matches] );
    }
}
