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
    File Name:          15.8.2.11.js
    ECMA Section:       15.8.2.11 Math.max(x, y)
    Description:        return the smaller of the two arguments.
                        special cases:
                            - if x is NaN or y is NaN   return NaN
                            - if x < y                  return x
                            - if y > x                  return y
                            - if x is +0 and y is +0    return +0
                            - if x is +0 and y is -0    return -0
                            - if x is -0 and y is +0    return -0
                            - if x is -0 and y is -0    return -0
    Author:             christine@netscape.com
    Date:               7 july 1997
*/

    var SECTION = "15.8.2.11";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Math.max(x, y)";
    var BUGNUMBER="76439";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = getTestCases();
    test();

function getTestCases() {
    var array = new Array();
    var item = 0;

    array[item++] = new TestCase( SECTION,  "Math.max.length",              2,              Math.max.length );

    array[item++] = new TestCase( SECTION,  "Math.max()",                   -Infinity,      Math.max() );
    array[item++] = new TestCase( SECTION,  "Math.max(void 0, 1)",          Number.NaN,     Math.max( void 0, 1 ) );
    array[item++] = new TestCase( SECTION,  "Math.max(void 0, void 0)",     Number.NaN,     Math.max( void 0, void 0 ) );
    array[item++] = new TestCase( SECTION,  "Math.max(null, 1)",            1,              Math.max( null, 1 ) );
    array[item++] = new TestCase( SECTION,  "Math.max(-1, null)",           0,              Math.max( -1, null ) );
    array[item++] = new TestCase( SECTION,  "Math.max(true, false)",        1,              Math.max(true,false) );

    array[item++] = new TestCase( SECTION,  "Math.max('-99','99')",          99,             Math.max( "-99","99") );

    array[item++] = new TestCase( SECTION,  "Math.max(NaN, Infinity)",      Number.NaN,     Math.max(Number.NaN,Number.POSITIVE_INFINITY) );
    array[item++] = new TestCase( SECTION,  "Math.max(NaN, 0)",             Number.NaN,     Math.max(Number.NaN, 0) );
    array[item++] = new TestCase( SECTION,  "Math.max('a string', 0)",      Number.NaN,     Math.max("a string", 0) );
    array[item++] = new TestCase( SECTION,  "Math.max(NaN, 1)",             Number.NaN,     Math.max(Number.NaN,1) );
    array[item++] = new TestCase( SECTION,  "Math.max('a string',Infinity)", Number.NaN,    Math.max("a string", Number.POSITIVE_INFINITY) );
    array[item++] = new TestCase( SECTION,  "Math.max(Infinity, NaN)",      Number.NaN,     Math.max( Number.POSITIVE_INFINITY, Number.NaN) );
    array[item++] = new TestCase( SECTION,  "Math.max(NaN, NaN)",           Number.NaN,     Math.max(Number.NaN, Number.NaN) );
    array[item++] = new TestCase( SECTION,  "Math.max(0,NaN)",              Number.NaN,     Math.max(0,Number.NaN) );
    array[item++] = new TestCase( SECTION,  "Math.max(1, NaN)",             Number.NaN,     Math.max(1, Number.NaN) );
    array[item++] = new TestCase( SECTION,  "Math.max(0,0)",                0,              Math.max(0,0) );
    array[item++] = new TestCase( SECTION,  "Math.max(0,-0)",               0,              Math.max(0,-0) );
    array[item++] = new TestCase( SECTION,  "Math.max(-0,0)",               0,              Math.max(-0,0) );
    array[item++] = new TestCase( SECTION,  "Math.max(-0,-0)",              -0,             Math.max(-0,-0) );
    array[item++] = new TestCase( SECTION,  "Infinity/Math.max(-0,-0)",              -Infinity,             Infinity/Math.max(-0,-0) );
    array[item++] = new TestCase( SECTION,  "Math.max(Infinity, Number.MAX_VALUE)", Number.POSITIVE_INFINITY,   Math.max(Number.POSITIVE_INFINITY, Number.MAX_VALUE) );
    array[item++] = new TestCase( SECTION,  "Math.max(Infinity, Infinity)",         Number.POSITIVE_INFINITY,   Math.max(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY) );
    array[item++] = new TestCase( SECTION,  "Math.max(-Infinity,-Infinity)",        Number.NEGATIVE_INFINITY,   Math.max(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY) );
    array[item++] = new TestCase( SECTION,  "Math.max(1,.99999999999999)",          1,                          Math.max(1,.99999999999999) );
    array[item++] = new TestCase( SECTION,  "Math.max(-1,-.99999999999999)",        -.99999999999999,           Math.max(-1,-.99999999999999) );

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
