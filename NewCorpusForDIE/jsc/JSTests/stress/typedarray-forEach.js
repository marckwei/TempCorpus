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
"This test checks the behavior of the TypedArray.prototype.forEach function"
);

shouldBe("Int32Array.prototype.forEach.length", "1");
shouldBe("Int32Array.prototype.forEach.name", "'forEach'");
shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('forEach')");
shouldBeTrue("testPrototypeReceivesArray('forEach', [undefined, this, { }, [ ], true, ''])");
debug("");

var passed = true;
var thisPassed = true;
var typedArray;
function createChecker(expected, callback, thisValue) {
    function checkCorrect(array) {
        let list = []
        function accumulate(e, i, a) {
            list.push(callback.call(this, e, i, a));
        }

        typedArray = array;
        array.forEach(accumulate, thisValue);

        if (list.length !== expected.length) {
            debug("forEach did not work correctly, computed array: " + list + " expected array: " + expected);
            passed = false;
        }

        for (let i = 0; i < list.length; ++i)
            if (list[i] !== expected[i]) {
                debug("forEach did not work correctly, computed array: " + list + " expected array: " + expected);
                passed = false;
            }
    }

    return checkCorrect;
}

function foo(e, i) {
    if (this.value !== 3)
        thisPassed = false;
    return e;
}


debug("1.0 Single Argument Testing");

forEachTypedArray(typedArrays, createChecker([1, 2, 3, 4, 5], foo, undefined), [1, 2, 3, 4, 5]);
shouldBeTrue("passed");
debug("");

debug("2.0 Two Argument Testing");
passed = true;
thisPassed = true;

forEachTypedArray(typedArrays, createChecker([1, 2, 3, 4, 5], foo, { value: 3 }), [1, 2, 3, 4, 5]);
shouldBeTrue("passed && thisPassed");

passed = true;
thisPassed = true;
forEachTypedArray(typedArrays, createChecker([1, 2, 3, 4, 5], foo, { value: 2 }), [1, 2, 3, 4, 5]);
shouldBeTrue("passed && !thisPassed");
debug("");

debug("3.0 Array Element Changing");
function changeArray(e, i, a) {
    a[a.length - 1 - i] = 5;
    return e;
}

forEachTypedArray(typedArrays, createChecker([11, 12, 13, 5, 5], changeArray), [11, 12, 13, 14, 15]);
shouldBeTrue("passed && hasSameValues('array did not mutate correctly', typedArray, [5, 5, 5, 5, 5])");
debug("");

debug("4.0 Exception Test");
function isBigEnoughAndException(element, index, array) {
    if(index==1) throw "exception from function";
    return (element);
}
shouldThrow("testPrototypeFunction('forEach', '(isBigEnoughAndException)', [9, 15, 10, 13, 44], false)");
debug("");

debug("5.0 Wrong Type for Callback Test");
shouldThrow("testPrototypeFunction('forEach', '(8)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.forEach callback must be a function'");
shouldThrow("testPrototypeFunction('forEach', '(\"wrong\")', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.forEach callback must be a function'");
shouldThrow("testPrototypeFunction('forEach', '(new Object())', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.forEach callback must be a function'");
shouldThrow("testPrototypeFunction('forEach', '(null)', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.forEach callback must be a function'");
shouldThrow("testPrototypeFunction('forEach', '()', [12, 15, 10, 13, 44], false)", "'TypeError: TypedArray.prototype.forEach callback must be a function'");
debug("");
finishJSTest();
