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
 *  File Name:          exception-009
 *  ECMA Section:
 *  Description:        Tests for JavaScript Standard Exceptions
 *
 *  Regression test for nested try blocks.
 *
 *  http://scopus.mcom.com/bugsplat/show_bug.cgi?id=312964
 *
 *  Author:             christine@netscape.com
 *  Date:               31 August 1998
 */
    var SECTION = "exception-009";
    var VERSION = "JS1_4";
    var TITLE   = "Tests for JavaScript Standard Exceptions: SyntaxError";
    var BUGNUMBER= "312964";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    try {
        expect = "passed:  no exception thrown";
        result = expect;
        Nested_1();
    } catch ( e ) {
        result = "failed: threw " + e;
    } finally {
            testcases[tc++] = new TestCase(
                SECTION,
                "nested try",
                expect,
                result );
    }


    test();

    function Nested_1() {
        try {
            try {
            } catch (a) {
            } finally {
            }
        } catch (b) {
        } finally {
        }
    }
