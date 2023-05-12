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
    File Name:          15.9.5.js
    ECMA Section:       15.9.5 Properties of the Date prototype object
    Description:

    The Date prototype object is itself a Date object (its [[Class]] is
    "Date") whose value is NaN.

    The value of the internal [[Prototype]] property of the Date prototype
    object is the Object prototype object (15.2.3.1).

    In following descriptions of functions that are properties of the Date
    prototype object, the phrase "this Date object" refers to the object that
    is the this value for the invocation of the function; it is an error if
    this does not refer to an object for which the value of the internal
    [[Class]] property is "Date". Also, the phrase "this time value" refers
    to the number value for the time represented by this Date object, that is,
    the value of the internal [[Value]] property of this Date object.

    Author:             christine@netscape.com
    Date:               12 november 1997
*/

    var SECTION = "15.9.5";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Properties of the Date Prototype Object";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();

    Date.prototype.getClass = Object.prototype.toString;

    testcases[tc++] = new TestCase( SECTION,
                                    "Date.prototype.getClass",
                                    "[object Date]",
                                    Date.prototype.getClass() );
    testcases[tc++] = new TestCase( SECTION,
                                    "Date.prototype.valueOf()",
                                    NaN,
                                    Date.prototype.valueOf() );
    testcases[tc++] = new TestCase( SECTION,
                                    "Date.prototype.__proto__ == Object.prototype",
                                    true,
                                    Date.prototype.__proto__ == Object.prototype );
    test();
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
