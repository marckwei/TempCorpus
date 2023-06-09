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
	Filename:     simple_form.js
	Description:  'Tests regular expressions using simple form: re(...)'

	Author:       Nick Lerissa
	Date:         March 19, 1998
*/

	var SECTION = 'As described in Netscape doc "Whats new in JavaScript 1.2"';
	var VERSION = 'no version';
    startTest();
	var TITLE   = 'RegExp: simple form';

	writeHeaderToLog('Executing script: simple_form.js');
	writeHeaderToLog( SECTION + " "+ TITLE);

	var count = 0;
	var testcases = new Array();

	testcases[count++] = new TestCase ( SECTION,
	                                    "/[0-9]{3}/('23 2 34 678 9 09')",
	                                    String(["678"]), String(/[0-9]{3}/('23 2 34 678 9 09')));

	testcases[count++] = new TestCase ( SECTION,
	                                    "/3.{4}8/('23 2 34 678 9 09')",
	                                    String(["34 678"]), String(/3.{4}8/('23 2 34 678 9 09')));

	testcases[count++] = new TestCase ( SECTION,
	                                    "(/3.{4}8/('23 2 34 678 9 09').length",
	                                    1, (/3.{4}8/('23 2 34 678 9 09')).length);

    var re = /[0-9]{3}/;
	testcases[count++] = new TestCase ( SECTION,
	                                    "re('23 2 34 678 9 09')",
	                                    String(["678"]), String(re('23 2 34 678 9 09')));

    re = /3.{4}8/;
	testcases[count++] = new TestCase ( SECTION,
	                                    "re('23 2 34 678 9 09')",
	                                    String(["34 678"]), String(re('23 2 34 678 9 09')));

	testcases[count++] = new TestCase ( SECTION,
	                                    "/3.{4}8/('23 2 34 678 9 09')",
	                                    String(["34 678"]), String(/3.{4}8/('23 2 34 678 9 09')));

    re =/3.{4}8/;
	testcases[count++] = new TestCase ( SECTION,
	                                    "(re('23 2 34 678 9 09').length",
	                                    1, (re('23 2 34 678 9 09')).length);

	testcases[count++] = new TestCase ( SECTION,
	                                    "(/3.{4}8/('23 2 34 678 9 09').length",
	                                    1, (/3.{4}8/('23 2 34 678 9 09')).length);

	function test()
	{
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

	test();
