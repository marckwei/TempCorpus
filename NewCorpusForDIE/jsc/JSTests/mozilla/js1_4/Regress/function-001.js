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
 *  File Name:          function-001.js
 *  Description:
 *
 * http://scopus.mcom.com/bugsplat/show_bug.cgi?id=325843
 * js> function f(a){var a,b;}
 *
 * causes an an assert on a null 'sprop' in the 'Variables' function in
 * jsparse.c This will crash non-debug build.
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "function-001.js";
    var VERSION = "JS1_4";
    var TITLE   = "Regression test case for 325843";
    var BUGNUMBER="3258435";
    startTest();

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();

    eval("function f1 (a){ var a,b; }");

    function f2( a ) { var a, b; };

    testcases[tc++] = new TestCase(
        SECTION,
        "eval(\"function f1 (a){ var a,b; }\"); "+
        "function f2( a ) { var a, b; }; typeof f1",
        "function",
        typeof f1 );

    // force a function decompilation

    testcases[tc++] = new TestCase(
        SECTION,
        "typeof f1.toString()",
        "string",
        typeof f1.toString() );

    testcases[tc++] = new TestCase(
        SECTION,
        "typeof f2",
        "function",
        typeof f2 );

    // force a function decompilation

    testcases[tc++] = new TestCase(
        SECTION,
        "typeof f2.toString()",
        "string",
        typeof f2.toString() );

    test();

