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
 *  This uses variables and objects as case expressions in switch statements.
 * This verifies a bunch of bugs:
 *
 * http://scopus.mcom.com/bugsplat/show_bug.cgi?id=315988
 * http://scopus.mcom.com/bugsplat/show_bug.cgi?id=315975
 * http://scopus.mcom.com/bugsplat/show_bug.cgi?id=315954
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 *
 */
    var SECTION = "switch-003";
    var VERSION = "ECMA_2";
    var TITLE   = "The switch statement";
    var BUGNUMBER= "315988";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    ONE = new Number(1);
    ZERO = new Number(0);
    var A = new String("A");
    var B = new String("B");
    TRUE = new Boolean( true );
    FALSE = new Boolean( false );
    UNDEFINED  = void 0;
    NULL = null;

    SwitchTest( ZERO, "ZERO" );
    SwitchTest( NULL, "NULL" );
    SwitchTest( UNDEFINED, "UNDEFINED" );
    SwitchTest( FALSE, "FALSE" );
    SwitchTest( false,  "false" );
    SwitchTest( 0,      "0" );

    SwitchTest ( TRUE, "TRUE" );
    SwitchTest( 1,     "1" );
    SwitchTest( ONE,   "ONE" );
    SwitchTest( true,  "true" );

    SwitchTest( "a",   "a" );
    SwitchTest( A,     "A" );
    SwitchTest( "b",   "b" );
    SwitchTest( B,     "B" );

    SwitchTest( new Boolean( true ), "default" );
    SwitchTest( new Boolean(false ), "default" );
    SwitchTest( new String( "A" ),   "default" );
    SwitchTest( new Number( 0 ),     "default" );

    test();

    function SwitchTest( input, expect ) {
        var result = "";

        switch ( input ) {
            default:   result += "default"; break;
            case "a":  result += "a";       break;
            case "b":  result += "b";       break;
            case A:    result += "A";       break;
            case B:    result += "B";       break;
            case new Boolean(true): result += "new TRUE";   break;
            case new Boolean(false): result += "new FALSE"; break;
            case NULL: result += "NULL";    break;
            case UNDEFINED: result += "UNDEFINED"; break;
            case true: result += "true";    break;
            case false: result += "false";  break;
            case TRUE:  result += "TRUE";   break;
            case FALSE: result += "FALSE";  break;
            case 0:    result += "0";       break;
            case 1:    result += "1";       break;
            case new Number(0) : result += "new ZERO";  break;
            case new Number(1) : result += "new ONE";   break;
            case ONE:  result += "ONE";     break;
            case ZERO: result += "ZERO";    break;
        }

        testcases[tc++] = new TestCase(
            SECTION,
            "switch with no breaks:  input is " + input,
            expect,
            result );
    }
