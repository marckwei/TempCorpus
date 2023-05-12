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

const arrayPush = $vm.createBuiltin("(function (a, v) { @arrayPush(a, v); })");
noInline(arrayPush);

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}.`);
}

function shouldThrow(func, errorMessage)
{
    var errorThrown = false;
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

shouldThrow(
    () => arrayPush(x, y),
    "ReferenceError: Can't find variable: x",
);

shouldThrow(
    () => arrayPush({ get length() { throw new Error("'length' should be unreachable."); } }, y),
    "ReferenceError: Can't find variable: y",
);

for (let i = 0; i < 5; ++i) {
    Object.defineProperty(Object.prototype, i, {
        get() { throw new Error(i + " getter should be unreachable."); },
        set(_value) { throw new Error(i + " setter should be unreachable."); },
    });
}

(() => {
    const arr = [];
    for (let i = 0; i < 1e5; ++i) {
        arrayPush(arr, i);
        shouldBe(arr[i], i);
        shouldBe(arr.length, i + 1);
    }
})();

(() => {
    const maxLength = 2 ** 32 - 1;
    const startIndex = maxLength - 1e4;
    const arr = new Array(startIndex);

    for (let i = 0; i < 1e4; ++i) {
        arrayPush(arr, i);
        shouldBe(arr[startIndex + i], i);
        shouldBe(arr.length, startIndex + i + 1);
    }

    shouldBe(arr.length, maxLength);

    for (let i = 0; i < 5; ++i) {
        Object.defineProperty(Object.prototype, maxLength + i, {
            get() { throw new Error(i + " getter should be unreachable."); },
            set(_value) { throw new Error(i + " setter should be unreachable."); },
        });
    }

    for (let i = 1; i < 1e4; ++i) {
        arrayPush(arr, i);
        shouldBe(arr.hasOwnProperty(maxLength + i), false);
        shouldBe(arr.length, maxLength);
    }
})();
