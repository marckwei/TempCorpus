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
    File Name:
    ECMA Section:
    Description:        Call Objects



    Author:             christine@netscape.com
    Date:               12 november 1997
*/
    var SECTION = "";
    var VERSION = "ECMA_2";
    var TITLE   = "The Call Constructor";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    var b = new Boolean();

    testcases[tc++] = new TestCase( SECTION,
                                    "var b = new Boolean(); b instanceof Boolean",
                                    true,
                                    b instanceof Boolean );

    testcases[tc++] = new TestCase( SECTION,
                                    "b instanceof Object",
                                    true,
                                    b instanceof Object );

    testcases[tc++] = new TestCase( SECTION,
                                    "b instanceof Array",
                                    false,
                                    b instanceof Array );

    testcases[tc++] = new TestCase( SECTION,
                                    "true instanceof Boolean",
                                    false,
                                    true instanceof Boolean );

    testcases[tc++] = new TestCase( SECTION,
                                    "Boolean instanceof Object",
                                    true,
                                    Boolean instanceof Object );
    test();

function test() {
    for ( tc=0; tc < testcases.length; tc++ ) {
        testcases[tc].passed = writeTestCaseResult(
                            testcases[tc].expect,
                            testcases[tc].actual,
                            testcases[tc].description +" = "+
                            testcases[tc].actual );

        testcases[tc].reason += ( testcases[tc].passed ) ? "" : "wrong value ";
    }
    stopTest();
    return ( testcases );
}
