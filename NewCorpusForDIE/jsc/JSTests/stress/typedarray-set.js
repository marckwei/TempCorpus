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
description("This test checks the behavior of the TypedArray.prototype.set function");

shouldBe("Int32Array.prototype.set.length", "1");
shouldBe("Int32Array.prototype.set.name", "'set'");

shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('set')");
shouldBeTrue("testPrototypeReceivesArray('set', [undefined, this, { }, [ ], true, ''])");
debug("");

debug("1.0 Normal Calls");
shouldBeTrue("testPrototypeFunction('set', '([2, 3, 4])', [1, 2, 3, 4, 5], undefined, [2, 3, 4, 4, 5])");
debug("This next should pass because -.1 when converted to an integer is -0");
shouldBeTrue("testPrototypeFunction('set', '([2, 3, 4], -.1)', [1, 2, 3, 4, 5], undefined, [2, 3, 4, 4, 5])");
shouldBeTrue("testPrototypeFunction('set', '([2, 3, 4], 2)', [1, 2, 3, 4, 5], undefined, [1, 2, 2, 3, 4])");
shouldBeTrue("testPrototypeFunction('set', '([], 5)', [1, 2, 3, 4, 5], undefined, [1, 2, 3, 4, 5])");
shouldBeTrue("testPrototypeFunction('set', '([])', [1, 2, 3, 4, 5], undefined, [1, 2, 3, 4, 5])");
debug("");

debug("2.0 Bad Range Test");
shouldThrow("testPrototypeFunction('set', '([], -1)', [1, 2, 3, 4, 5], false, false)", "'RangeError: Offset should not be negative'");
shouldThrow("testPrototypeFunction('set', '([2, 3, 4], -1)', [1, 2, 3, 4, 5], false, false)", "'RangeError: Offset should not be negative'");
shouldThrow("testPrototypeFunction('set', '([2, 3, 4], -1.23412)', [1, 2, 3, 4, 5], false, false)", "'RangeError: Offset should not be negative'");
shouldThrow("testPrototypeFunction('set', '([2, 3, 4], 1000)', [1, 2, 3, 4, 5], false, false)", "'RangeError: Range consisting of offset and length are out of bounds'");
shouldThrow("testPrototypeFunction('set', '([2, 3, 4], 1e42*1.2434325231)', [1, 2, 3, 4, 5], false, false)", "'RangeError: Range consisting of offset and length are out of bounds'");

finishJSTest();
