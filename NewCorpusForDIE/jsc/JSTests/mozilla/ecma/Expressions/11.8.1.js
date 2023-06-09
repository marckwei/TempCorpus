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
    File Name:          11.8.1.js
    ECMA Section:       11.8.1  The less-than operator ( < )
    Description:


    Author:             christine@netscape.com
    Date:               12 november 1997
*/
    var SECTION = "11.8.1";
    var VERSION = "ECMA_1";
    startTest();
    var testcases = getTestCases();

    writeHeaderToLog( SECTION + " The less-than operator ( < )");
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
function getTestCases() {
    var array = new Array();
    var item = 0;

    array[item++] = new TestCase( SECTION, "true < false",              false,      true < false );
    array[item++] = new TestCase( SECTION, "false < true",              true,       false < true );
    array[item++] = new TestCase( SECTION, "false < false",             false,      false < false );
    array[item++] = new TestCase( SECTION, "true < true",               false,      true < true );

    array[item++] = new TestCase( SECTION, "new Boolean(true) < new Boolean(true)",     false,  new Boolean(true) < new Boolean(true) );
    array[item++] = new TestCase( SECTION, "new Boolean(true) < new Boolean(false)",    false,  new Boolean(true) < new Boolean(false) );
    array[item++] = new TestCase( SECTION, "new Boolean(false) < new Boolean(true)",    true,   new Boolean(false) < new Boolean(true) );
    array[item++] = new TestCase( SECTION, "new Boolean(false) < new Boolean(false)",   false,  new Boolean(false) < new Boolean(false) );

    array[item++] = new TestCase( SECTION, "new MyObject(Infinity) < new MyObject(Infinity)",   false,  new MyObject( Number.POSITIVE_INFINITY ) < new MyObject( Number.POSITIVE_INFINITY) );
    array[item++] = new TestCase( SECTION, "new MyObject(-Infinity) < new MyObject(Infinity)",  true,   new MyObject( Number.NEGATIVE_INFINITY ) < new MyObject( Number.POSITIVE_INFINITY) );
    array[item++] = new TestCase( SECTION, "new MyObject(-Infinity) < new MyObject(-Infinity)", false,  new MyObject( Number.NEGATIVE_INFINITY ) < new MyObject( Number.NEGATIVE_INFINITY) );

    array[item++] = new TestCase( SECTION, "new MyValueObject(false) < new MyValueObject(true)",  true,   new MyValueObject(false) < new MyValueObject(true) );
    array[item++] = new TestCase( SECTION, "new MyValueObject(true) < new MyValueObject(true)",   false,  new MyValueObject(true) < new MyValueObject(true) );
    array[item++] = new TestCase( SECTION, "new MyValueObject(false) < new MyValueObject(false)", false,  new MyValueObject(false) < new MyValueObject(false) );

    array[item++] = new TestCase( SECTION, "new MyStringObject(false) < new MyStringObject(true)",  true,   new MyStringObject(false) < new MyStringObject(true) );
    array[item++] = new TestCase( SECTION, "new MyStringObject(true) < new MyStringObject(true)",   false,  new MyStringObject(true) < new MyStringObject(true) );
    array[item++] = new TestCase( SECTION, "new MyStringObject(false) < new MyStringObject(false)", false,  new MyStringObject(false) < new MyStringObject(false) );

    array[item++] = new TestCase( SECTION, "Number.NaN < Number.NaN",   false,     Number.NaN < Number.NaN );
    array[item++] = new TestCase( SECTION, "0 < Number.NaN",            false,     0 < Number.NaN );
    array[item++] = new TestCase( SECTION, "Number.NaN < 0",            false,     Number.NaN < 0 );

    array[item++] = new TestCase( SECTION, "0 < -0",                    false,      0 < -0 );
    array[item++] = new TestCase( SECTION, "-0 < 0",                    false,      -0 < 0 );

    array[item++] = new TestCase( SECTION, "Infinity < 0",                  false,      Number.POSITIVE_INFINITY < 0 );
    array[item++] = new TestCase( SECTION, "Infinity < Number.MAX_VALUE",   false,      Number.POSITIVE_INFINITY < Number.MAX_VALUE );
    array[item++] = new TestCase( SECTION, "Infinity < Infinity",           false,      Number.POSITIVE_INFINITY < Number.POSITIVE_INFINITY );

    array[item++] = new TestCase( SECTION, "0 < Infinity",                  true,       0 < Number.POSITIVE_INFINITY );
    array[item++] = new TestCase( SECTION, "Number.MAX_VALUE < Infinity",   true,       Number.MAX_VALUE < Number.POSITIVE_INFINITY );

    array[item++] = new TestCase( SECTION, "0 < -Infinity",                 false,      0 < Number.NEGATIVE_INFINITY );
    array[item++] = new TestCase( SECTION, "Number.MAX_VALUE < -Infinity",  false,      Number.MAX_VALUE < Number.NEGATIVE_INFINITY );
    array[item++] = new TestCase( SECTION, "-Infinity < -Infinity",         false,      Number.NEGATIVE_INFINITY < Number.NEGATIVE_INFINITY );

    array[item++] = new TestCase( SECTION, "-Infinity < 0",                 true,       Number.NEGATIVE_INFINITY < 0 );
    array[item++] = new TestCase( SECTION, "-Infinity < -Number.MAX_VALUE", true,       Number.NEGATIVE_INFINITY < -Number.MAX_VALUE );
    array[item++] = new TestCase( SECTION, "-Infinity < Number.MIN_VALUE",  true,       Number.NEGATIVE_INFINITY < Number.MIN_VALUE );

    array[item++] = new TestCase( SECTION, "'string' < 'string'",           false,       'string' < 'string' );
    array[item++] = new TestCase( SECTION, "'astring' < 'string'",          true,       'astring' < 'string' );
    array[item++] = new TestCase( SECTION, "'strings' < 'stringy'",         true,       'strings' < 'stringy' );
    array[item++] = new TestCase( SECTION, "'strings' < 'stringier'",       false,       'strings' < 'stringier' );
    array[item++] = new TestCase( SECTION, "'string' < 'astring'",          false,      'string' < 'astring' );
    array[item++] = new TestCase( SECTION, "'string' < 'strings'",          true,       'string' < 'strings' );

    return ( array );
}
function MyObject(value) {
    this.value = value;
    this.valueOf = new Function( "return this.value" );
    this.toString = new Function( "return this.value +''" );
}
function MyValueObject(value) {
    this.value = value;
    this.valueOf = new Function( "return this.value" );
}
function MyStringObject(value) {
    this.value = value;
    this.toString = new Function( "return this.value +''" );
}