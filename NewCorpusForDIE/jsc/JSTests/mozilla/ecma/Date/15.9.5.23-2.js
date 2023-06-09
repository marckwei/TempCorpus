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
    File Name:          15.9.5.23-2.js
    ECMA Section:       15.9.5.23
    Description:        Date.prototype.setTime

    1.  If the this value is not a Date object, generate a runtime error.
    2.  Call ToNumber(time).
    3.  Call TimeClip(Result(1)).
    4.  Set the [[Value]] property of the this value to Result(2).
    5.  Return the value of the [[Value]] property of the this value.

    Author:             christine@netscape.com
    Date:               12 november 1997
*/
    var SECTION = "15.9.5.23-2";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Date.prototype.setTime()";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();

    var TZ_ADJUST = TZ_DIFF * msPerHour;

    // get the current time
    var now = (new Date()).valueOf();

    test_times = new Array( now, TIME_1970, TIME_1900, TIME_2000 );


    for ( var j = 0; j < test_times.length; j++ ) {
        addTestCase( new Date(now), test_times[j] );
    }


    testcases[tc++] = new TestCase( SECTION,
                                    "(new Date(NaN)).setTime()",
                                    NaN,
                                    (new Date(NaN)).setTime() );

    testcases[tc++] = new TestCase( SECTION,
                                    "Date.prototype.setTime.length",
                                    1,
                                    Date.prototype.setTime.length );
    test();
function addTestCase( d, t ) {
    testcases[tc++] = new TestCase( SECTION,
                                    "( "+d+" ).setTime("+t+")",
                                    t,
                                    d.setTime(t) );

    testcases[tc++] = new TestCase( SECTION,
                                    "( "+d+" ).setTime("+(t+1.1)+")",
                                    TimeClip(t+1.1),
                                    d.setTime(t+1.1) );

    testcases[tc++] = new TestCase( SECTION,
                                    "( "+d+" ).setTime("+(t+1)+")",
                                    t+1,
                                    d.setTime(t+1) );

    testcases[tc++] = new TestCase( SECTION,
                                    "( "+d+" ).setTime("+(t-1)+")",
                                    t-1,
                                    d.setTime(t-1) );

    testcases[tc++] = new TestCase( SECTION,
                                    "( "+d+" ).setTime("+(t-TZ_ADJUST)+")",
                                    t-TZ_ADJUST,
                                    d.setTime(t-TZ_ADJUST) );

    testcases[tc++] = new TestCase( SECTION,
                                    "( "+d+" ).setTime("+(t+TZ_ADJUST)+")",
                                    t+TZ_ADJUST,
                                    d.setTime(t+TZ_ADJUST) );
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
