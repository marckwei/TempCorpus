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
 *  File Name:          try-008.js
 *  ECMA Section:
 *  Description:        The try statement
 *
 *  This test has a try block in a constructor.
 *
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "try-008";
    var VERSION = "ECMA_2";
    var TITLE   = "The try statement: try in a constructor";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    function Integer( value, exception ) {
        try {
            this.value = checkValue( value );
        } catch ( e ) {
            this.value = e.toString();
        }

        testcases[tc++] = new TestCase(
            SECTION,
            "Integer( " + value +" )",
            (exception ? INVALID_INTEGER_VALUE +": " + value : this.value),
            this.value );
    }

    var INVALID_INTEGER_VALUE = "Invalid value for java.lang.Integer constructor";

    function checkValue( value ) {
        if ( Math.floor(value) != value || isNaN(value) ) {
            throw ( INVALID_INTEGER_VALUE +": " + value );
        } else {
            return value;
        }
    }

    // add test cases

    new Integer( 3, false );
    new Integer( NaN, true );
    new Integer( 0, false );
    new Integer( Infinity, false );
    new Integer( -2.12, true );
    new Integer( Math.LN2, true );


    test();
