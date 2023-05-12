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
    File Name:          regexparg-1.js
    Description:	

    Regression test for 
    http://scopus/bugsplat/show_bug.cgi?id=122787
    Passing a regular expression as the first constructor argument fails

    Author:             christine@netscape.com
    Date:               15 June 1998
*/

    var SECTION = "JS_1.2";
    var VERSION = "JS_1.2";
    startTest();
    var TITLE   = "The variable statment";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();

    function f(x) {return x;}

    x = f(/abc/);

    testcases[tc++] = new TestCase( SECTION,
       "function f(x) {return x;}; f()",
       void 0,
       f() );

    testcases[tc++] = new TestCase( SECTION,
        "f(\"hi\")",
        "hi",
        f("hi") );

    testcases[tc++] = new TestCase( SECTION,
        "new f(/abc/) +''",
        "/abc/",
        new f(/abc/) +"" );

    testcases[tc++] = new TestCase( SECTION,
         "f(/abc/)+'')",
         "/abc/",
         f(/abc/) +'');    
        
    testcases[tc++] = new TestCase( SECTION,
        "typeof f(/abc/)",
        "function",
        typeof f(/abc/) );

    testcases[tc++] = new TestCase( SECTION,
        "typeof new f(/abc/)",
        "function",
        typeof new f(/abc/) );

    testcases[tc++] = new TestCase( SECTION,
         "x = new f(/abc/); x(\"hi\")",
         null,
         x("hi") );


 // js> x()
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
