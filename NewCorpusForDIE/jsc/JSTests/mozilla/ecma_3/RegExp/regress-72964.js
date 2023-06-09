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
* Software distributed under the License is distributed on an "AS  IS"
* basis, WITHOUT WARRANTY OF ANY KIND, either expressed
* or implied. See the License for the specific language governing
* rights and limitations under the License.
*
* The Original Code is mozilla.org code.
*
* The Initial Developer of the Original Code is Netscape
* Communications Corporation.  Portions created by Netscape are
* Copyright (C) 1998 Netscape Communications Corporation. 
* All Rights Reserved.
*
* Contributor(s): pschwartau@netscape.com
* Date: 2001-07-17
*
* SUMMARY: Regression test for Bugzilla bug 72964:
* "String method for pattern matching failed for Chinese Simplified (GB2312)"
*
* See http://bugzilla.mozilla.org/show_bug.cgi?id=72964
*/
//-----------------------------------------------------------------------------
var i = 0;
var bug = 72964;
var summary = 'Testing regular expressions containing non-Latin1 characters';
var cnSingleSpace = ' ';
var status = '';
var statusmessages = new Array();
var pattern = '';
var patterns = new Array();
var string = '';
var strings = new Array();
var actualmatch = '';
var actualmatches = new Array();
var expectedmatch = '';
var expectedmatches = new Array();


pattern = /[\S]+/;
    // 4 low Unicode chars = Latin1; whole string should match
    status = inSection(1);
    string = '\u00BF\u00CD\u00BB\u00A7';
    actualmatch = string.match(pattern);
    expectedmatch = Array(string);
    addThis();

    // Now put a space in the middle; first half of string should match
    status = inSection(2);
    string = '\u00BF\u00CD \u00BB\u00A7';
    actualmatch = string.match(pattern);
    expectedmatch = Array('\u00BF\u00CD');
    addThis();


    // 4 high Unicode chars = non-Latin1; whole string should match
    status = inSection(3);
    string = '\u4e00\uac00\u4e03\u4e00';
    actualmatch = string.match(pattern);
    expectedmatch = Array(string);
    addThis();

    // Now put a space in the middle; first half of string should match
    status = inSection(4);
    string = '\u4e00\uac00 \u4e03\u4e00';
    actualmatch = string.match(pattern);
    expectedmatch = Array('\u4e00\uac00');
    addThis();



//-----------------------------------------------------------------------------
test();
//-----------------------------------------------------------------------------



function addThis()
{
  statusmessages[i] = status;
  patterns[i] = pattern;
  strings[i] = string;
  actualmatches[i] = actualmatch;
  expectedmatches[i] = expectedmatch;
  i++;
}


function test()
{
  enterFunc ('test');
  printBugNumber (bug);
  printStatus (summary);
  testRegExp(statusmessages, patterns, strings, actualmatches, expectedmatches);
  exitFunc ('test');
}
