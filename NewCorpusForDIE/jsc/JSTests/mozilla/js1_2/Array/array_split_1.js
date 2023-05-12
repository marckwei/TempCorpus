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
    File Name:          array_split_1.js
    ECMA Section:       Array.split()
    Description:

    These are tests from free perl suite.

    Author:             christine@netscape.com
    Date:               12 november 1997
*/

    var SECTION = "Free Perl";
    var VERSION = "JS1_2";
    var TITLE   = "Array.split()";

    startTest();

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();


    testcases[tc++] = new TestCase( SECTION,
                                    "('a,b,c'.split(',')).length",
                                    3,
                                    ('a,b,c'.split(',')).length );

    testcases[tc++] = new TestCase( SECTION,
                                    "('a,b'.split(',')).length",
                                    2,
                                    ('a,b'.split(',')).length );

    testcases[tc++] = new TestCase( SECTION,
                                    "('a'.split(',')).length",
                                    1,
                                    ('a'.split(',')).length );

/*
 * Mozilla deviates from ECMA by never splitting an empty string by any separator
 * string into a non-empty array (an array of length 1 that contains the empty string).
 * But Internet Explorer does not do this, so we won't do it in JavaScriptCore either.
 */
    testcases[tc++] = new TestCase( SECTION,
                                    "(''.split(',')).length",
                                    1,
                                    (''.split(',')).length );




    test();
