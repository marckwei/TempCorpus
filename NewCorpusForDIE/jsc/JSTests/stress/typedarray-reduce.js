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
"This test checks the behavior of the TypedArray.prototype.reduce function"
);

shouldBe("Int32Array.prototype.reduce.length", "1");
shouldBe("Int32Array.prototype.reduce.name", "'reduce'");
shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('reduce')");
shouldBeTrue("testPrototypeReceivesArray('reduce', [undefined, this, { }, [ ], true, ''])");
debug("");

debug("testPrototypeFunction has the following arg list (name, args, init, result [ , expectedArray ])");
debug("");

debug("1.0 Single Argument Testing");
function createArray(acc, e, i, a) {
    if (typeof acc !== "object")
        acc = [acc];
    acc.push(e);
    return acc;
}

function sum(acc, e, i, a) { return acc + e; }

shouldBeTrue("testPrototypeFunction('reduce', '(createArray)', [12, 5, 8, 13, 44], [12, 5, 8, 13, 44], [12, 5, 8, 13, 44])");
shouldBeTrue("testPrototypeFunction('reduce', '(sum)', [1, 2, 3, 4, 5], 15)");
debug("");

debug("2.0 Two Argument Testing");

shouldBeTrue("testPrototypeFunction('reduce', '(createArray, [1])', [12, 23, 11, 1, 45], [1, 12, 23, 11, 1, 45], [12, 23, 11, 1, 45])");
debug("");

debug("3.0 Array Element Changing");
function createArrayAndChange(acc, e, i, a) {
    a[a.length - 1 - i] = 5;
    acc.push(e);
    return acc;
}
shouldBeTrue("testPrototypeFunction('reduce', '(createArrayAndChange, [])', [12, 15, 2, 13, 44], [12, 15, 2, 5, 5], [5, 5, 5, 5, 5])");
debug("");

debug("4.0 Exception Test");
function isBigEnoughAndException(acc, element, index, array) {
    if(index==1) throw "exception from function";
    return (element >= 10);
}
shouldThrow("testPrototypeFunction('reduce', '(isBigEnoughAndException)', [12, 15, 10, 13, 44], false)");
debug("");

debug("5.0 Wrong Type for Callback Test");
shouldThrow("testPrototypeFunction('reduce', '(8)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.reduce callback must be a function'");
shouldThrow("testPrototypeFunction('reduce', '(\"wrong\")', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.reduce callback must be a function'");
shouldThrow("testPrototypeFunction('reduce', '(new Object())', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.reduce callback must be a function'");
shouldThrow("testPrototypeFunction('reduce', '(null)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.reduce callback must be a function'");
shouldThrow("testPrototypeFunction('reduce', '()', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.reduce callback must be a function'");
shouldThrow("testPrototypeFunction('reduce', '(new Function())', [], false)", "'TypeError: TypedArray.prototype.reduce of empty array with no initial value'");
debug("");
finishJSTest();
