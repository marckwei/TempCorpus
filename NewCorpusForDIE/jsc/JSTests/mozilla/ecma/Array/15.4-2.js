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
    File Name:          15.4-2.js
    ECMA Section:       15.4 Array Objects

    Description:        Whenever a property is added whose name is an array
                        index, the length property is changed, if necessary,
                        to be one more than the numeric value of that array
                        index; and whenever the length property is changed,
                        every property whose name is an array index whose value
                        is not smaller  than the new length is automatically
                        deleted.  This constraint applies only to the Array
                        object itself, and is unaffected by length or array
                        index properties that may be inherited from its
                        prototype.

    Author:             christine@netscape.com
    Date:               28 october 1997

*/
    var SECTION = "15.4-2";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Array Objects";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = getTestCases();
    test();

function getTestCases() {
    var array = new Array();
    var item = 0;

    array[item++] = new TestCase( SECTION, "var arr=new Array();  arr[Math.pow(2,16)] = 'hi'; arr.length",      Math.pow(2,16)+1,   eval("var arr=new Array();  arr[Math.pow(2,16)] = 'hi'; arr.length") );

    array[item++] = new TestCase( SECTION, "var arr=new Array();  arr[Math.pow(2,30)-2] = 'hi'; arr.length",    Math.pow(2,30)-1,   eval("var arr=new Array();  arr[Math.pow(2,30)-2] = 'hi'; arr.length") );
    array[item++] = new TestCase( SECTION, "var arr=new Array();  arr[Math.pow(2,30)-1] = 'hi'; arr.length",    Math.pow(2,30),     eval("var arr=new Array();  arr[Math.pow(2,30)-1] = 'hi'; arr.length") );
    array[item++] = new TestCase( SECTION, "var arr=new Array();  arr[Math.pow(2,30)] = 'hi'; arr.length",      Math.pow(2,30)+1,   eval("var arr=new Array();  arr[Math.pow(2,30)] = 'hi'; arr.length") );

    array[item++] = new TestCase( SECTION, "var arr=new Array();  arr[Math.pow(2,31)-2] = 'hi'; arr.length",    Math.pow(2,31)-1,   eval("var arr=new Array();  arr[Math.pow(2,31)-2] = 'hi'; arr.length") );
    array[item++] = new TestCase( SECTION, "var arr=new Array();  arr[Math.pow(2,31)-1] = 'hi'; arr.length",    Math.pow(2,31),     eval("var arr=new Array();  arr[Math.pow(2,31)-1] = 'hi'; arr.length") );
    array[item++] = new TestCase( SECTION, "var arr=new Array();  arr[Math.pow(2,31)] = 'hi'; arr.length",      Math.pow(2,31)+1,   eval("var arr=new Array();  arr[Math.pow(2,31)] = 'hi'; arr.length") );

    array[item++] = new TestCase( SECTION, "var arr = new Array(0,1,2,3,4,5); arr.length = 2; String(arr)",     "0,1",              eval("var arr = new Array(0,1,2,3,4,5); arr.length = 2; String(arr)") );
    array[item++] = new TestCase( SECTION, "var arr = new Array(0,1); arr.length = 3; String(arr)",             "0,1,",             eval("var arr = new Array(0,1); arr.length = 3; String(arr)") );
//    array[item++] = new TestCase( SECTION, "var arr = new Array(0,1,2,3,4,5); delete arr[0]; arr.length",       5,                  eval("var arr = new Array(0,1,2,3,4,5); delete arr[0]; arr.length") );
//    array[item++] = new TestCase( SECTION, "var arr = new Array(0,1,2,3,4,5); delete arr[6]; arr.length",       5,                  eval("var arr = new Array(0,1,2,3,4,5); delete arr[6]; arr.length") );

    return ( array );
}
function test( array ) {
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
