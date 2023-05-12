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
    File Name:          call-1.js
    Section:            Function.prototype.call
    Description:


    Author:             christine@netscape.com
    Date:               12 november 1997
*/
    var SECTION = "call-1";
    var VERSION = "ECMA_2";
    var TITLE   = "Function.prototype.call";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();


    testcases[tc++] = new TestCase( SECTION,
                        "ToString.call( this, this )",
                        GLOBAL,
                        ToString.call( this, this ) );

    testcases[tc++] = new TestCase( SECTION,
                        "ToString.call( Boolean, Boolean.prototype )",
                        "false",
                        ToString.call( Boolean, Boolean.prototype ) );

    testcases[tc++] = new TestCase( SECTION,
                        "ToString.call( Boolean, Boolean.prototype.valueOf() )",
                        "false",
                        ToString.call( Boolean, Boolean.prototype.valueOf() ) );

    test();

function ToString( obj ) {
    return obj +"";
}