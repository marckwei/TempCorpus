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

/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is JavaScript Engine testing utilities.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): nanto_vi 
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
//-----------------------------------------------------------------------------
var bug = 306591;
var summary = 'String static methods';
var actual = '';
var expect = '';

printBugNumber (bug);
printStatus (summary);
printStatus ('See https://bugzilla.mozilla.org/show_bug.cgi?id=304828');
  
expect = ['a', 'b', 'c'].toString();
actual = String.split(new String('abc'), '').toString();
reportCompare(expect, actual, summary + 
              " String.split(new String('abc'), '')");

expect = '2';
actual = String.substring(new Number(123), 1, 2);
reportCompare(expect, actual, summary + 
              " String.substring(new Number(123), 1, 2)");

expect = 'TRUE';
actual = String.toUpperCase(new Boolean(true));  
reportCompare(expect, actual, summary + 
              " String.toUpperCase(new Boolean(true))");

expect = 2;
actual = String.indexOf(null, 'l');              
reportCompare(expect, actual, summary + 
              " String.indexOf(null, 'l')");

expect = 2;
actual = String.indexOf(String(null), 'l');              
reportCompare(expect, actual, summary + 
              " String.indexOf(String(null), 'l')");

expect = ['a', 'b', 'c'].toString();
actual = String.split('abc', '').toString();
reportCompare(expect, actual, summary + 
              " String.split('abc', '')");

expect = '2';
actual = String.substring(123, 1, 2);
reportCompare(expect, actual, summary + 
              " String.substring(123, 1, 2)");

expect = 'TRUE';
actual = String.toUpperCase(true);
reportCompare(expect, actual, summary + 
              " String.toUpperCase(true)");

expect = 2;
actual = String.indexOf(undefined, 'd');
reportCompare(expect, actual, summary + 
              " String.indexOf(undefined, 'd')");

expect = 2;
actual = String.indexOf(String(undefined), 'd');
reportCompare(expect, actual, summary + 
              " String.indexOf(String(undefined), 'd')");
