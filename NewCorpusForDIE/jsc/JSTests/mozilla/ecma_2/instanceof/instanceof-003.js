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
    File Name:          instanceof-003.js
    ECMA Section:
    Description:        http://bugzilla.mozilla.org/show_bug.cgi?id=7635

js> function Foo() {}
js> theproto = {};
[object Object]
js> Foo.prototype = theproto
[object Object]
js> theproto instanceof Foo
true

I think this should be 'false'


    Author:             christine@netscape.com
    Date:               12 november 1997


The test case described above is correct, however the second test case in this file is not,
'o instanceof o' should thow an exception.  According to ECMA-262:

    8.6.2 Internal Properties and Methods:
        "... only Function objects implement [[HasInstance]]"
    11.8.6 The instanceof operator:
        "6.If Result(4) does not have a [[HasInstance]] method, throw a TypeError exception."

{} does not implement [[HasInstance]] (since it is not a function), so passing it as the
constructor to be tested to instanceof should result in a TypeError being thrown.

*/
    var SECTION = "instanceof-003";
    var VERSION = "ECMA_2";
    var TITLE   = "instanceof operator";
    var BUGNUMBER ="http://bugzilla.mozilla.org/show_bug.cgi?id=7635";

    startTest();

    function Foo() {};
    theproto = {};
    Foo.prototype = theproto;

    AddTestCase(
        "function Foo() = {}; theproto = {}; Foo.prototype = theproto; " +
            "theproto instanceof Foo",
        false,
        theproto instanceof Foo );


    AddTestCase(
        "o = {}; o instanceof o",
        "EXCEPTION",
        (function(){ try { var o = {}; o instanceof o; return "no exception"; } catch (e) { return "EXCEPTION"; } } )() );


    test();
