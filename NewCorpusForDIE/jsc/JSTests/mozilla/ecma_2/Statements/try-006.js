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
 *  File Name:          try-006.js
 *  ECMA Section:
 *  Description:        The try statement
 *
 *  Throw an exception from within a With block in a try block.  Verify
 *  that any expected exceptions are caught.
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "try-006";
    var VERSION = "ECMA_2";
    var TITLE   = "The try statement";

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
    TryWith( new TryObject( "hello", throwException, true ));
    TryWith( new TryObject( "hola",  noException, false ));

    /**
     *  Run the test.
     */

    test();

    /**
     *  This is the object that will be the "this" in a with block.
     */
    function TryObject( value, fun, exception ) {
        this.value = value;
        this.exception = exception;

        this.valueOf = new Function ( "return this.value" );
        this.check = fun;
    }

    /**
     *  This function has the try block that has a with block within it.
     *  Test cases are added in this function.  Within the with block, the
     *  object's "check" function is called.  If the test object's exception
     *  property is true, we expect the result to be the exception value.
     *  If exception is false, then we expect the result to be the value of
     *  the object.
     */
    function TryWith( object ) {
        try {
            with ( object ) {
                result = check();
            }
        } catch ( e ) {
            result = e;
        }

        testcases[tc++] = new TestCase(
            SECTION,
            "TryWith( " + object.value +" )",
            (object.exception ? EXCEPTION_STRING +": " + object.valueOf() : object.valueOf()),
            result );
    }
