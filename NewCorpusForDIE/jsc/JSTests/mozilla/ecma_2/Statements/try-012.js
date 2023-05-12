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
 *  File Name:          try-012.js
 *  ECMA Section:
 *  Description:        The try statement
 *
 *  This test has a try with no catch, and a finally.  This is like try-003,
 *  but throws from a finally block, not the try block.
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "try-012";
    var VERSION = "ECMA_2";
    var TITLE   = "The try statement";
    var BUGNUMBER="336872";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    // Tests start here.

    TrySomething( "x = \"hi\"", true );
    TrySomething( "throw \"boo\"", true );
    TrySomething( "throw 3", true );

    test();

    /**
     *  This function contains a try block with no catch block,
     *  but it does have a finally block.  Try to evaluate expressions
     *  that do and do not throw exceptions.
     *
     * The productioni TryStatement Block Finally is evaluated as follows:
     * 1. Evaluate Block
     * 2. Evaluate Finally
     * 3. If Result(2).type is normal return result 1 (in the test case, result 1 has
     *    the completion type throw)
     * 4. return result 2 (does not get hit in this case)
     *
     */

    function TrySomething( expression, throwing ) {
        innerFinally = "FAIL: DID NOT HIT INNER FINALLY BLOCK";
        if (throwing) {
            outerCatch = "FAILED: NO EXCEPTION CAUGHT";
        } else {
            outerCatch = "PASS";
        }
        outerFinally = "FAIL: DID NOT HIT OUTER FINALLY BLOCK";


        // If the inner finally does not throw an exception, the result
        // of the try block should be returned.  (Type of inner return
        // value should be throw if finally executes correctly

        try {
            try {
                throw 0;
            } finally {
                innerFinally = "PASS";
                eval( expression );
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
                "eval( " + expression +" ): evaluated inner finally block",
                "PASS",
                innerFinally );
        testcases[tc++] = new TestCase(
                SECTION,
                "eval( " + expression +" ): evaluated outer catch block ",
                "PASS",
                outerCatch );
        testcases[tc++] = new TestCase(
                SECTION,
                "eval( " + expression +" ):  evaluated outer finally block",
                "PASS",
                outerFinally );
    }
