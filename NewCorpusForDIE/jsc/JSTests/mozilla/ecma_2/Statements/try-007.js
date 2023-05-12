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
 *  File Name:          try-007.js
 *  ECMA Section:
 *  Description:        The try statement
 *
 *  This test has a for-in statement within a try block.
 *
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "try-007";
    var VERSION = "ECMA_2";
    var TITLE   = "The try statement:  for-in";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    /**
     *  This is the "check" function for test objects that will
     *  throw an exception.
     */
    function throwException() {
        throw EXCEPTION_STRING +": " + this.valueOf();
    }
    var EXCEPTION_STRING = "Exception thrown:";

    /**
     *  This is the "check" function for test objects that do not
     *  throw an exception
     */
    function noException() {
        return this.valueOf();
    }

    /**
     *  Add test cases here
     */
    TryForIn( new TryObject( "hello", throwException, true ));
    TryForIn( new TryObject( "hola",  noException, false ));

    /**
     *  Run the test.
     */

    test();

/**
 *  This is the object that will be the "this" in a with block.
 *  The check function is either throwExeption() or noException().
 *  See above.
 *
 */
function TryObject( value, fun, exception ) {
    this.value = value;
    this.exception = exception;

    this.check = fun;
    this.valueOf = function () { return this.value; }
}

/**
 *  This function has a for-in statement within a try block.  Test cases
 *  are added after the try-catch-finally statement.  Within the for-in
 *  block, call a function that can throw an exception.  Verify that any
 *  exceptions are properly caught.
 */

 function TryForIn( object ) {
    try {
        for ( p in object ) {
            if ( typeof object[p] == "function" ) {
                result = object[p]();
            }
        }
    } catch ( e ) {
        result = e;
    }

    testcases[tc++] = new TestCase(
        SECTION,
        "TryForIn( " + object+ " )",
        (object.exception ? EXCEPTION_STRING +": " + object.value : object.value),
        result );

 }
