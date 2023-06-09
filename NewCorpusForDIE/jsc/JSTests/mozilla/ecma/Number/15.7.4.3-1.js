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
    File Name:          15.7.4.3-1.js
    ECMA Section:       15.7.4.3.1 Number.prototype.valueOf()
    Description:
    Returns this number value.

    The valueOf function is not generic; it generates a runtime error if its
    this value is not a Number object. Therefore it cannot be transferred to
    other kinds of objects for use as a method.

    Author:             christine@netscape.com
    Date:               16 september 1997
*/
    var SECTION = "15.7.4.3-1";
    var VERSION = "ECMA_1";
    startTest();
    var testcases = getTestCases();

    writeHeaderToLog( SECTION + " Number.prototype.valueOf()");
    test();


function getTestCases() {
    var array = new Array();
    var item = 0;

//  the following two line causes navigator to crash -- cmb 9/16/97
    array[item++] = new TestCase("15.7.4.1", "Number.prototype.valueOf()",        0,        "Number.prototype.valueOf()" );

    array[item++] = new TestCase("15.7.4.1", "(new Number(1)).valueOf()",         1,       "(new Number(1)).valueOf()" );
    array[item++] = new TestCase("15.7.4.1", "(new Number(-1)).valueOf()",        -1,      "(new Number(-1)).valueOf()" );
    array[item++] = new TestCase("15.7.4.1", "(new Number(0)).valueOf()",         0,       "(new Number(0)).valueOf()" );
    array[item++] = new TestCase("15.7.4.1", "(new Number(Number.POSITIVE_INFINITY)).valueOf()", Number.POSITIVE_INFINITY, "(new Number(Number.POSITIVE_INFINITY)).valueOf()" );
    array[item++] = new TestCase("15.7.4.1", "(new Number(Number.NaN)).valueOf()",  Number.NaN, "(new Number(Number.NaN)).valueOf()" );
    array[item++] = new TestCase("15.7.4.1", "(new Number()).valueOf()",         0,       "(new Number()).valueOf()" );

    return ( array );
}
function test() {
    for ( tc=0; tc < testcases.length; tc++ ) {
        testcases[tc].actual = eval( testcases[tc].actual );
        testcases[tc].passed = writeTestCaseResult(
                            testcases[tc].expect,
                            testcases[tc].actual,
                            testcases[tc].description +" = "+ testcases[tc].actual );

        testcases[tc].reason += ( testcases[tc].passed ) ? "" : "wrong value ";
    }
    stopTest();
    return ( testcases );
}
