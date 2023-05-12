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
    File Name:          boolean-001.js
    Description:        Corresponds to ecma/Boolean/15.6.4.2-4-n.js

                        The toString function is not generic; it generates
                        a runtime error if its this value is not a Boolean
                        object.  Therefore it cannot be transferred to other
                        kinds of objects for use as a method.

    Author:             christine@netscape.com
    Date:               june 27, 1997
*/
    var SECTION = "boolean-001.js";
    var VERSION = "JS1_4";
    var TITLE   = "Boolean.prototype.toString()";
    startTest();
    writeHeaderToLog( SECTION +" "+ TITLE );

    var tc = 0;
    var testcases = new Array();

    var exception = "No exception thrown";
    var result = "Failed";

    var TO_STRING = Boolean.prototype.toString;

    try {
        var s = new String("Not a Boolean");
        s.toString = TO_STRING;
        s.toString();
    } catch ( e ) {
        result = "Passed!";
        exception = e.toString();
    }

    testcases[tc++] = new TestCase(
        SECTION,
        "Assigning Boolean.prototype.toString to a String object "+
        "(threw " +exception +")",
        "Passed!",
        result );

    test();
