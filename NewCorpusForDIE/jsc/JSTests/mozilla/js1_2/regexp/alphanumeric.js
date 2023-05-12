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
	Filename:     alphanumeric.js
	Description:  'Tests regular expressions with \w and \W special characters'

	Author:       Nick Lerissa
	Date:         March 10, 1998
*/

	var SECTION = 'As described in Netscape doc "Whats new in JavaScript 1.2"';
	var VERSION = 'no version';
    startTest();
	var TITLE   = 'RegExp: \\w and \\W';

	writeHeaderToLog('Executing script: alphanumeric.js');
	writeHeaderToLog( SECTION + " " + TITLE);

	var count = 0;
	var testcases = new Array();

	var non_alphanumeric = "~`!@#$%^&*()-+={[}]|\\:;'<,>./?\f\n\r\t\v " + '"';
    var alphanumeric     = "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    // be sure all alphanumerics are matched by \w
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + alphanumeric + "'.match(new RegExp('\\w+'))",
	                                    String([alphanumeric]), String(alphanumeric.match(new RegExp('\\w+'))));

    // be sure all non-alphanumerics are matched by \W
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + non_alphanumeric + "'.match(new RegExp('\\W+'))",
	                                    String([non_alphanumeric]), String(non_alphanumeric.match(new RegExp('\\W+'))));

    // be sure all non-alphanumerics are not matched by \w
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + non_alphanumeric + "'.match(new RegExp('\\w'))",
	                                    null, non_alphanumeric.match(new RegExp('\\w')));

    // be sure all alphanumerics are not matched by \W
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + alphanumeric + "'.match(new RegExp('\\W'))",
	                                    null, alphanumeric.match(new RegExp('\\W')));

	var s = non_alphanumeric + alphanumeric;

    // be sure all alphanumerics are matched by \w
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + s + "'.match(new RegExp('\\w+'))",
	                                    String([alphanumeric]), String(s.match(new RegExp('\\w+'))));

	s = alphanumeric + non_alphanumeric;

    // be sure all non-alphanumerics are matched by \W
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + s + "'.match(new RegExp('\\W+'))",
	                                    String([non_alphanumeric]), String(s.match(new RegExp('\\W+'))));

    // be sure all alphanumerics are matched by \w (using literals)
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + s + "'.match(/\w+/)",
	                                    String([alphanumeric]), String(s.match(/\w+/)));

	s = alphanumeric + non_alphanumeric;

    // be sure all non-alphanumerics are matched by \W (using literals)
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + s + "'.match(/\W+/)",
	                                    String([non_alphanumeric]), String(s.match(/\W+/)));

    s = 'abcd*&^%$$';
    // be sure the following test behaves consistently
	testcases[count++] = new TestCase ( SECTION,
	                                    "'" + s + "'.match(/(\w+)...(\W+)/)",
	                                    String([s , 'abcd' , '%$$']), String(s.match(/(\w+)...(\W+)/)));

    var i;

    // be sure all alphanumeric characters match individually
	for (i = 0; i < alphanumeric.length; ++i)
	{
	    s = '#$' + alphanumeric[i] + '%^';
    	testcases[count++] = new TestCase ( SECTION,
    	                                    "'" + s + "'.match(new RegExp('\\w'))",
    	                                    String([alphanumeric[i]]), String(s.match(new RegExp('\\w'))));
	}
    // be sure all non_alphanumeric characters match individually
	for (i = 0; i < non_alphanumeric.length; ++i)
	{
	    s = 'sd' + non_alphanumeric[i] + String((i+10) * (i+10) - 2 * (i+10));
    	testcases[count++] = new TestCase ( SECTION,
    	                                    "'" + s + "'.match(new RegExp('\\W'))",
    	                                    String([non_alphanumeric[i]]), String(s.match(new RegExp('\\W'))));
	}

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
