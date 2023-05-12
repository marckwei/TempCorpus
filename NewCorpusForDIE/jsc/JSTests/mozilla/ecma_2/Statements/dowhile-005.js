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
 *  File Name:          dowhile-005
 *  ECMA Section:
 *  Description:        do...while statements
 *
 *  Test a labeled do...while.  Break out of the loop with no label
 *  should break out of the loop, but not out of the label.
 *
 *  Currently causes an infinite loop in the monkey.  Uncomment the
 *  print statement below and it works OK.
 *
 *  Author:             christine@netscape.com
 *  Date:               26 August 1998
 */
    var SECTION = "dowhile-005";
    var VERSION = "ECMA_2";
    var TITLE   = "do...while with a labeled continue statement";
    var BUGNUMBER = "316293";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    NestedLabel();


    test();

    function NestedLabel() {
        i = 0;
        result1 = "pass";
        result2 = "fail: did not hit code after inner loop";
        result3 = "pass";

        outer: {
            do {
                inner: {
//                    print( i );
                    break inner;
                    result1 = "fail: did break out of inner label";
                  }
                result2 = "pass";
                break outer;
                print (i);
            } while ( i++ < 100 );

        }

        result3 = "fail: did not break out of outer label";

        testcases[tc++] = new TestCase(
            SECTION,
            "number of loop iterations",
            0,
            i );

        testcases[tc++] = new TestCase(
            SECTION,
            "break out of inner loop",
            "pass",
            result1 );

        testcases[tc++] = new TestCase(
            SECTION,
            "break out of outer loop",
            "pass",
            result2 );
    }