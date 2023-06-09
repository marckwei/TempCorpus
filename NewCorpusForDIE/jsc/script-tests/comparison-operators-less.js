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

description("test that comparison operators work correctly.")

function makeTest(start, end, expression, relationship, override, invert) {
    var resultValue = eval(relationship + expression + 0) || !!override;
    if (invert)
        resultValue = !resultValue;
    var expr = start + expression + end;
    var result = [];
    function func(content) { var f = new Function(content); f.toString = function(){ return content}; return f; } 
    result.push([new func("return " + expr + ";"), resultValue]);
    result.push([new func("if (" + expr + ") return true; return false;"), resultValue]);
    result.push([new func("var k = 0; while (" + expr + ") if (k++) return true; return false;"), resultValue]);
    result.push([new func("var k = 0; for (; " + expr + "; ) if (k++) return true; return false;"), resultValue]);
    return result;
}
function doTest(lhs, rhs, relationship) {
    var expressionParts = [["(",")"],["(", ") || 1", true],["(", ") && 1"],["(", ") || 1", true],["1 || (",")", true],["1 && (",")"]];
    var expressions = [];
    var tests = [];
    for (var i = 0; i < expressionParts.length; i++) {
        var start = expressionParts[i][0] + lhs;
        var end = String(rhs) + expressionParts[i][1];
        tests.push.apply(tests, makeTest(start, end, "<", relationship, expressionParts[i][2]));
        tests.push.apply(tests, makeTest(start, end, "<=", relationship, expressionParts[i][2]));
    }
    for (var i = 0; i < tests.length; i++) {
        if ((r=tests[i][0]()) == tests[i][1])
            testPassed(tests[i][0] + " is " + tests[i][1]);
        else
            testFailed(tests[i][0] + " is " + r + " and should be " + tests[i][1] + ".");
    }
}

var letterA = "a";
var letterB = "b";
var letter0 = "0";
var One = 1;
var Zero = 0;
doTest('"a"', '"b"', -1);
doTest('"a"', '"a"', 0);
doTest('"b"', '"a"', 1);
doTest('letterA', '"b"', -1);
doTest('letterA', '"a"', 0);
doTest('"b"', '"a"', 1);
doTest('letterA', '"b"', -1);
doTest('letterA', 'letterA', 0);
doTest('"b"', 'letterA', 1);
doTest('"a"', '"b"', -1);
doTest('"a"', 'letterA', 0);
doTest('"b"', 'letterA', 1);

doTest('"a"', '0', NaN);
doTest('0', '"a"', NaN);
doTest('letterA', '0', NaN);
doTest('letterA', '"a"', 0);
doTest('0', '"a"', NaN);
doTest('letterA', 'letterA', 0);
doTest('0', 'letterA', NaN);
doTest('"a"', 'letterA', 0);
doTest('0', 'letterA', NaN);


doTest('0', '"0"', 0);
doTest('Zero', 'letter0', 0);
doTest('0', 'letter0', 0);
doTest('Zero', '"0"', 0);
doTest('-1', '"0"', -1);
doTest('1', '"0"', 1);
doTest('0', '"-1"', 1);
doTest('0', '"1"', -1);

doTest('0', '1', -1);
doTest('0', '0', 0);
doTest('1', '0', 1);
doTest('Zero', '1', -1);
doTest('Zero', '0', 0);
doTest('1', 'Zero', 1);
doTest('0', 'One', -1);
doTest('One', '0', 1);

shouldBeTrue("0 <= 0");
shouldBeTrue("0 <= 1");
shouldBeTrue("1 <= 1");
shouldBeTrue("0 < 1");
shouldBeFalse("1 <= 0");
shouldBeFalse("2 <= 1");
shouldBeFalse("1 < 1");
shouldBeFalse("2 < 1");

 shouldBeTrue("if (0 <= 0 || 0) true; else false");
 shouldBeTrue("if (0 <= 1 || 0) true; else false");
 shouldBeTrue("if (1 <= 1 || 0) true; else false");
 shouldBeTrue("if (0 <  1 || 0) true; else false");
shouldBeFalse("if (1 <= 0 || 0) true; else false");
shouldBeFalse("if (2 <= 1 || 0) true; else false");
shouldBeFalse("if (1 <  1 || 0) true; else false");
shouldBeFalse("if (2 <  1 || 0) true; else false");

shouldBeTrue("0 <= 0.5");
shouldBeTrue("0 <= 1.5");
shouldBeTrue("1 <= 1.5");
shouldBeTrue("0 < 1.5");
shouldBeFalse("1 <= 0.5");
shouldBeFalse("2 <= 1.5");
shouldBeTrue("1 < 1.5");
shouldBeFalse("2 < 1.5");

 shouldBeTrue("if (0 <= 0.5 || 0) true; else false");
 shouldBeTrue("if (0 <= 1.5 || 0) true; else false");
 shouldBeTrue("if (1 <= 1.5 || 0) true; else false");
 shouldBeTrue("if (0 <  1.5 || 0) true; else false");
shouldBeFalse("if (1 <= 0.5 || 0) true; else false");
shouldBeFalse("if (2 <= 1.5 || 0) true; else false");
 shouldBeTrue("if (1 <  1.5 || 0) true; else false");
shouldBeFalse("if (2 <  1.5 || 0) true; else false");

var zero = 0;
var one = 1;
var two = 2;
var p5 = 0.5;
var p15 = 1.5;


shouldBeTrue("zero <= zero");
shouldBeTrue("zero <= 1");
shouldBeTrue("1 <= 1");
shouldBeTrue("zero < 1");
shouldBeFalse("1 <= zero");
shouldBeFalse("2 <= 1");
shouldBeFalse("1 < 1");
shouldBeFalse("2 < 1");

 shouldBeTrue("if (zero <= zero || 0) true; else false");
 shouldBeTrue("if (zero <= 1 || zero) true; else false");
 shouldBeTrue("if (1 <= 1 || zero) true; else false");
 shouldBeTrue("if (zero <  1 || zero) true; else false");
shouldBeFalse("if (1 <= zero || zero) true; else false");
shouldBeFalse("if (2 <= 1 || zero) true; else false");
shouldBeFalse("if (1 <  1 || zero) true; else false");
shouldBeFalse("if (2 <  1 || zero) true; else false");

shouldBeTrue("0 <= p5");
shouldBeTrue("0 <= p15");
shouldBeTrue("1 <= p15");
shouldBeTrue("0 < p15");
shouldBeFalse("1 <= p5");
shouldBeFalse("2 <= p15");
shouldBeTrue("1 < p15");
shouldBeFalse("2 < p15");

 shouldBeTrue("if (0 <= p5 || 0) true; else false");
 shouldBeTrue("if (0 <= p15 || 0) true; else false");
 shouldBeTrue("if (1 <= p15 || 0) true; else false");
 shouldBeTrue("if (0 <  p15 || 0) true; else false");
shouldBeFalse("if (1 <= p5 || 0) true; else false");
shouldBeFalse("if (2 <= p15 || 0) true; else false");
 shouldBeTrue("if (1 <  p15 || 0) true; else false");
shouldBeFalse("if (2 <  p15 || 0) true; else false");


shouldBeTrue("zero <= zero");
shouldBeTrue("zero <= one");
shouldBeTrue("one <= one");
shouldBeTrue("zero < one");
shouldBeFalse("one <= zero");
shouldBeFalse("two <= one");
shouldBeFalse("one < one");
shouldBeFalse("two < one");

 shouldBeTrue("if (zero <= zero || 0) true; else false");
 shouldBeTrue("if (zero <= one || zero) true; else false");
 shouldBeTrue("if (one <= one || zero) true; else false");
 shouldBeTrue("if (zero <  one || zero) true; else false");
shouldBeFalse("if (one <= zero || zero) true; else false");
shouldBeFalse("if (two <= one || zero) true; else false");
shouldBeFalse("if (one <  one || zero) true; else false");
shouldBeFalse("if (two <  one || zero) true; else false");

shouldBeTrue("0 <= p5");
shouldBeTrue("0 <= p15");
shouldBeTrue("one <= p15");
shouldBeTrue("0 < p15");
shouldBeFalse("one <= p5");
shouldBeFalse("two <= p15");
shouldBeTrue("one < p15");
shouldBeFalse("two < p15");

 shouldBeTrue("if (0 <= p5 || 0) true; else false");
 shouldBeTrue("if (0 <= p15 || 0) true; else false");
 shouldBeTrue("if (one <= p15 || 0) true; else false");
 shouldBeTrue("if (0 <  p15 || 0) true; else false");
shouldBeFalse("if (one <= p5 || 0) true; else false");
shouldBeFalse("if (two <= p15 || 0) true; else false");
 shouldBeTrue("if (one <  p15 || 0) true; else false");
shouldBeFalse("if (two <  p15 || 0) true; else false");


shouldBeFalse(" 0 <    NaN");
shouldBeFalse(" NaN <  NaN");
shouldBeFalse(" 0 <=   NaN");
shouldBeFalse(" NaN <= NaN");
shouldBeFalse(" 0.5 <  NaN");
shouldBeFalse(" NaN <  NaN");
shouldBeFalse(" 0.5 <= NaN");
shouldBeFalse(" NaN <= NaN");
shouldBeFalse(" zero < NaN");
shouldBeFalse("zero <= NaN");
shouldBeFalse(" NaN <= NaN");
shouldBeFalse(" p5  <  NaN");
shouldBeFalse("NaN  <  NaN");
shouldBeFalse("p5  <=  NaN");
shouldBeFalse("NaN  <= NaN");


shouldBeFalse("if ( 0 <    NaN) true; else false;");
shouldBeFalse("if ( NaN <  NaN) true; else false;");
shouldBeFalse("if ( 0 <=   NaN) true; else false;");
shouldBeFalse("if ( NaN <= NaN) true; else false;");
shouldBeFalse("if ( 0.5 <  NaN) true; else false;");
shouldBeFalse("if ( NaN <  NaN) true; else false;");
shouldBeFalse("if ( 0.5 <= NaN) true; else false;");
shouldBeFalse("if ( NaN <= NaN) true; else false;");
shouldBeFalse("if ( zero < NaN) true; else false;");
shouldBeFalse("if (zero <= NaN) true; else false;");
shouldBeFalse("if ( NaN <= NaN) true; else false;");
shouldBeFalse("if ( p5  <  NaN) true; else false;");
shouldBeFalse("if (NaN  <  NaN) true; else false;");
shouldBeFalse("if (p5  <=  NaN) true; else false;");
shouldBeFalse("if (NaN  <= NaN) true; else false;");
