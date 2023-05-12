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
    File Name:          expression-001.js
    Corresponds to:     ecma/Expressions/11.12-2-n.js
    ECMA Section:       11.12
    Description:

    The grammar for a ConditionalExpression in ECMAScript is a little bit
    different from that in C and Java, which each allow the second
    subexpression to be an Expression but restrict the third expression to
    be a ConditionalExpression.  The motivation for this difference in
    ECMAScript is to allow an assignment expression to be governed by either
    arm of a conditional and to eliminate the confusing and fairly useless
    case of a comma expression as the center expression.

    Author:             christine@netscape.com
    Date:               09 september 1998
*/
    var SECTION = "expression-001";
    var VERSION = "JS1_4";
    var TITLE   = "Conditional operator ( ? : )"
    startTest();
    writeHeaderToLog( SECTION + " " + TITLE );

    var tc = 0;
    var testcases = new Array();

    // the following expression should be an error in JS.

    var result = "Failed"
    var exception = "No exception was thrown";

    try {
        eval("var MY_VAR = true ? \"EXPR1\", \"EXPR2\" : \"EXPR3\"");
    } catch ( e ) {
        result = "Passed";
        exception = e.toString();
    }

    testcases[tc++] = new TestCase(
        SECTION,
        "comma expression in a conditional statement "+
        "(threw "+ exception +")",
        "Passed",
        result );


    test();
