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
 *  File Name:          while-002
 *  ECMA Section:
 *  Description:        while statement
 *
 *  Verify that the while statement is not executed if the while expression is
 *  false
 *
 *  Author:             christine@netscape.com
 *  Date:               11 August 1998
 */
    var SECTION = "while-002";
    var VERSION = "ECMA_2";
    var TITLE   = "while statement";

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    DoWhile( new DoWhileObject(
                "while expression is null",
                null,
                "result = \"fail: should not have evaluated statements in while block;break"
               ) );

    DoWhile( new DoWhileObject(
                "while expression is undefined",
                void 0,
                "result = \"fail: should not have evaluated statements in while block; break"
             ));

    DoWhile( new DoWhileObject(
             "while expression is 0",
             0,
             "result = \"fail: should not have evaluated statements in while block; break;"
             ));

    DoWhile( new DoWhileObject(
             "while expression is eval(\"\")",
             eval(""),
            "result = \"fail: should not have evaluated statements in while block; break"
            ));

    DoWhile( new DoWhileObject(
            "while expression is NaN",
            NaN,
            "result = \"fail: should not have evaluated statements in while block; break"
            ));

    test();

    function DoWhileObject( d, e, s ) {
        this.description = d;
        this.whileExpression = e;
        this.statements = s;
    }

    function DoWhile( object ) {
        result = "pass";

        while ( expression = object.whileExpression ) {
            eval( object.statements );
        }

        // verify that the while expression was evaluated

        testcases[tc++] = new TestCase(
            SECTION,
            "verify that while expression was evaluated (should be "+
                object.whileExpression +")",
            "pass",
            (object.whileExpression == expression ||
               ( isNaN(object.whileExpression) && isNaN(expression) )
             ) ? "pass" : "fail" );

        testcases[tc++] = new TestCase(
            SECTION,
            object.description,
            "pass",
            result );
    }