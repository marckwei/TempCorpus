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

/*
* The contents of this file are subject to the Netscape Public
* License Version 1.1 (the "License"); you may not use this file
* except in compliance with the License. You may obtain a copy of
* the License at http://www.mozilla.org/NPL/
*
* Software distributed under the License is distributed on an "AS
* IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
* implied. See the License for the specific language governing
* rights and limitations under the License.
*
* The Original Code is mozilla.org code.
*
* The Initial Developer of the Original Code is Netscape
* Communications Corporation.  Portions created by Netscape are
* Copyright (C) 1998 Netscape Communications Corporation. All
* Rights Reserved.
*
* Contributor(s): 
*/

/*
 * JavaScript test library shared functions file for running the tests
 * in the browser.  Overrides the shell's print function with document.write
 * and make everything HTML pretty.
 *
 * To run the tests in the browser, use the mkhtml.pl script to generate
 * html pages that include the shell.js, browser.js (this file), and the
 * test js file in script tags.
 *
 * The source of the page that is generated should look something like this:
 *      <script src="./../shell.js"></script>
 *      <script src="./../browser.js"></script>
 *      <script src="./mytest.js"></script>
 */

onerror = err;

var GLOBAL = "[object Window]";

function startTest() {
    writeHeaderToLog( SECTION + " "+ TITLE);
    if ( BUGNUMBER ) {
        writeLineToLog ("BUGNUMBER: " + BUGNUMBER );
    }

    testcases = new Array();
    tc = 0;
}

function writeLineToLog( string ) {
    document.write( string + "<br>\n");
}
function writeHeaderToLog( string ) {
    document.write( "<h2>" + string + "</h2>" );
}
function stopTest() {
    var gc;
    if ( gc != undefined ) {
        gc();
    }
    document.write( "<hr>" );
}
function writeFormattedResult( expect, actual, string, passed ) {
    var s = "<tt>"+ string ;
    s += "<b>" ;
    s += ( passed ) ? "<font color=#009900> &nbsp;" + PASSED
                    : "<font color=#aa0000>&nbsp;" +  FAILED + expect + "</tt>";
    writeLineToLog( s + "</font></b></tt>" );
    return passed;
}
function err( msg, page, line ) {
    writeLineToLog( "Test failed on line " + line + " with the message: " + msg );

    testcases[tc].actual = "error";
    testcases[tc].reason = msg;
    writeTestCaseResult( testcases[tc].expect,
                         testcases[tc].actual,
                         testcases[tc].description +" = "+ testcases[tc].actual +
                         ": " + testcases[tc].reason );
    stopTest();
    return true;
}
