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
    File Name:          15.9.5.11.js
    ECMA Section:       15.9.5.11
    Description:        Date.prototype.getUTCDate

   1.Let t be this time value.
   2.If t is NaN, return NaN.
   1.Return DateFromTime(t).

    Author:             christine@netscape.com
    Date:               12 november 1997
*/

    var SECTION = "15.9.5.11";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Date.prototype.getUTCDate()";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();

    var TZ_ADJUST = TZ_DIFF * msPerHour;

    var UTC_FEB_29_2000 = TIME_2000 + ( 30 * msPerDay ) + ( 29 * msPerDay );

    addTestCase( UTC_FEB_29_2000 );
    test();
function addTestCase( t ) {
    for ( var m = 0; m < 11; m++ ) {
        t += TimeInMonth(m);

        for ( var d = 0; d < TimeInMonth( m ); d += 7*msPerDay ) {
            t += d;
            testcases[tc++] = new TestCase( SECTION,
                                    "(new Date("+t+")).getUTCDate()",
                                    DateFromTime((t)),
                                    (new Date(t)).getUTCDate() );
/*
            testcases[tc++] = new TestCase( SECTION,
                                    "(new Date("+(t+1)+")).getUTCDate()",
                                    DateFromTime((t+1)),
                                    (new Date(t+1)).getUTCDate() );

            testcases[tc++] = new TestCase( SECTION,
                                    "(new Date("+(t-1)+")).getUTCDate()",
                                    DateFromTime((t-1)),
                                    (new Date(t-1)).getUTCDate() );

            testcases[tc++] = new TestCase( SECTION,
                                    "(new Date("+(t-TZ_ADJUST)+")).getUTCDate()",
                                    DateFromTime((t-TZ_ADJUST)),
                                    (new Date(t-TZ_ADJUST)).getUTCDate() );

            testcases[tc++] = new TestCase( SECTION,
                                    "(new Date("+(t+TZ_ADJUST)+")).getUTCDate()",
                                    DateFromTime((t+TZ_ADJUST)),
                                    (new Date(t+TZ_ADJUST)).getUTCDate() );
*/
        }
    }
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
