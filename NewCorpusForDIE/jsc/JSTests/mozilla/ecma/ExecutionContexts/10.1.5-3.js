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
    File Name:          10.1.5-3.js
    ECMA Section:       10.1.5 Global Object
    Description:
    There is a unique global object which is created before control enters
    any execution context. Initially the global object has the following
    properties:

    Built-in objects such as Math, String, Date, parseInt, etc. These have
    attributes { DontEnum }.

    Additional host defined properties. This may include a property whose
    value is the global object itself, for example window in HTML.

    As control enters execution contexts, and as ECMAScript code is executed,
    additional properties may be added to the global object and the initial
    properties may be changed.

    Author:             christine@netscape.com
    Date:               12 november 1997
*/
    var SECTION = "10.5.1-3";
    var VERSION = "ECMA_1";
    startTest();
    writeHeaderToLog( SECTION + " Global Ojbect");

    var testcases = getTestCases();

    test();

function test() {
    if ( Object == null ) {
        testcases[0].reason += " Object == null" ;
    }
    if ( Function == null ) {
        testcases[0].reason += " Function == null";
    }
    if ( String == null ) {
        testcases[0].reason += " String == null";
    }
    if ( Array == null ) {
        testcases[0].reason += " Array == null";
    }
    if ( Number == null ) {
        testcases[0].reason += " Function == null";
    }
    if ( Math == null ) {
        testcases[0].reason += " Math == null";
    }
    if ( Boolean == null ) {
        testcases[0].reason += " Boolean == null";
    }
    if ( Date  == null ) {
        testcases[0].reason += " Date == null";
    }
/*
    if ( NaN == null ) {
        testcases[0].reason += " NaN == null";
    }
    if ( Infinity == null ) {
        testcases[0].reason += " Infinity == null";
    }
*/
    if ( eval == null ) {
        testcases[0].reason += " eval == null";
    }
    if ( parseInt == null ) {
        testcases[0].reason += " parseInt == null";
    }

    if ( testcases[0].reason != "" ) {
        testcases[0].actual = "fail";
    } else {
        testcases[0].actual = "pass";
    }
    testcases[0].expect = "pass";

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
function getTestCases() {
    var array = new Array();
    var item = 0;

    array[item++] = new TestCase( "SECTION", "Function Code check" );

    return ( array );
}
