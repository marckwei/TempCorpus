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
 *  File Name:          try-005.js
 *  ECMA Section:
 *  Description:        The try statement
 *
 *  This test has a try with one catch block but no finally.  Same
 *  as try-004, but the eval statement is called from a function, not
 *  directly from within the try block.
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "try-005";
    var VERSION = "ECMA_2";
    var TITLE   = "The try statement";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    TryToCatch( "Math.PI", Math.PI );
    TryToCatch( "Thrower(5)",   "Caught 5" );
    TryToCatch( "Thrower(\"some random exception\")", "Caught some random exception" );

    test();

    function Thrower( v ) {
        throw "Caught " + v;
    }
    function Eval( v ) {
        return eval( v );
    }

    /**
     *  Evaluate a string.  Catch any exceptions thrown.  If no exception is
     *  expected, verify the result of the evaluation.  If an exception is
     *  expected, verify that we got the right exception.
     */

    function TryToCatch( value, expect ) {
        try {
            result = Eval( value );
        } catch ( e ) {
            result = e;
        }

        testcases[tc++] = new TestCase(
            SECTION,
            "eval( " + value +" )",
            expect,
            result );
    }
