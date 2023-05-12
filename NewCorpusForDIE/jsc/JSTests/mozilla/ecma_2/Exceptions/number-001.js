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
    File Name:          number-001
    Corresponds To:     15.7.4.2-2-n.js
    ECMA Section:       15.7.4.2.2 Number.prototype.toString()
    Description:
    If the radix is the number 10 or not supplied, then this number value is
    given as an argument to the ToString operator; the resulting string value
    is returned.

    If the radix is supplied and is an integer from 2 to 36, but not 10, the
    result is a string, the choice of which is implementation dependent.

    The toString function is not generic; it generates a runtime error if its
    this value is not a Number object. Therefore it cannot be transferred to
    other kinds of objects for use as a method.

    Author:             christine@netscape.com
    Date:               16 september 1997
*/
    var SECTION = "number-001";
    var VERSION = "JS1_4";
    var TITLE   = "Exceptions for Number.toString()";

    startTest();
    writeHeaderToLog( SECTION + " Number.prototype.toString()");

    var testcases = new Array();
    var tc = 0;


    var result = "Failed";
    var exception = "No exception thrown";
    var expect = "Passed";


    try {
        object= new Object();
        object.toString = Number.prototype.toString;
        result = object.toString();
    } catch ( e ) {
        result = expect;
        exception = e.toString();
    }

    testcases[tc++] = new TestCase(
        SECTION,
        "object = new Object(); object.toString = Number.prototype.toString; object.toString()" +
        " (threw " + exception +")",
        expect,
        result );

    test();
