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
	Filename:     RegExp_leftContext_as_array.js
	Description:  'Tests RegExps leftContext property (same tests as RegExp_leftContext.js but using $`)'

	Author:       Nick Lerissa
	Date:         March 12, 1998
*/

	var SECTION = 'As described in Netscape doc "Whats new in JavaScript 1.2"';
	var VERSION = 'no version';
    startTest();
	var TITLE   = 'RegExp: $`';

	writeHeaderToLog('Executing script: RegExp_leftContext_as_array.js');
	writeHeaderToLog( SECTION + " "+ TITLE);

	var count = 0;
	var testcases = new Array();

    // 'abc123xyz'.match(/123/); RegExp['$`']
    'abc123xyz'.match(/123/);
	testcases[count++] = new TestCase ( SECTION, "'abc123xyz'.match(/123/); RegExp['$`']",
	                                    'abc', RegExp['$`']);

    // 'abc123xyz'.match(/456/); RegExp['$`']
    'abc123xyz'.match(/456/);
	testcases[count++] = new TestCase ( SECTION, "'abc123xyz'.match(/456/); RegExp['$`']",
	                                    'abc', RegExp['$`']);

    // 'abc123xyz'.match(/abc123xyz/); RegExp['$`']
    'abc123xyz'.match(/abc123xyz/);
	testcases[count++] = new TestCase ( SECTION, "'abc123xyz'.match(/abc123xyz/); RegExp['$`']",
	                                    '', RegExp['$`']);

    // 'xxxx'.match(/$/); RegExp['$`']
    'xxxx'.match(/$/);
	testcases[count++] = new TestCase ( SECTION, "'xxxx'.match(/$/); RegExp['$`']",
	                                    'xxxx', RegExp['$`']);

    // 'test'.match(/^/); RegExp['$`']
    'test'.match(/^/);
	testcases[count++] = new TestCase ( SECTION, "'test'.match(/^/); RegExp['$`']",
	                                    '', RegExp['$`']);

    // 'xxxx'.match(new RegExp('$')); RegExp['$`']
    'xxxx'.match(new RegExp('$'));
	testcases[count++] = new TestCase ( SECTION, "'xxxx'.match(new RegExp('$')); RegExp['$`']",
	                                    'xxxx', RegExp['$`']);

    // 'test'.match(new RegExp('^')); RegExp['$`']
    'test'.match(new RegExp('^'));
	testcases[count++] = new TestCase ( SECTION, "'test'.match(new RegExp('^')); RegExp['$`']",
	                                    '', RegExp['$`']);

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
