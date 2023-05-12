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
 *  File Name:          try-009.js
 *  ECMA Section:
 *  Description:        The try statement
 *
 *  This test has a try block within a while block.  Verify that an exception
 *  breaks out of the while.  I don't really know why this is an interesting
 *  test case but Mike Shaver had two of these so what the hey.
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "try-009";
    var VERSION = "ECMA_2";
    var TITLE   = "The try statement: try in a while block";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    var EXCEPTION_STRING = "Exception thrown: ";
    var NO_EXCEPTION_STRING = "No exception thrown: ";


    TryInWhile( new TryObject( "hello", ThrowException, true ) );
    TryInWhile( new TryObject( "aloha", NoException, false ));

    test();

    function TryObject( value, throwFunction, result ) {
        this.value = value;
        this.thrower = throwFunction;
        this.result = result;
    }
    function ThrowException() {
        throw EXCEPTION_STRING + this.value;
    }
    function NoException() {
        return NO_EXCEPTION_STRING + this.value;
    }
    function TryInWhile( object ) {
        result = null;
        while ( true ) {
            try {
                object.thrower();
                result = NO_EXCEPTION_STRING + object.value;
                break;
            } catch ( e ) {
                result = e;
                break;
            }
        }

        testcases[tc++] = new TestCase(
            SECTION,
            "( "+ object  +".thrower() )",
            (object.result
            ? EXCEPTION_STRING + object.value :
            NO_EXCEPTION_STRING + object.value),
            result );
    }
