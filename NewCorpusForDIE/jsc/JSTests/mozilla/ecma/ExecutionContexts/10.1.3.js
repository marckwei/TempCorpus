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
    File Name:          10.1.3.js
    ECMA Section:       10.1.3.js Variable Instantiation
    Description:
    Author:             christine@netscape.com
    Date:               11 september 1997
*/

var SECTION = "10.1.3";
var VERSION = "ECMA_1";
startTest();
var TITLE   = "Variable instantiation";
var BUGNUMBER = "20256";

writeHeaderToLog( SECTION + " "+ TITLE);

var testcases = getTestCases();

test();


function getTestCases() {
    var array = new Array();
    var item = 0;
    
    // overriding a variable or function name with a function should succeed
    array[item++] = 
        new TestCase(SECTION,
                     "function t() { return \"first\" };" +
                     "function t() { return \"second\" };t() ",
                     "second",
                     eval("function t() { return \"first\" };" +
                          "function t() { return \"second\" };t()"));

    array[item++] =
        new TestCase(SECTION,
                     "var t; function t(){}; typeof(t)",
                     "function",
                     eval("var t; function t(){}; typeof(t)"));


    // formal parameter tests
    array[item++] = 
        new TestCase(SECTION,
                     "function t1(a,b) { return b; }; t1( 4 );",
                     void 0,
                     eval("function t1(a,b) { return b; }; t1( 4 );") );
    array[item++] =
        new TestCase(SECTION, 
                     "function t1(a,b) { return a; }; t1(4);",
                     4,
                     eval("function t1(a,b) { return a; }; t1(4)"));
    array[item++] = 
        new TestCase(SECTION,
                     "function t1(a,b) { return a; }; t1();",
                     void 0,
                     eval("function t1(a,b) { return a; }; t1()"));
    array[item++] =
        new TestCase(SECTION, 
                     "function t1(a,b) { return a; }; t1(1,2,4);",
                     1,
                     eval("function t1(a,b) { return a; }; t1(1,2,4)"));
/*
    array[item++] =
        new TestCase(SECTION, "function t1(a,a) { return a; }; t1( 4 );",
                     void 0,
                     eval("function t1(a,a) { return a; }; t1( 4 )"));
    array[item++] = 
        new TestCase(SECTION,
                     "function t1(a,a) { return a; }; t1( 1,2 );",
                     2,
                     eval("function t1(a,a) { return a; }; t1( 1,2 )"));
*/
    // variable declarations
    array[item++] =
        new TestCase(SECTION,
                     "function t1(a,b) { return a; }; t1( false, true );",
                     false,
                     eval("function t1(a,b) { return a; }; t1( false, true );"));
    array[item++] =
        new TestCase(SECTION,
                     "function t1(a,b) { return b; }; t1( false, true );",
                     true,
                     eval("function t1(a,b) { return b; }; t1( false, true );"));
    array[item++] =
        new TestCase(SECTION,
                     "function t1(a,b) { return a+b; }; t1( 4, 2 );",
                     6,
                     eval("function t1(a,b) { return a+b; }; t1( 4, 2 );"));
    array[item++] =
        new TestCase(SECTION,
                     "function t1(a,b) { return a+b; }; t1( 4 );",
                     Number.NaN,
                     eval("function t1(a,b) { return a+b; }; t1( 4 );"));

    // overriding a function name with a variable should fail
    array[item++] =
        new TestCase(SECTION,
                     "function t() { return 'function' };" +
                     "var t = 'variable'; typeof(t)",
                     "string",
                     eval("function t() { return 'function' };" +
                          "var t = 'variable'; typeof(t)"));

    // function as a constructor
    array[item++] =
        new TestCase(SECTION,
                     "function t1(a,b) { var a = b; return a; } t1(1,3);",
                     3,
                     eval("function t1(a, b){ var a = b; return a;}; t1(1,3)"));
    array[item++] =
        new TestCase(SECTION,
                     "function t2(a,b) { this.a = b;  } x  = new t2(1,3); x.a",
                     3,
                     eval("function t2(a,b) { this.a = b; };" +
                          "x = new t2(1,3); x.a"));
    array[item++] =
        new TestCase(SECTION, 
                     "function t2(a,b) { this.a = a;  } x  = new t2(1,3); x.a",
                     1,
                     eval("function t2(a,b) { this.a = a; };" +
                          "x = new t2(1,3); x.a"));
    array[item++] =
        new TestCase(SECTION,
                     "function t2(a,b) { this.a = b; this.b = a; } " +
                     "x = new t2(1,3);x.a;",
                     3,
                     eval("function t2(a,b) { this.a = b; this.b = a; };" +
                          "x = new t2(1,3);x.a;"));
    array[item++] =
        new TestCase(SECTION,
                     "function t2(a,b) { this.a = b; this.b = a; }" +
                     "x = new t2(1,3);x.b;",
                     1,
                     eval("function t2(a,b) { this.a = b; this.b = a; };" +
                          "x = new t2(1,3);x.b;") );

    return (array);
}
