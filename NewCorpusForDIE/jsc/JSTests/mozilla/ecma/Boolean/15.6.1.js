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
    File Name:      15.6.1.js
    ECMA Section:   15.6.1 The Boolean Function
                    15.6.1.1 Boolean( value )
                    15.6.1.2 Boolean ()
    Description:    Boolean( value ) should return a Boolean value
                    not a Boolean object) computed by
                    Boolean.toBooleanValue( value)

                    15.6.1.2 Boolean() returns false

    Author:         christine@netscape.com
    Date:           27 jun 1997


    Data File Fields:
        VALUE       Argument passed to the Boolean function
        TYPE        typeof VALUE (not used, but helpful in understanding
                    the data file)
        E_RETURN    Expected return value of Boolean( VALUE )
*/
    var SECTION = "15.6.1";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "The Boolean constructor called as a function: Boolean( value ) and Boolean()";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = getTestCases();

    test();

function getTestCases() {
    var array = new Array();
    var item = 0;

    array[item++] = new TestCase( SECTION,   "Boolean(1)",         true,   Boolean(1) );
    array[item++] = new TestCase( SECTION,   "Boolean(0)",         false,  Boolean(0) );
    array[item++] = new TestCase( SECTION,   "Boolean(-1)",        true,   Boolean(-1) );
    array[item++] = new TestCase( SECTION,   "Boolean('1')",       true,   Boolean("1") );
    array[item++] = new TestCase( SECTION,   "Boolean('0')",       true,   Boolean("0") );
    array[item++] = new TestCase( SECTION,   "Boolean('-1')",      true,   Boolean("-1") );
    array[item++] = new TestCase( SECTION,   "Boolean(true)",      true,   Boolean(true) );
    array[item++] = new TestCase( SECTION,   "Boolean(false)",     false,  Boolean(false) );

    array[item++] = new TestCase( SECTION,   "Boolean('true')",    true,   Boolean("true") );
    array[item++] = new TestCase( SECTION,   "Boolean('false')",   true,   Boolean("false") );
    array[item++] = new TestCase( SECTION,   "Boolean(null)",      false,  Boolean(null) );

    array[item++] = new TestCase( SECTION,   "Boolean(-Infinity)", true,   Boolean(Number.NEGATIVE_INFINITY) );
    array[item++] = new TestCase( SECTION,   "Boolean(NaN)",       false,  Boolean(Number.NaN) );
    array[item++] = new TestCase( SECTION,   "Boolean(void(0))",   false,  Boolean( void(0) ) );
    array[item++] = new TestCase( SECTION,   "Boolean(x=0)",       false,  Boolean( x=0 ) );
    array[item++] = new TestCase( SECTION,   "Boolean(x=1)",       true,   Boolean( x=1 ) );
    array[item++] = new TestCase( SECTION,   "Boolean(x=false)",   false,  Boolean( x=false ) );
    array[item++] = new TestCase( SECTION,   "Boolean(x=true)",    true,   Boolean( x=true ) );
    array[item++] = new TestCase( SECTION,   "Boolean(x=null)",    false,  Boolean( x=null ) );
    array[item++] = new TestCase( SECTION,   "Boolean()",          false,  Boolean() );
//    array[item++] = new TestCase( SECTION,   "Boolean(var someVar)",     false,  Boolean( someVar ) );

    return ( array );
}
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
