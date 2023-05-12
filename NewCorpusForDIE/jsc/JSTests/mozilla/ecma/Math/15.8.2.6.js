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

/* The contents of this file are subject to the Netscape Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is Mozilla Communicator client code, released March
 * 31, 1998.
 *
 * The Initial Developer of the Original Code is Netscape Communications
 * Corporation. Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributor(s): 
 * 
 */
/**
    File Name:          15.8.2.6.js
    ECMA Section:       15.8.2.6  Math.ceil(x)
    Description:        return the smallest number value that is not less than the
                        argument and is equal to a mathematical integer.  if the
                        number is already an integer, return the number itself.
                        special cases:
                            - if x is NaN       return NaN
                            - if x = +0         return +0
                            - if x = 0          return -0
                            - if x = Infinity   return Infinity
                            - if x = -Infinity  return -Infinity
                            - if ( -1 < x < 0 ) return -0
                        also:
                            -   the value of Math.ceil(x) == -Math.ceil(-x)
    Author:             christine@netscape.com
    Date:               7 july 1997
*/
    var SECTION = "15.8.2.6";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Math.ceil(x)";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = getTestCases();
    test();

function getTestCases() {
    var array = new Array();
    var item = 0;

    array[item++] = new TestCase( SECTION, "Math.ceil.length",      1,              Math.ceil.length );

    array[item++] = new TestCase( SECTION, "Math.ceil(NaN)",         Number.NaN,     Math.ceil(Number.NaN)   );
    array[item++] = new TestCase( SECTION, "Math.ceil(null)",        0,              Math.ceil(null) );
    array[item++] = new TestCase( SECTION, "Math.ceil()",            Number.NaN,     Math.ceil() );
    array[item++] = new TestCase( SECTION, "Math.ceil(void 0)",      Number.NaN,     Math.ceil(void 0) );

    array[item++] = new TestCase( SECTION, "Math.ceil('0')",            0,          Math.ceil('0')            );
    array[item++] = new TestCase( SECTION, "Math.ceil('-0')",           -0,         Math.ceil('-0')           );
    array[item++] = new TestCase( SECTION, "Infinity/Math.ceil('0')",   Infinity,   Infinity/Math.ceil('0'));
    array[item++] = new TestCase( SECTION, "Infinity/Math.ceil('-0')",  -Infinity,  Infinity/Math.ceil('-0'));

    array[item++] = new TestCase( SECTION, "Math.ceil(0)",           0,              Math.ceil(0)            );
    array[item++] = new TestCase( SECTION, "Math.ceil(-0)",          -0,             Math.ceil(-0)           );
    array[item++] = new TestCase( SECTION, "Infinity/Math.ceil(0)",     Infinity,   Infinity/Math.ceil(0));
    array[item++] = new TestCase( SECTION, "Infinity/Math.ceil(-0)",    -Infinity,  Infinity/Math.ceil(-0));

    array[item++] = new TestCase( SECTION, "Math.ceil(Infinity)",    Number.POSITIVE_INFINITY,   Math.ceil(Number.POSITIVE_INFINITY) );
    array[item++] = new TestCase( SECTION, "Math.ceil(-Infinity)",   Number.NEGATIVE_INFINITY,   Math.ceil(Number.NEGATIVE_INFINITY) );
    array[item++] = new TestCase( SECTION, "Math.ceil(-Number.MIN_VALUE)",   -0,     Math.ceil(-Number.MIN_VALUE) );
    array[item++] = new TestCase( SECTION, "Infinity/Math.ceil(-Number.MIN_VALUE)",   -Infinity,     Infinity/Math.ceil(-Number.MIN_VALUE) );
    array[item++] = new TestCase( SECTION, "Math.ceil(1)",          1,              Math.ceil(1)   );
    array[item++] = new TestCase( SECTION, "Math.ceil(-1)",          -1,            Math.ceil(-1)   );
    array[item++] = new TestCase( SECTION, "Math.ceil(-0.9)",        -0,            Math.ceil(-0.9) );
    array[item++] = new TestCase( SECTION, "Infinity/Math.ceil(-0.9)",  -Infinity,  Infinity/Math.ceil(-0.9) );
    array[item++] = new TestCase( SECTION, "Math.ceil(0.9 )",        1,             Math.ceil( 0.9) );
    array[item++] = new TestCase( SECTION, "Math.ceil(-1.1)",        -1,            Math.ceil( -1.1));
    array[item++] = new TestCase( SECTION, "Math.ceil( 1.1)",        2,             Math.ceil(  1.1));

    array[item++] = new TestCase( SECTION, "Math.ceil(Infinity)",   -Math.floor(-Infinity),    Math.ceil(Number.POSITIVE_INFINITY) );
    array[item++] = new TestCase( SECTION, "Math.ceil(-Infinity)",  -Math.floor(Infinity),     Math.ceil(Number.NEGATIVE_INFINITY) );
    array[item++] = new TestCase( SECTION, "Math.ceil(-Number.MIN_VALUE)",   -Math.floor(Number.MIN_VALUE),     Math.ceil(-Number.MIN_VALUE) );
    array[item++] = new TestCase( SECTION, "Math.ceil(1)",          -Math.floor(-1),        Math.ceil(1)   );
    array[item++] = new TestCase( SECTION, "Math.ceil(-1)",         -Math.floor(1),         Math.ceil(-1)   );
    array[item++] = new TestCase( SECTION, "Math.ceil(-0.9)",       -Math.floor(0.9),       Math.ceil(-0.9) );
    array[item++] = new TestCase( SECTION, "Math.ceil(0.9 )",       -Math.floor(-0.9),      Math.ceil( 0.9) );
    array[item++] = new TestCase( SECTION, "Math.ceil(-1.1)",       -Math.floor(1.1),       Math.ceil( -1.1));
    array[item++] = new TestCase( SECTION, "Math.ceil( 1.1)",       -Math.floor(-1.1),      Math.ceil(  1.1));

    return ( array );
}

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
