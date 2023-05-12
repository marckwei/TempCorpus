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
 *  File Name:          instanceof-001.js
 *  ECMA Section:       11.8.6
 *  Description:
 *
 *  RelationalExpression instanceof Identifier
 *
 *  Author:             christine@netscape.com
 *  Date:               2 September 1998
 */
    var SECTION = "instanceof-001";
    var VERSION = "ECMA_2";
    var TITLE   = "instanceof"

    startTest();
    writeHeaderToLog( SECTION + " "+ TITLE);

    var tc = 0;
    var testcases = new Array();

    function InstanceOf( object_1, object_2, expect ) {
        result = object_1 instanceof object_2;

        testcases[tc++] = new TestCase(
            SECTION,
            "(" + object_1 + ") instanceof " + object_2,
            expect,
            result );
    }

    function Gen3(value) {
        this.value = value;
        this.generation = 3;
        this.toString = new Function ( "return \"(Gen\"+this.generation+\" instance)\"" );
    }
    Gen3.name = 3;
    Gen3.__proto__.toString = new Function( "return \"(\"+this.name+\" object)\"");

    function Gen2(value) {
        this.value = value;
        this.generation = 2;
    }
    Gen2.name = 2;
    Gen2.prototype = new Gen3();

    function Gen1(value) {
        this.value = value;
        this.generation = 1;
    }
    Gen1.name = 1;
    Gen1.prototype = new Gen2();

    function Gen0(value) {
        this.value = value;
        this.generation = 0;
    }
    Gen0.name = 0;
    Gen0.prototype = new Gen1();


    function GenA(value) {
        this.value = value;
        this.generation = "A";
        this.toString = new Function ( "return \"(instance of Gen\"+this.generation+\")\"" );

    }
    GenA.prototype = new Gen0();
    GenA.name = "A";

    function GenB(value) {
        this.value = value;
        this.generation = "B";
        this.toString = new Function ( "return \"(instance of Gen\"+this.generation+\")\"" );
    }
    GenB.name = "B"
    GenB.prototype = void 0;

    // RelationalExpression is not an object.

    InstanceOf( true, Boolean, false );
    InstanceOf( new Boolean(false), Boolean, true );

    // Identifier is not a function

    InstanceOf( new Boolean(true), false, false );

    // Identifier is a function, prototype of Identifier is not an object

//    InstanceOf( new GenB(), GenB, false );


    test();