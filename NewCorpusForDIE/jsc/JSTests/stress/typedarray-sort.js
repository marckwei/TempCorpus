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

load("./resources/typedarray-test-helper-functions.js", "caller relative");
description(
"This test checks the behavior of the TypedArray.prototype.sort function"
);

shouldBe("Int32Array.prototype.sort.length", "1");
shouldBe("Int32Array.prototype.sort.name", "'sort'");
shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('sort')");
shouldBeTrue("testPrototypeReceivesArray('sort', [undefined, this, { }, [ ], true, ''])");
debug("");

debug("testPrototypeFunction has the following arg list (name, args, init, result [ , expectedArray ])");
debug("");

debug("1.0 No Argument Testing");
shouldBeTrue("testPrototypeFunction('sort', '()', [12, 5, 8, 13, 44], [5, 8, 12, 13, 44], [5, 8, 12, 13, 44])");
shouldBeTrue("testPrototypeFunction('sort', '()', [2, 4, 8, 3, 4], [2, 3, 4, 4, 8])");
debug("");

debug("1.1 Signed Numbers");
shouldBeTrue("testPrototypeFunctionOnSigned('sort', '()', [12, -5, 8, -13, 44], [-13, -5, 8, 12, 44])");
debug("");

debug("1.2 Float Numbers");
shouldBeTrue("testPrototypeFunctionOnFloat('sort', '()', [12, -5, 0, -0, -13, 44], [-13, -5, -0, 0, 12, 44])");

debug("1.3 Negative NaNs");
var buffer = new ArrayBuffer(8);
var intView = new Int32Array(buffer);
var floatView = new Float32Array(buffer);
intView[0] = -1;

floatView.sort();
shouldBeTrue("Object.is(floatView[0],0) && Object.is(floatView[1], NaN)");
debug("");

debug("2.0 Custom Function Testing");
function sortBackwards(a, b) { return b - a; }
shouldBeTrue("testPrototypeFunction('sort', '(sortBackwards)', [2, 5, 10, 3, 4], [10, 5, 4, 3, 2])");
debug("");

debug("3.0 Exception Test");
var count = 0;
function compareException(a, b) {
    if(count++ === 4) throw "exception from function";
    return a < b;
}
shouldThrow("testPrototypeFunction('sort', '(compareException)', [12, 15, 10, 13, 44], true)");
debug("");

debug("4.0 Wrong Type for Callback Test");
shouldThrow("testPrototypeFunction('sort', '(8)', [12, 15, 10, 13, 44], [10, 12, 13, 15, 44])");
shouldThrow("testPrototypeFunction('sort', '(\"wrong\")', [12, 15, 10, 13, 44], [10, 12, 13, 15, 44])");
shouldThrow("testPrototypeFunction('sort', '(new Object())', [12, 15, 10, 13, 44], [10, 12, 13, 15, 44])");
shouldThrow("testPrototypeFunction('sort', '(null)', [12, 15, 10, 13, 44], [10, 12, 13, 15, 44])");
debug("");
finishJSTest();
