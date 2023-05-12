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

function testArray(array, expected) {
    var s = array.join('M');
    if (s !== expected)
        throw("Bad result for array " + array + " expected: \"" + expected + "\" but got: \"" + s + "\"");
}

function testABC(n, resA, resB, resC) {
    testArray(new Array(n), resA);
    testArray(new B(n), resB);
    testArray(new C(n), resC);
}

class B extends Array { }
class C extends B { }


testABC(0, "", "", "");
testABC(1, "", "", "");
testABC(3, "MM", "MM", "MM")

B.prototype[0] = "foo";
testABC(0, "", "", "");
testABC(1, "", "foo", "foo");
testABC(3, "MM", "fooMM", "fooMM");

C.prototype[1] = "bar";
testABC(0, "", "", "");
testABC(1, "", "foo", "foo");
testABC(3, "MM", "fooMM", "fooMbarM");

Array.prototype[1] = "baz";
testABC(0, "", "", "");
testABC(1, "", "foo", "foo");
testABC(3, "MbazM", "fooMbazM", "fooMbarM");
