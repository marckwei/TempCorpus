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
    File Name:          15.9.2.2.js
    ECMA Section:       15.9.2.2 Date constructor used as a function
                        Date( year, month, date, hours, minutes, seconds )
    Description:        The arguments are accepted, but are completely ignored.
                        A string is created and returned as if by the
                        expression (new Date()).toString().

    Author:             christine@netscape.com
    Date:               28 october 1997
    Version:            9706

*/
    var VERSION = 9706;
    startTest();
    var SECTION = "15.9.2.2";
    var TITLE = "The Date Constructor Called as a Function";

    writeHeaderToLog(SECTION+" "+TITLE );
    var tc= 0;
    var testcases = getTestCases();

//  all tests must call a function that returns an array of TestCase objects.
    test();

function getTestCases() {
    var array = new Array();
    var item = 0;

    // allow up to 1 second difference due to possibility
    // the date may change by 1 second in between calls to Date

    var d1;
    var d2;

    // Dates around jan 1, 2005

    d1 = new Date();
    d2 = Date.parse(Date(2004,11,31,23,59,59));
    array[item++] = new TestCase( SECTION, "Date(2004,11,31,23,59,59)", true, d2 - d1 <= 1000);

    d1 = new Date();
    d2 = Date.parse(Date(2005,0,1,0,0,0) );
    array[item++] = new TestCase( SECTION, "Date(2005,0,1,0,0,0)", true, d2 - d1 <= 1000);

    d1 = new Date();
    d2 = Date.parse(Date(2005,0,1,0,0,1) );
    array[item++] = new TestCase( SECTION, "Date(2005,0,1,0,0,1)", true, d2 - d1 <= 1000);

    d1 = new Date();
    d2 = Date.parse(Date(2004,11,31,16,0,0,0));
    array[item++] = new TestCase( SECTION, "Date(2004,11,31,16,0,0,0)", true, d2 - d1 <= 1000);

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
