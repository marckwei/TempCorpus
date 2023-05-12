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

description(
"This test checks that toString() round-trip on a function that has a array with elision does not remove a comma."
);

function f1() {
    return [,];
}

function f2() {
    return [1];
}

function f3() {
    return [1,];
}

// this is the first testcase that proves that trailing
// elision comma is not removed
function f4() {
    return [1,,];
}

function f5() {
    return [1,,,];
}
function f6() {
    return [1,,,4];
}

function f7() {
    return [,2,];
}

function f8() {
    return [,2,,];
}

function f9() {
    return [,2,,,5];
}

function f10() {
    return [,,3,,,];
}

function f11() {
    return [,,3,,,6];
}

function f12() {
    return [,undefined];
}

function f13() {
    return [,undefined,];
}

function f14() {
    return [,undefined,,];
}

function f15() {
    return [,,];
}

function f16() {
    return [,,,];
}

shouldBe("typeof undefined", "'undefined'");

unevalf = function(x) { return '(' + x.toString() + ')'; };

function testToStringAndLength(fn, length, lastElement)
{
    // check that array length is correct
    shouldBe(""+ fn +"().length", "" + length);

    // check that last element is what it is supposed to be
    shouldBe(""+ fn +"()[" + length +"-1]", "" + lastElement);

    // check that toString result evaluates to code that can be evaluated
    // and that toString doesn't remove the trailing elision comma.
    shouldBe("unevalf(eval(unevalf("+fn+")))", "unevalf(" + fn + ")");

    // check that toString()ed functions should retain semantics

    shouldBe("eval(unevalf("+fn+"))().length", ""+length);
    shouldBe("eval(unevalf("+fn+"))()[" + length +"-1]", ""+lastElement);
}


testToStringAndLength("f1", 1);
testToStringAndLength("f2", 1, 1);
testToStringAndLength("f3", 1,1);
testToStringAndLength("f4", 2);
testToStringAndLength("f5", 3);
testToStringAndLength("f6", 4, 4);
testToStringAndLength("f7", 2, 2);
testToStringAndLength("f8", 3);
testToStringAndLength("f9", 5, 5);
testToStringAndLength("f10", 5);
testToStringAndLength("f11", 6, 6);
testToStringAndLength("f12", 2);
testToStringAndLength("f13", 2);
testToStringAndLength("f14", 3);
testToStringAndLength("f15", 2);
testToStringAndLength("f16", 3);
