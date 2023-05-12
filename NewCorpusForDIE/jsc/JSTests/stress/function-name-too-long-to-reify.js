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

//@ skip if $memoryLimited
//@ runDefault
var prop = "".padEnd(2 ** 31 - 1, "a");

function shouldBe(actual, expected) {
    if (String(actual) !== expected)
        throw new Error('Actual Value:' + actual + 'Expected Value:' + expected);
    return true;
}

function shouldThrow(func, expectedError) {
    var errorThrown = false;
    var ActualError = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        ActualError = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (!shouldBe(ActualError, expectedError))
        throw new Error(`bad error: ${String(ActualError)}`);
}

function classSetter() {
    class A {
        set [prop](_) {
        }
    }
}

function objectSetter() {
    let obj = {
        set [prop](_) {
        }
    };
}

function classGetter() {
    class A {
        get [prop]() {
        }
    }
}

function objectGetter() {
    let obj = {
        get [prop]() {
        }
    };
}

setterExpectedError = "RangeError: Out of memory: Setter name is too long";
getterExpectedError = "RangeError: Out of memory: Getter name is too long";

shouldThrow(classSetter, setterExpectedError);
shouldThrow(classSetter, setterExpectedError); // Make sure it should still throw.
shouldThrow(classGetter, getterExpectedError);
shouldThrow(classGetter, getterExpectedError); // Make sure it should still throw.

shouldThrow(objectSetter, setterExpectedError);
shouldThrow(objectSetter, setterExpectedError); // Make sure it should still throw.
shouldThrow(objectGetter, getterExpectedError);
shouldThrow(objectGetter, getterExpectedError); // Make sure it should still throw.
