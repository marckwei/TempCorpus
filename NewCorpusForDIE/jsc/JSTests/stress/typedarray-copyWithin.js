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
description("This test checks the behavior of the TypedArray.prototype.copyWithin function");


shouldBe("Int32Array.prototype.copyWithin.length", "2");
shouldBe("Int32Array.prototype.copyWithin.name", "'copyWithin'");

shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('copyWithin')");
shouldBeTrue("testPrototypeReceivesArray('copyWithin', [undefined, this, { }, [ ], true, ''])");

shouldBeTrue("testPrototypeFunction('copyWithin', '(0, 3)', [1, 2, 3, 4, 5], [4, 5, 3, 4, 5])");
shouldBeTrue("testPrototypeFunction('copyWithin', '(0, 3, 4)', [1, 2, 3, 4, 5], [4, 2, 3, 4, 5])");
shouldBeTrue("testPrototypeFunction('copyWithin', '(0, -2, -1)', [1, 2, 3, 4, 5], [4, 2, 3, 4, 5])");
shouldBeTrue("testPrototypeFunction('copyWithin', '(5, -5, 5)', [1, 2, 3, 4, 5], [1, 2, 3, 4, 5])");
shouldBeTrue("testPrototypeFunction('copyWithin', '(1, -5, 5)', [1, 2, 3, 4, 5], [1, 1, 2, 3, 4])");
finishJSTest();
