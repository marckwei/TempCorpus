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
 *  File Name:          switch-003.js
 *  ECMA Section:
 *  Description:        The switch Statement
 *
 *  Attempt to verify that case statements are evaluated in source order
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 *
 */
    var SECTION = "switch-003";
    var VERSION = "ECMA_2";
    var TITLE   = "The switch statement";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    SwitchTest( "a", "abc" );
    SwitchTest( "b", "bc" );
    SwitchTest( "c", "c" );
    SwitchTest( "d", "*abc" );
    SwitchTest( "v", "*abc" );
    SwitchTest( "w", "w*abc" );
    SwitchTest( "x", "xw*abc" );
    SwitchTest( "y", "yxw*abc" );
    SwitchTest( "z", "zyxw*abc" );
//    SwitchTest( new java.lang.String("z"), "*abc" );

    test();

    function SwitchTest( input, expect ) {
        var result = "";

        switch ( input ) {
            case "z": result += "z";
            case "y": result += "y";
            case "x": result += "x";
            case "w": result += "w";
            default: result += "*";
            case "a": result += "a";
            case "b": result += "b";
            case "c": result += "c";
        }

        testcases[tc++] = new TestCase(
            SECTION,
            "switch with no breaks:  input is " + input,
            expect,
            result );
    }