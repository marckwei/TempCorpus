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

"use strict";

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}!`);
}

function shouldThrow(func, errorMessage) {
    let errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (String(error) !== errorMessage)
            throw new Error(`Bad error: ${error}`);
    }
    if (!errorThrown)
        throw new Error("Didn't throw!");
}

const poisonedSetter = { set() { throw new Error("Object.prototype setter should be unreachable!"); } };
const primitives = [true, 1, "", Symbol(), 0n];

(function testStaticCustomValue() {
    Object.defineProperties(Object.prototype, {
        testStaticValue: poisonedSetter,
        testStaticValueNoSetter: poisonedSetter,
        testStaticValueReadOnly: poisonedSetter,
    });

    for (const primitive of primitives) {
        const primitivePrototype = Object.getPrototypeOf(primitive);
        const staticCustomValue = $vm.createStaticCustomValue();
        Object.setPrototypeOf(primitivePrototype, staticCustomValue);

        primitive.testStaticValue = 1;
        shouldBe(staticCustomValue.testStaticValue, 1);
        shouldThrow(() => { primitive.testStaticValue = 1; }, "TypeError: Attempted to assign to readonly property.");

        shouldThrow(() => { primitive.testStaticValueNoSetter = 1; }, "TypeError: Attempted to assign to readonly property.");
        shouldThrow(() => { primitive.testStaticValueReadOnly = 1; }, "TypeError: Attempted to assign to readonly property.");
        Object.setPrototypeOf(primitivePrototype, Object.prototype);
    }
})();

(function testStaticCustomAccessor() {
    Object.defineProperties(Object.prototype, {
        testStaticAccessor: poisonedSetter,
        testStaticAccessorReadOnly: poisonedSetter,
    });

    for (const primitive of primitives) {
        const primitivePrototype = Object.getPrototypeOf(primitive);
        Object.setPrototypeOf(primitivePrototype, $vm.createStaticCustomAccessor());

        for (let i = 0; i < 1000; i++) {
            primitive.testStaticAccessor = i;
            shouldBe(primitivePrototype.testField, i);
        }

        shouldThrow(() => { primitive.testStaticAccessorReadOnly = 1; }, "TypeError: Attempted to assign to readonly property.");
        Object.setPrototypeOf(primitivePrototype, Object.prototype);
    }
})();
