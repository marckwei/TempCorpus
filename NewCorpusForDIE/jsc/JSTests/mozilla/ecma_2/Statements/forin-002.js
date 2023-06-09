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
 *  File Name:          forin-002.js
 *  ECMA Section:
 *  Description:        The forin-001 statement
 *
 *  Verify that the property name is assigned to the property on the left
 *  hand side of the for...in expression.
 *
 *  Author:             christine@netscape.com
 *  Date:               28 August 1998
 */
    var SECTION = "forin-002";
    var VERSION = "ECMA_2";
    var TITLE   = "The for...in  statement";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    function MyObject( value ) {
        this.value = value;
        this.valueOf = new Function ( "return this.value" );
        this.toString = new Function ( "return this.value + \"\"" );
        this.toNumber = new Function ( "return this.value + 0" );
        this.toBoolean = new Function ( "return Boolean( this.value )" );
    }

    ForIn_1(this);
    ForIn_2(this);

    ForIn_1(new MyObject(true));
    ForIn_2(new MyObject(new Boolean(true)));

    ForIn_2(3);

    test();

    /**
     *  For ... In in a With Block
     *
     */
    function ForIn_1( object) {
        with ( object ) {
            for ( property in object ) {
                testcases[tc++] = new TestCase(
                    SECTION,
                    "with loop in a for...in loop.  ("+object+")["+property +"] == "+
                        "eval ( " + property +" )",
                    true,
                    object[property] == eval(property) );
            }
        }
    }

    /**
     *  With block in a For...In loop
     *
     */
    function ForIn_2(object) {
        for ( property in object ) {
            with ( object ) {
                testcases[tc++] = new TestCase(
                    SECTION,
                    "with loop in a for...in loop.  ("+object+")["+property +"] == "+
                        "eval ( " + property +" )",
                    true,
                    object[property] == eval(property) );
            }
        }
    }

