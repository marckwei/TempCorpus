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

load("./resources/typedarray-constructor-helper-functions.js", "caller relative");
description(
"This test checks the behavior of the TypedArray.from function"
);

shouldBe("Int32Array.from.length", "1");
shouldBe("Int32Array.from.name", "'from'");
debug("");

debug("testConstructorFunction has the following arg list (name, args, init, result [ , expectedArray ])");
debug("");

debug("1.0 Single Argument Testing");
shouldBeTrue("testConstructorFunction('from', '([])', [])");
shouldBeTrue("testConstructorFunction('from', '([2])', [2])");
shouldBeTrue("testConstructorFunction('from', '([2,3,4])', [2,3,4])");
debug("");

debug("2.0 Two Argument Testing");
function even(e, i) {
    return !(e & 1) || (this.change ? this.change.indexOf(i) >= 0 : false);
}
shouldBeTrue("testConstructorFunction('from', '([12, 5, 8, 13, 44], even)', [1, 0, 1, 0, 1])");
shouldBeTrue("testConstructorFunction('from', '([11, 54, 18, 13, 1], even)', [0, 1, 1, 0, 0])");
debug("");

debug("3.0 Three Argument Testing");
var thisValue = { change: [1, 3] };
shouldBeTrue("testConstructorFunction('from', '([12, 23, 11, 1, 45], even, thisValue)', [1, 1, 0, 1, 0])");
debug("");


debug("4.0 Exception Test");
function isBigEnoughAndException(element, index, array) {
    if(index==1) throw "exception from function";
    return (element >= 10);
}
shouldThrow("testConstructorFunction('from', '([12, 15, 10, 13, 44], isBigEnoughAndException)', false)");
debug("");

debug("5.0 Wrong Type for Callback Test");
shouldThrow("testConstructorFunction('from', '( [12, 15, 10, 13, 44], 8)', false)");
shouldThrow("testConstructorFunction('from', '([12, 15, 10, 13, 44], \"wrong\")', false)");
shouldThrow("testConstructorFunction('from', '([12, 15, 10, 13, 44], new Object())', false)");
shouldThrow("testConstructorFunction('from', '([12, 15, 10, 13, 44], null)', false)");
debug("");
finishJSTest();
