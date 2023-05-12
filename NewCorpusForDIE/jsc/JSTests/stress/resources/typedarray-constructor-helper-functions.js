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

load("./standalone-pre.js", "caller relative");

"use strict";

var typedArrays = ["Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];

function forEachTypedArray(constructors, testFunction, name, args) {
    for (let i = 0; i < constructors.length; ++i) {
        let typedArray = constructors[i];

        let result;
        if (name !== "")
            result = eval(typedArray + "." + name + args)
        else
            result = eval("new " + typedArray + args)

        let testResult = testFunction(result, typedArray)
        if (testResult !== true)
            return testResult;
    }

    return true;
}

function hasSameValues(msg, array1, array2) {
    if (array1.length !== array2.length) {
        debug(msg +  "The arrays had differing lengths, first array: " + array1 + " length: " + array1.length + " second array: " + array2 + " length" + array2.length);
        return false;
    }

    let allSame = true;
    for (let i = 0; i < array1.length; ++i) {
        allSame = allSame && Object.is(array1[i], array2[i]);
    }

    if (!allSame)
        debug(msg +  "The array did not have all the expected elements, first array: " + array1 + " second array: " + array2);
    return allSame;

}

function testConstructorFunction(name, args, expected) {
    function foo(array, constructor) {
        if (!hasSameValues(constructor + "." + name + " did not produce the correct result on " + name + args, array, expected))
            return false
        return true;
    }

    return forEachTypedArray(typedArrays, foo, name, args);
}

function testConstructor(args, expected) {
    function foo(array, constructor) {
        if (!hasSameValues(constructor + args + " did not produce the correct result", array, expected))
            return false
        return true;
    }

    return forEachTypedArray(typedArrays, foo, "", args);
}
