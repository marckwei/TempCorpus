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
    File Name:          15.5.4.2.js
    ECMA Section:       15.5.4.2 String.prototype.toString

    Description:
    Author:             christine@netscape.com
    Date:               28 october 1997

*/
    var SECTION = "15.5.4.2";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "String.prototype.tostring";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = getTestCases();
    test();

function getTestCases() {
    var array = new Array();
    var item = 0;

    array[item++] = new TestCase( SECTION, "String.prototype.toString.__proto__",  Function.prototype, String.prototype.toString.__proto__ );
    array[item++] = new TestCase(   SECTION,
                                    "String.prototype.toString() == String.prototype.valueOf()",
                                    true,
                                    String.prototype.toString() == String.prototype.valueOf() );

    array[item++] = new TestCase(   SECTION, "String.prototype.toString()",     "",     String.prototype.toString() );
    array[item++] = new TestCase(   SECTION, "String.prototype.toString.length",    0,  String.prototype.toString.length );


    array[item++] = new TestCase(   SECTION,
                                    "TESTSTRING = new String();TESTSTRING.valueOf() == TESTSTRING.toString()",
                                    true,
                                    eval("TESTSTRING = new String();TESTSTRING.valueOf() == TESTSTRING.toString()") );
    array[item++] = new TestCase(   SECTION,
                                    "TESTSTRING = new String(true);TESTSTRING.valueOf() == TESTSTRING.toString()",
                                    true,
                                    eval("TESTSTRING = new String(true);TESTSTRING.valueOf() == TESTSTRING.toString()") );
    array[item++] = new TestCase(   SECTION,
                                    "TESTSTRING = new String(false);TESTSTRING.valueOf() == TESTSTRING.toString()",
                                    true,
                                    eval("TESTSTRING = new String(false);TESTSTRING.valueOf() == TESTSTRING.toString()") );
    array[item++] = new TestCase(   SECTION,
                                    "TESTSTRING = new String(Math.PI);TESTSTRING.valueOf() == TESTSTRING.toString()",
                                    true,
                                    eval("TESTSTRING = new String(Math.PI);TESTSTRING.valueOf() == TESTSTRING.toString()") );
    array[item++] = new TestCase(   SECTION,
                                    "TESTSTRING = new String();TESTSTRING.valueOf() == TESTSTRING.toString()",
                                    true,
                                    eval("TESTSTRING = new String();TESTSTRING.valueOf() == TESTSTRING.toString()") );

    return ( array );
}
function test( array ) {
        for ( ; tc < testcases.length; tc++ ) {
            testcases[tc].passed = writeTestCaseResult(
                            testcases[tc].expect,
                            testcases[tc].actual,
                            testcases[tc].description +" = "+ testcases[tc].actual );

            testcases[tc].reason += ( testcases[tc].passed ) ? "" : "wrong value ";
        }

        stopTest();

    //  all tests must return an array of TestCase objects
        return ( testcases );
}
