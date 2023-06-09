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
    File Name:          12.6.3-12.js
    ECMA Section:       12.6.3 The for...in Statement
    Description:

    This is a regression test for http://bugzilla.mozilla.org/show_bug.cgi?id=9802.

    The production IterationStatement : for ( LeftHandSideExpression in Expression )
    Statement is evaluated as follows:

    1.  Evaluate the Expression.
    2.  Call GetValue(Result(1)).
    3.  Call ToObject(Result(2)).
    4.  Let C be "normal completion".
    5.  Get the name of the next property of Result(3) that doesn't have the
        DontEnum attribute. If there is no such property, go to step 14.
    6.  Evaluate the LeftHandSideExpression (it may be evaluated repeatedly).
    7.  Call PutValue(Result(6), Result(5)).  PutValue( V, W ):
        1.  If Type(V) is not Reference, generate a runtime error.
        2.  Call GetBase(V).
        3.  If Result(2) is null, go to step 6.
        4.  Call the [[Put]] method of Result(2), passing GetPropertyName(V)
            for the property name and W for the value.
        5.  Return.
        6.  Call the [[Put]] method for the global object, passing
            GetPropertyName(V) for the property name and W for the value.
        7.  Return.
    8.  Evaluate Statement.
    9.  If Result(8) is a value completion, change C to be "normal completion
        after value V" where V is the value carried by Result(8).
    10. If Result(8) is a break completion, go to step 14.
    11. If Result(8) is a continue completion, go to step 5.
    12. If Result(8) is a return completion, return Result(8).
    13. Go to step 5.
    14. Return C.

    Author:             christine@netscape.com
    Date:               11 september 1997
*/
    var SECTION = "12.6.3-12";
    var VERSION = "ECMA_1";
    startTest();
    var TITLE   = "The for..in statment";

    writeHeaderToLog( SECTION + " "+ TITLE);

    var testcases = new Array();

    var result = "PASSED";

    for ( aVar in this ) {
        if (aVar == "aVar") {
            result = "FAILED"
        }
    };

    testcases[testcases.length] = new TestCase(
        SECTION,
        "var result=''; for ( aVar in this ) { " +
        "if (aVar == 'aVar') {return a failure}; result",
        "PASSED",
        result );

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

