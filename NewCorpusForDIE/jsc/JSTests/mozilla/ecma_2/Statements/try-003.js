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
 *  File Name:          try-003.js
 *  ECMA Section:
 *  Description:        The try statement
 *
 *  This test has a try with no catch, and a finally.
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "try-003";
    var VERSION = "ECMA_2";
    var TITLE   = "The try statement";
    var BUGNUMBER="http://scopus.mcom.com/bugsplat/show_bug.cgi?id=313585";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    // Tests start here.

    TrySomething( "x = \"hi\"", false );
    TrySomething( "throw \"boo\"", true );
    TrySomething( "throw 3", true );

    test();

    /**
     *  This function contains a try block with no catch block,
     *  but it does have a finally block.  Try to evaluate expressions
     *  that do and do not throw exceptions.
     */

    function TrySomething( expression, throwing ) {
        innerFinally = "FAIL: DID NOT HIT INNER FINALLY BLOCK";
        if (throwing) {
            outerCatch = "FAILED: NO EXCEPTION CAUGHT";
        } else {
            outerCatch = "PASS";
        }
        outerFinally = "FAIL: DID NOT HIT OUTER FINALLY BLOCK";

        try {
            try {
                eval( expression );
            } finally {
                innerFinally = "PASS";
            }
        } catch ( e  ) {
            if (throwing) {
                outerCatch = "PASS";
            } else {
                outerCatch = "FAIL: HIT OUTER CATCH BLOCK";
            }
        } finally {
            outerFinally = "PASS";
        }


        testcases[tc++] = new TestCase(
                SECTION,
                "eval( " + expression +" )",
                "PASS",
                innerFinally );
        testcases[tc++] = new TestCase(
                SECTION,
                "eval( " + expression +" )",
                "PASS",
                outerCatch );
        testcases[tc++] = new TestCase(
                SECTION,
                "eval( " + expression +" )",
                "PASS",
                outerFinally );


    }
