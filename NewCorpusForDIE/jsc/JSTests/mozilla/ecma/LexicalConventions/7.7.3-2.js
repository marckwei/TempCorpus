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
    File Name:          7.7.3-2.js
    ECMA Section:       7.7.3 Numeric Literals

    Description:

    This is a regression test for
    http://scopus.mcom.com/bugsplat/show_bug.cgi?id=122884

    Waldemar's comments:

    A numeric literal that starts with either '08' or '09' is interpreted as a
    decimal literal; it should be an error instead.  (Strictly speaking, according
    to ECMA v1 such literals should be interpreted as two integers -- a zero
    followed by a decimal number whose first digit is 8 or 9, but this is a bug in
    ECMA that will be fixed in v2.  In any case, there is no place in the grammar
    where two consecutive numbers would be legal.)

    Author:             christine@netscape.com
    Date:               15 june 1998

*/
    var SECTION = "7.7.3-2";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Numeric Literals";
    var BUGNUMBER="122884";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();

    testcases[tc++] = new TestCase( SECTION,
        "9",
        9,
        9 );

    testcases[tc++] = new TestCase( SECTION,
        "09",
        9,
        09 );

    testcases[tc++] = new TestCase( SECTION,
        "099",
        99,
        099 );


    testcases[tc++] = new TestCase( SECTION,
        "077",
        63,
        077 );

    test();


function test() {
        for ( tc=0; tc < testcases.length; tc++ ) {
            testcases[tc].actual = testcases[tc].actual;

            testcases[tc].passed = writeTestCaseResult(
                            testcases[tc].expect,
                            testcases[tc].actual,
                            testcases[tc].description +" = "+ testcases[tc].actual );

            testcases[tc].reason += ( testcases[tc].passed ) ? "" : "wrong value ";

        }

        stopTest();
        return ( testcases );
}
