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
 *  File Name:          label-002.js
 *  ECMA Section:
 *  Description:        Labeled statements
 *
 *  Labeled break and continue within a for-in loop.
 *
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "label-002";
    var VERSION = "ECMA_2";
    var TITLE   = "Labeled statements";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    LabelTest( { p1:"hi,", p2:" norris" }, "hi, norris", " norrishi," );
    LabelTest( { 0:"zero", 1:"one" }, "zeroone", "onezero" );

    LabelTest2( { p1:"hi,", p2:" norris" }, "hi,", " norris" );
    LabelTest2( { 0:"zero", 1:"one" }, "zero", "one" );

    test();

    function LabelTest( object, expect1, expect2 ) {
        result = "";

        yoohoo:  { for ( property in object ) { result += object[property]; }; break yoohoo };

        testcases[tc++] = new TestCase(
            SECTION,
            "yoohoo: for ( property in object ) { result += object[property]; } break yoohoo }",
            true,
            result == expect1 || result == expect2 );
    }

    function LabelTest2( object, expect1, expect2 ) {
        result = "";

        yoohoo:  { for ( property in object ) { result += object[property]; break yoohoo } }; ;

        testcases[tc++] = new TestCase(
            SECTION,
            "yoohoo: for ( property in object ) { result += object[property]; break yoohoo }}",
            true,
            result == expect1 || result == expect2 );
    }

