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

var completed = false;
var testcases;

var BUGNUMBER="";
var EXCLUDE = "";

var TT = "";
var TT_ = "";
var BR = "";
var NBSP = " ";
var CR = "\n";
var FONT = "";
var FONT_ = "";
var FONT_RED = "";
var FONT_GREEN = "";
var B = "";
var B_ = ""
var H2 = "";
var H2_ = "";
var HR = "";

var PASSED = " PASSED!"
var FAILED = " FAILED! expected: ";

version( 140 );
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
function TestCase( n, d, e, a ) {
    this.name        = n;
    this.description = d;
    this.expect      = e;
    this.actual      = a;
    this.passed      = true;
    this.reason      = "";
    this.bugnumber   = BUGNUMBER;

    this.passed = getTestCaseResult( this.expect, this.actual );
}
function startTest() {
/*
    //  JavaScript 1.3 is supposed to be compliant ecma version 1.0
    if ( VERSION == "ECMA_1" ) {
        version ( "130" );
    }
    if ( VERSION == "JS_1.3" ) {
        version ( "130" );
    }
    if ( VERSION == "JS_1.2" ) {
        version ( "120" );
    }
    if ( VERSION  == "JS_1.1" ) {
        version ( "110" );
    }
    // for ecma version 2.0, we will leave the javascript version to
    // the default ( for now ).
*/
}
function getTestCaseResult( expect, actual ) {
    //  because ( NaN == NaN ) always returns false, need to do
    //  a special compare to see if we got the right result.
        if ( actual != actual ) {
            if ( typeof actual == "object" ) {
                actual = "NaN object";
            } else {
                actual = "NaN number";
            }
        }
        if ( expect != expect ) {
            if ( typeof expect == "object" ) {
                expect = "NaN object";
            } else {
                expect = "NaN number";
            }
        }

        var passed = ( expect == actual ) ? true : false;

    //  if both objects are numbers, give a little leeway for rounding.
        if (    !passed
                && typeof(actual) == "number"
                && typeof(expect) == "number"
            ) {
                if ( Math.abs(actual-expect) < 0.0000001 ) {
                    passed = true;
                }
        }

    //  verify type is the same
        if ( typeof(expect) != typeof(actual) ) {
            passed = false;
        }

        return passed;
}
function writeTestCaseResult( expect, actual, string ) {
        var passed = getTestCaseResult( expect, actual );
        writeFormattedResult( expect, actual, string, passed );
        return passed;
}
function writeFormattedResult( expect, actual, string, passed ) {
        var s = TT + string ;

        for ( k = 0;
              k <  (60 - string.length >= 0 ? 60 - string.length : 5) ;
              k++ ) {
//              s += NBSP;
        }

        s += B ;
        s += ( passed ) ? FONT_GREEN + NBSP + PASSED : FONT_RED + NBSP + FAILED + expect + TT_ ;

        writeLineToLog( s + FONT_ + B_ + TT_ );

        return passed;
}

function writeLineToLog( string ) {
    print( string + BR + CR );
}
function writeHeaderToLog( string ) {
    print( H2 + string + H2_ );
}
function stopTest() {
    var sizeTag  = "<#TEST CASES SIZE>";
    var doneTag  = "<#TEST CASES DONE>";
    var beginTag = "<#TEST CASE ";
    var endTag   = ">";

    print(sizeTag);
    print(testcases.length);
    for (tc = 0; tc < testcases.length; tc++)
    {
        print(beginTag + 'PASSED'      + endTag);
        print(testcases[tc].passed);
        print(beginTag + 'NAME'        + endTag);
        print(testcases[tc].name);
        print(beginTag + 'EXPECTED'    + endTag);
        print(testcases[tc].expect);
        print(beginTag + 'ACTUAL'      + endTag);
        print(testcases[tc].actual);
        print(beginTag + 'DESCRIPTION' + endTag);
        print(testcases[tc].description);
        print(beginTag + 'REASON'      + endTag);
        print(( testcases[tc].passed ) ? "" : "wrong value ");
        print(beginTag + 'BUGNUMBER'   + endTag);
        print( BUGNUMBER );

    }
    print(doneTag);
    gc();
}
function getFailedCases() {
  for ( var i = 0; i < testcases.length; i++ ) {
     if ( ! testcases[i].passed ) {
        print( testcases[i].description +" = " +testcases[i].actual +" expected: "+ testcases[i].expect );
     }
  }
}
