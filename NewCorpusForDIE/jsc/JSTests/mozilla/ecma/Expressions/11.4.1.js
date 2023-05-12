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
    File Name:          11.4.1.js
    ECMA Section:       11.4.1 the Delete Operator
    Description:        returns true if the property could be deleted
                        returns false if it could not be deleted
    Author:             christine@netscape.com
    Date:               7 july 1997

*/


    var SECTION = "11.4.1";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "The delete operator";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = getTestCases();

    test();

function getTestCases() {
    var array = new Array();
    var item = 0;

//    array[item++] = new TestCase( SECTION,   "x=[9,8,7];delete(x[2]);x.length",         2,             eval("x=[9,8,7];delete(x[2]);x.length") );
//    array[item++] = new TestCase( SECTION,   "x=[9,8,7];delete(x[2]);x.toString()",     "9,8",         eval("x=[9,8,7];delete(x[2]);x.toString()") );
    array[item++] = new TestCase( SECTION,   "x=new Date();delete x;typeof(x)",        "undefined",    eval("x=new Date();delete x;typeof(x)") );

//    array[item++] = new TestCase( SECTION,   "delete(x=new Date())",        true,   delete(x=new Date()) );
//    array[item++] = new TestCase( SECTION,   "delete('string primitive')",   true,   delete("string primitive") );
//    array[item++] = new TestCase( SECTION,   "delete(new String( 'string object' ) )",  true,   delete(new String("string object")) );
//    array[item++] = new TestCase( SECTION,   "delete(new Number(12345) )",  true,   delete(new Number(12345)) );
    array[item++] = new TestCase( SECTION,   "delete(Math.PI)",             false,   delete(Math.PI) );
//    array[item++] = new TestCase( SECTION,   "delete(null)",                true,   delete(null) );
//    array[item++] = new TestCase( SECTION,   "delete(void(0))",             true,   delete(void(0)) );

    // variables declared with the var statement are not deletable.

    var abc;
    array[item++] = new TestCase( SECTION,   "var abc; delete(abc)",        false,   delete abc );

    array[item++] = new TestCase(   SECTION,
                                    "var OB = new MyObject(); for ( p in OB ) { delete p }",
                                    true,
                                    eval("var OB = new MyObject(); for ( p in OB ) { delete p }") );
    return ( array );
}

function test() {
    for ( tc = 0; tc < testcases.length; tc++ ) {
        testcases[tc].passed = writeTestCaseResult(
                    testcases[tc].expect,
                    testcases[tc].actual,
                    testcases[tc].description +" = "+ testcases[tc].actual );

            testcases[tc].reason += ( testcases[tc].passed ) ? "" : "wrong value "

    }
    stopTest();
    return ( testcases );
}

function MyObject() {
    this.prop1 = true;
    this.prop2 = false;
    this.prop3 = null
    this.prop4 = void 0;
    this.prop5 = "hi";
    this.prop6 = 42;
    this.prop7 = new Date();
    this.prop8 = Math.PI;
}