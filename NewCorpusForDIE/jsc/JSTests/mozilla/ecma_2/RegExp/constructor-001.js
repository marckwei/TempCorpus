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

/**
 *  File Name:          RegExp/constructor-001.js
 *  ECMA Section:       15.7.3.3
 *  Description:        Based on ECMA 2 Draft 7 February 1999
 *
 *  Author:             christine@netscape.com
 *  Date:               19 February 1999
 */
    var SECTION = "RegExp/constructor-001";
    var VERSION = "ECMA_2";
    var TITLE   = "new RegExp()";

    startTest();

    /*
     * for each test case, verify:
     * - verify that [[Class]] property is RegExp
     * - prototype property should be set to RegExp.prototype
     * - source is set to the empty string
     * - global property is set to false
     * - ignoreCase property is set to false
     * - multiline property is set to false
     * - lastIndex property is set to 0
     */

    RegExp.prototype.getClassProperty = Object.prototype.toString;
    var re = new RegExp();

    AddTestCase(
        "new RegExp().__proto__",
        RegExp.prototype,
        re.__proto__
    );

    AddTestCase(
        "RegExp.prototype.getClassProperty = Object.prototype.toString; " +
        "(new RegExp()).getClassProperty()",
        "[object RegExp]",
        re.getClassProperty() );

    AddTestCase(
        "(new RegExp()).source",
        "(?:)",
        re.source );

    AddTestCase(
        "(new RegExp()).global",
        false,
        re.global );

    AddTestCase(
        "(new RegExp()).ignoreCase",
        false,
        re.ignoreCase );

    AddTestCase(
        "(new RegExp()).multiline",
        false,
        re.multiline );

    AddTestCase(
        "(new RegExp()).lastIndex",
        0,
        re.lastIndex );

    test()
