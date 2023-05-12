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
    File Name:          15.8.2.10.js
    ECMA Section:       15.8.2.10  Math.log(x)
    Description:        return an approximiation to the natural logarithm of
                        the argument.
                        special cases:
                        -   if arg is NaN       result is NaN
                        -   if arg is <0        result is NaN
                        -   if arg is 0 or -0   result is -Infinity
                        -   if arg is 1         result is 0
                        -   if arg is Infinity  result is Infinity
    Author:             christine@netscape.com
    Date:               7 july 1997
*/

    var SECTION = "15.8.2.10";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Math.log(x)";
    var BUGNUMBER = "77391";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = getTestCases();
    test();

function getTestCases() {
    var array = new Array();
    var item = 0;

    array[item++] = new TestCase( SECTION,   "Math.log.length",         1,              Math.log.length );

    array[item++] = new TestCase( SECTION,   "Math.log()",              Number.NaN,     Math.log() );
    array[item++] = new TestCase( SECTION,   "Math.log(void 0)",        Number.NaN,     Math.log(void 0) );
    array[item++] = new TestCase( SECTION,   "Math.log(null)",          Number.NEGATIVE_INFINITY,   Math.log(null) );
    array[item++] = new TestCase( SECTION,   "Math.log(true)",          0,              Math.log(true) );
    array[item++] = new TestCase( SECTION,   "Math.log(false)",         -Infinity,      Math.log(false) );
    array[item++] = new TestCase( SECTION,   "Math.log('0')",           -Infinity,      Math.log('0') );
    array[item++] = new TestCase( SECTION,   "Math.log('1')",           0,              Math.log('1') );
    array[item++] = new TestCase( SECTION,   "Math.log('Infinity')",    Infinity,       Math.log("Infinity") );

    array[item++] = new TestCase( SECTION,   "Math.log(NaN)",           Number.NaN,     Math.log(Number.NaN) );
    array[item++] = new TestCase( SECTION,   "Math.log(-0.0000001)",    Number.NaN,     Math.log(-0.000001)  );
    array[item++] = new TestCase( SECTION,   "Math.log(-1)",            Number.NaN,     Math.log(-1)        );
    array[item++] = new TestCase( SECTION,   "Math.log(0)",             Number.NEGATIVE_INFINITY,   Math.log(0) );
    array[item++] = new TestCase( SECTION,   "Math.log(-0)",            Number.NEGATIVE_INFINITY,   Math.log(-0));
    array[item++] = new TestCase( SECTION,   "Math.log(1)",             0,              Math.log(1) );
    array[item++] = new TestCase( SECTION,   "Math.log(Infinity)",      Number.POSITIVE_INFINITY,   Math.log(Number.POSITIVE_INFINITY) );
    array[item++] = new TestCase( SECTION,   "Math.log(-Infinity)",     Number.NaN,     Math.log(Number.NEGATIVE_INFINITY) );

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