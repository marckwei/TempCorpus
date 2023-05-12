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
"This test checks the behavior of the TypedArray.prototype.every function"
);

shouldBe("Int32Array.prototype.every.length", "1");
shouldBe("Int32Array.prototype.every.name", "'every'");
shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('every')");
shouldBeTrue("testPrototypeReceivesArray('every', [undefined, this, { }, [ ], true, ''])");
debug("");

debug("testPrototypeFunction has the following arg list (name, args, init, result [ , expectedArray ])");
debug("");

debug("1.0 Single Argument Testing");
function isBigEnough(element, index, array) {
    if (this.value)
        return element >= this.value;
    return element >= 10;
}
shouldBeTrue("testPrototypeFunction('every', '(isBigEnough)', [12, 5, 8, 13, 44], false)");
shouldBeTrue("testPrototypeFunction('every', '(isBigEnough)', [12, 54, 18, 13, 44], true)");
debug("");

debug("2.0 Two Argument Testing");
var thisValue = { value: 11 };
shouldBeTrue("testPrototypeFunction('every', '(isBigEnough, thisValue)', [12, 15, 10, 13, 44], false)");
shouldBeTrue("testPrototypeFunction('every', '(isBigEnough, thisValue)', [12, 54, 82, 13, 44], true)");
debug("");

debug("3.0 Array Element Changing");
function isBigEnoughAndChange(element, index, array) {
    array[array.length - 1 - index] = 5;
    return (element >= 10);
}
shouldBeTrue("testPrototypeFunction('every', '(isBigEnoughAndChange)', [12, 15, 1, 13, 44], false, [12, 15, 5, 5, 5])");
shouldBeTrue("testPrototypeFunction('every', '(isBigEnoughAndChange)', [12, 15, 10, 13, 44], false, [12, 5, 5, 5, 5])");
debug("");

debug("4.0 Exception Test");
function isBigEnoughAndException(element, index, array) {
    if(index==1) throw "exception from function";
    return (element >= 10);
}
shouldThrow("testPrototypeFunction('every', '(isBigEnoughAndException)', [12, 15, 10, 13, 44], false)");
debug("");

debug("5.0 Wrong Type for Callback Test");
shouldThrow("testPrototypeFunction('every', '(8)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.every callback must be a function'");
shouldThrow("testPrototypeFunction('every', '(\"wrong\")', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.every callback must be a function'");
shouldThrow("testPrototypeFunction('every', '(new Object())', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.every callback must be a function'");
shouldThrow("testPrototypeFunction('every', '(null)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.every callback must be a function'");
shouldThrow("testPrototypeFunction('every', '()', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.every callback must be a function'");
debug("");

finishJSTest();
