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
    File Name:          date-003.js
    Corresponds To      15.9.5.3-1.js
    ECMA Section:       15.9.5.3-1 Date.prototype.valueOf
    Description:

    The valueOf function returns a number, which is this time value.

    The valueOf function is not generic; it generates a runtime error if
    its this value is not a Date object.  Therefore it cannot be transferred
    to other kinds of objects for use as a method.

    Author:             christine@netscape.com
    Date:               12 november 1997
*/
    var SECTION = "date-003";
    var VERSION = "JS1_4";
    var TITLE   = "Date.prototype.valueOf";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    var result = "Failed";
    var exception = "No exception thrown";
    var expect = "Passed";

    try {
        var OBJ = new MyObject( new Date(0) );
        result = OBJ.valueOf();
    } catch ( e ) {
        result = expect;
        exception = e.toString();
    }

    testcases[tc++] = new TestCase(
        SECTION,
        "OBJ = new MyObject( new Date(0)); OBJ.valueOf()" +
        " (threw " + exception +")",
        expect,
        result );

    test();

function MyObject( value ) {
    this.value = value;
    this.valueOf = Date.prototype.valueOf;
//  The following line causes an infinte loop
//    this.toString = new Function( "return this+\"\";");
    return this;
}
