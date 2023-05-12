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
	Filename:     break.js
	Description:  'Tests the break statement'

	Author:       Nick Lerissa
	Date:         March 18, 1998
*/

	var SECTION = 'As described in Netscape doc "Whats new in JavaScript 1.2"';
	var VERSION = 'no version';
    startTest();
	var TITLE   = 'statements: break';

	writeHeaderToLog("Executing script: break.js");
	writeHeaderToLog( SECTION + " "+ TITLE);

	var count = 0;
	var testcases = new Array();

	var i,j;

	for (i = 0; i < 1000; i++)
	{
	    if (i == 100) break;
	}

    // 'breaking out of "for" loop'
	testcases[count++] = new TestCase ( SECTION, 'breaking out of "for" loop',
	                                    100, i);

    j = 2000;

    out1:
	for (i = 0; i < 1000; i++)
	{
	    if (i == 100)
	    {
	        out2:
	        for (j = 0; j < 1000; j++)
	        {
	            if (j == 500) break out1;
	        }
	        j = 2001;
	    }
	    j = 2002;
	}

    // 'breaking out of a "for" loop with a "label"'
	testcases[count++] = new TestCase ( SECTION, 'breaking out of a "for" loop with a "label"',
	                                    500, j);

	i = 0;

	while (i < 1000)
	{
	    if (i == 100) break;
	    i++;
	}

	// 'breaking out of a "while" loop'
	testcases[count++] = new TestCase ( SECTION, 'breaking out of a "while" loop',
	                                    100, i );


    j = 2000;
    i = 0;

    out3:
	while (i < 1000)
	{
	    if (i == 100)
	    {
	        j = 0;
	        out4:
	        while (j < 1000)
	        {
	            if (j == 500) break out3;
	            j++;
	        }
	        j = 2001;
	    }
	    j = 2002;
	    i++;
	}

    // 'breaking out of a "while" loop with a "label"'
	testcases[count++] = new TestCase ( SECTION, 'breaking out of a "while" loop with a "label"',
	                                    500, j);

	i = 0;

	do
	{
	    if (i == 100) break;
	    i++;
	} while (i < 1000);

	// 'breaking out of a "do" loop'
	testcases[count++] = new TestCase ( SECTION, 'breaking out of a "do" loop',
	                                    100, i );

    j = 2000;
    i = 0;

    out5:
	do
	{
	    if (i == 100)
	    {
	        j = 0;
	        out6:
	        do
	        {
	            if (j == 500) break out5;
	            j++;
	        }while (j < 1000);
	        j = 2001;
	    }
	    j = 2002;
	    i++;
	}while (i < 1000);

    // 'breaking out of a "do" loop with a "label"'
	testcases[count++] = new TestCase ( SECTION, 'breaking out of a "do" loop with a "label"',
	                                    500, j);

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
