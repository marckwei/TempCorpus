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
    File Name:          15.3.2.1.js
    ECMA Section:       15.3.2.1 The Function Constructor
                        new Function(p1, p2, ..., pn, body )

    Description:
    Author:             christine@netscape.com
    Date:               28 october 1997

*/
    var SECTION = "15.3.2.1-2";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "The Function Constructor";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = getTestCases();
    test();


function getTestCases() {
    var array = new Array();
    var item = 0;

    var myfunc1 = new Function("a","b","c", "return a+b+c" );
    var myfunc2 = new Function("a, b, c",   "return a+b+c" );
    var myfunc3 = new Function("a,b", "c",  "return a+b+c" );

    myfunc1.toString = Object.prototype.toString;
    myfunc2.toString = Object.prototype.toString;
    myfunc3.toString = Object.prototype.toString;

    array[item++] = new TestCase( SECTION,  "myfunc1 = new Function('a','b','c'); myfunc.toString = Object.prototype.toString; myfunc.toString()",
                                            "[object Function]",
                                            myfunc1.toString() );

    array[item++] = new TestCase( SECTION,  "myfunc1.length",                            3,                      myfunc1.length );
    array[item++] = new TestCase( SECTION,  "myfunc1.prototype.toString()",              "[object Object]",      myfunc1.prototype.toString() );

    array[item++] = new TestCase( SECTION,  "myfunc1.prototype.constructor",             myfunc1,                myfunc1.prototype.constructor );
    array[item++] = new TestCase( SECTION,  "myfunc1.arguments",                         null,                   myfunc1.arguments );
    array[item++] = new TestCase( SECTION,  "myfunc1(1,2,3)",                            6,                      myfunc1(1,2,3) );
    array[item++] = new TestCase( SECTION,  "var MYPROPS = ''; for ( var p in myfunc1.prototype ) { MYPROPS += p; }; MYPROPS",
                                            "",
                                            eval("var MYPROPS = ''; for ( var p in myfunc1.prototype ) { MYPROPS += p; }; MYPROPS") );

    array[item++] = new TestCase( SECTION,  "myfunc2 = new Function('a','b','c'); myfunc.toString = Object.prototype.toString; myfunc.toString()",
                                            "[object Function]",
                                            myfunc2.toString() );
    array[item++] = new TestCase( SECTION,  "myfunc2.__proto__",                         Function.prototype,     myfunc2.__proto__ );
    array[item++] = new TestCase( SECTION,  "myfunc2.length",                            3,                      myfunc2.length );
    array[item++] = new TestCase( SECTION,  "myfunc2.prototype.toString()",              "[object Object]",      myfunc2.prototype.toString() );

    array[item++] = new TestCase( SECTION,  "myfunc2.prototype.constructor",             myfunc2,                 myfunc2.prototype.constructor );
    array[item++] = new TestCase( SECTION,  "myfunc2.arguments",                         null,                   myfunc2.arguments );
    array[item++] = new TestCase( SECTION,  "myfunc2( 1000, 200, 30 )",                 1230,                    myfunc2(1000,200,30) );
    array[item++] = new TestCase( SECTION,  "var MYPROPS = ''; for ( var p in myfunc2.prototype ) { MYPROPS += p; }; MYPROPS",
                                            "",
                                            eval("var MYPROPS = ''; for ( var p in myfunc2.prototype ) { MYPROPS += p; }; MYPROPS") );

    array[item++] = new TestCase( SECTION,  "myfunc3 = new Function('a','b','c'); myfunc.toString = Object.prototype.toString; myfunc.toString()",
                                            "[object Function]",
                                            myfunc3.toString() );
    array[item++] = new TestCase( SECTION,  "myfunc3.__proto__",                         Function.prototype,     myfunc3.__proto__ );
    array[item++] = new TestCase( SECTION,  "myfunc3.length",                            3,                      myfunc3.length );
    array[item++] = new TestCase( SECTION,  "myfunc3.prototype.toString()",              "[object Object]",      myfunc3.prototype.toString() );
    array[item++] = new TestCase( SECTION,  "myfunc3.prototype.valueOf() +''",           "[object Object]",      myfunc3.prototype.valueOf() +'' );
    array[item++] = new TestCase( SECTION,  "myfunc3.prototype.constructor",             myfunc3,                 myfunc3.prototype.constructor );
    array[item++] = new TestCase( SECTION,  "myfunc3.arguments",                         null,                   myfunc3.arguments );
    array[item++] = new TestCase( SECTION,  "myfunc3(-100,100,NaN)",                    Number.NaN,              myfunc3(-100,100,NaN) );

    array[item++] = new TestCase( SECTION,  "var MYPROPS = ''; for ( var p in myfunc3.prototype ) { MYPROPS += p; }; MYPROPS",
                                            "",
                                            eval("var MYPROPS = ''; for ( var p in myfunc3.prototype ) { MYPROPS += p; }; MYPROPS") );

    return ( array );
}
function test() {
    for ( tc=0; tc < testcases.length; tc++ ) {
        testcases[tc].passed = writeTestCaseResult(
                            testcases[tc].expect,
                            testcases[tc].actual,
                            testcases[tc].description +" = "+ testcases[tc].actual );

        testcases[tc].reason += ( testcases[tc].passed ) ? "" : "wrong value ";
    }
    stopTest();
    return ( testcases );
}
