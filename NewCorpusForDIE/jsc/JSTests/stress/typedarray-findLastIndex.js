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
"This test checks the behavior of the TypedArray.prototype.findLastIndex function"
);

shouldBe("Int32Array.prototype.findLastIndex.length", "1");
shouldBe("Int32Array.prototype.findLastIndex.name", "'findLastIndex'");
shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('findLastIndex')");
shouldBeTrue("testPrototypeReceivesArray('findLastIndex', [undefined, this, { }, [ ], true, ''])");
debug("");

debug("testPrototypeFunction has the following arg list (name, args, init, result [ , expectedArray ])");
debug("");

debug("1.0 Single Argument Testing");
function keepEven(e, i) {
    return !(e & 1) || (this.keep ? this.keep === i : false);
}
shouldBeTrue("testPrototypeFunction('findLastIndex', '(keepEven)', [12, 5, 8, 13, 44], 4)");
shouldBeTrue("testPrototypeFunction('findLastIndex', '(keepEven)', [11, 13, 17, 13, 22], 4)");
shouldBeTrue("testPrototypeFunction('findLastIndex', '(keepEven)', [22, 13, 17, 13, 11], 0)");
shouldBeTrue("testPrototypeFunction('findLastIndex', '(keepEven)', [11, 13, 17, 13, 11], -1)");
debug("");

debug("2.0 Two Argument Testing");
var thisValue = { keep: 3 };
shouldBeTrue("testPrototypeFunction('findLastIndex', '(keepEven, thisValue)', [11, 23, 11, 1, 44], 4)");
shouldBeTrue("testPrototypeFunction('findLastIndex', '(keepEven, thisValue)', [11, 23, 11, 1, 43], 3)");
debug("");

debug("3.0 Array Element Changing");
function keepEvenAndChange(e, i, a) {
    a[a.length - 1 - i] = 5;
    return !(e & 1);
}
shouldBeTrue("testPrototypeFunction('findLastIndex', '(keepEvenAndChange)', [11, 15, 3, 12, 44], 4, [5, 15, 3, 12, 44])");
shouldBeTrue("testPrototypeFunction('findLastIndex', '(keepEvenAndChange)', [44, 12, 3, 15, 11], -1, [5, 5, 5, 5, 5])");
debug("");

debug("4.0 Exception Test");
function isBigEnoughAndException(element, index, array) {
    if(index==3) throw "exception from function";
    return (element >= 44);
}
shouldBeTrue("testPrototypeFunction('findLastIndex', '(isBigEnoughAndException)', [12, 15, 10, 13, 44], 4)");
shouldThrow("testPrototypeFunction('findLastIndex', '(isBigEnoughAndException)', [9, 15, 10, 13, 43], false)");
debug("");

debug("5.0 Wrong Type for Callback Test");
shouldThrow("testPrototypeFunction('findLastIndex', '(8)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findLastIndex callback must be a function'");
shouldThrow("testPrototypeFunction('findLastIndex', '(\"wrong\")', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findLastIndex callback must be a function'");
shouldThrow("testPrototypeFunction('findLastIndex', '(new Object())', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findLastIndex callback must be a function'");
shouldThrow("testPrototypeFunction('findLastIndex', '(null)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findLastIndex callback must be a function'");
shouldThrow("testPrototypeFunction('findLastIndex', '()', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findLastIndex callback must be a function'");
debug("");
finishJSTest();
