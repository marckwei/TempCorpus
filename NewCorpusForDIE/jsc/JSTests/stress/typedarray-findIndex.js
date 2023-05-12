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
"This test checks the behavior of the TypedArray.prototype.findIndex function"
);

shouldBe("Int32Array.prototype.findIndex.length", "1");
shouldBe("Int32Array.prototype.findIndex.name", "'findIndex'");
shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('findIndex')");
shouldBeTrue("testPrototypeReceivesArray('findIndex', [undefined, this, { }, [ ], true, ''])");
debug("");

debug("testPrototypeFunction has the following arg list (name, args, init, result [ , expectedArray ])");
debug("");

debug("1.0 Single Argument Testing");
function keepEven(e, i) {
    return !(e & 1) || (this.keep ? this.keep === i : false);
}
shouldBeTrue("testPrototypeFunction('findIndex', '(keepEven)', [12, 5, 8, 13, 44], 0)");
shouldBeTrue("testPrototypeFunction('findIndex', '(keepEven)', [11, 13, 17, 13, 22], 4)");
shouldBeTrue("testPrototypeFunction('findIndex', '(keepEven)', [11, 13, 17, 13, 11], -1)");
debug("");

debug("2.0 Two Argument Testing");
var thisValue = { keep: 3 };
shouldBeTrue("testPrototypeFunction('findIndex', '(keepEven, thisValue)', [11, 23, 11, 1, 44], 3)");
debug("");

debug("3.0 Array Element Changing");
function keepEvenAndChange(e, i, a) {
    a[a.length - 1 - i] = 5;
    return !(e & 1);
}
shouldBeTrue("testPrototypeFunction('findIndex', '(keepEvenAndChange)', [11, 15, 3, 12, 44], -1, [5, 5, 5, 5, 5])");
debug("");

debug("4.0 Exception Test");
function isBigEnoughAndException(element, index, array) {
    if(index==1) throw "exception from function";
    return (element >= 10);
}
shouldBeTrue("testPrototypeFunction('findIndex', '(isBigEnoughAndException)', [12, 15, 10, 13, 44], 0)");
shouldThrow("testPrototypeFunction('findIndex', '(isBigEnoughAndException)', [9, 15, 10, 13, 44], false)");
debug("");

debug("5.0 Wrong Type for Callback Test");
shouldThrow("testPrototypeFunction('findIndex', '(8)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findIndex callback must be a function'");
shouldThrow("testPrototypeFunction('findIndex', '(\"wrong\")', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findIndex callback must be a function'");
shouldThrow("testPrototypeFunction('findIndex', '(new Object())', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findIndex callback must be a function'");
shouldThrow("testPrototypeFunction('findIndex', '(null)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findIndex callback must be a function'");
shouldThrow("testPrototypeFunction('findIndex', '()', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.findIndex callback must be a function'");
debug("");
finishJSTest();
