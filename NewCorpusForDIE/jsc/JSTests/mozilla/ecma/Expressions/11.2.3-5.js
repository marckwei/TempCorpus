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
    File Name:          11.2.3-5-n.js
    ECMA Section:       11.2.3. Function Calls
    Description:

    The production CallExpression : MemberExpression Arguments is evaluated as
    follows:

    1.  Evaluate MemberExpression.
    2.  Evaluate Arguments, producing an internal list of argument values
        (section 0).
    3.  Call GetValue(Result(1)).
    4.  If Type(Result(3)) is not Object, generate a runtime error.
    5.  If Result(3) does not implement the internal [[Call]] method, generate a
        runtime error.
    6.  If Type(Result(1)) is Reference, Result(6) is GetBase(Result(1)). Otherwise,
        Result(6) is null.
    7.  If Result(6) is an activation object, Result(7) is null. Otherwise, Result(7) is
        the same as Result(6).
    8.  Call the [[Call]] method on Result(3), providing Result(7) as the this value
        and providing the list Result(2) as the argument values.
    9.  Return Result(8).

    The production CallExpression : CallExpression Arguments is evaluated in
    exactly the same manner, except that the contained CallExpression is
    evaluated in step 1.

    Note: Result(8) will never be of type Reference if Result(3) is a native
    ECMAScript object. Whether calling a host object can return a value of
    type Reference is implementation-dependent.

    Author:             christine@netscape.com
    Date:               12 november 1997
*/

    var SECTION = "11.2.3-5";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "Function Calls";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();

    testcases[tc++] = new TestCase( SECTION, "true.valueOf()", true, true.valueOf() );
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
