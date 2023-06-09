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

var typedArrays = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];

var signedArrays = [Int8Array, Int16Array, Int32Array, Float32Array, Float64Array];

var intArrays = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array];

var floatArrays = [Float32Array, Float64Array];

function forEachTypedArray(constructors, testFunction /* , initialValues */ ) {
    let initialValues = arguments[2];
    for (let i = 0; i < constructors.length; ++i) {
        let typedArray = constructors[i];

        let array;
        if (initialValues) {
            array = new typedArray(initialValues);
        } else
            array = new typedArray();

        let testResult = testFunction(array, typedArray)
        if (testResult !== true)
            return testResult;
    }

    return true;
}

function isSameFunctionForEachTypedArrayPrototype(name) {
    function eq(array) { return array[name] === Int32Array.prototype[name]; }
    return forEachTypedArray(typedArrays, eq);
}

function hasSameValues(msg, array1, array2) {
    if (array1.length !== array2.length) {
        debug(msg +  " first array: " + array1 + " second array: " + array2);
        return false;
    }

    let allSame = true;
    for (let i = 0; i < array1.length; ++i) {
        allSame = allSame && Object.is(array1[i], array2[i]);
    }

    if (!allSame)
        debug(msg +  " first array: " + array1 + " second array: " + array2);
    return allSame;

}

function testPrototypeFunctionHelper(constructors, name, args, init, result, expectedArray) {

    function foo(array, constructor) {
        let res = eval("array." + name + args);

        if (expectedArray) {
            if (!hasSameValues("array did not change correctly on " + constructor + ",", array, expectedArray))
                return false;
        }

        if (typeof result === "object")
            return hasSameValues(name + " returned the wrong result on " + constructor + ",", res, result);
        else {
            if (res !== result) {
                debug(name + " returned the wrong result on " + constructor + ", returned: " + res + " but expected: " + result);
                return false;
            }
            return true;
        }
    }

    return forEachTypedArray(constructors, foo, init);
}

function testPrototypeFunctionOnSigned(name, args, init, result /* expectedArray */) {
    return testPrototypeFunctionHelper(signedArrays, name, args, init, result, arguments[4]);
}

function testPrototypeFunctionOnFloat(name, args, init, result /* expectedArray */) {
    return testPrototypeFunctionHelper(floatArrays, name, args, init, result, arguments[4]);
}

function testPrototypeFunction(name, args, init, result /* expectedArray */) {
    return testPrototypeFunctionHelper(typedArrays, name, args, init, result, arguments[4]);
}

function testPrototypeReceivesArray(name, thisValues) {
    function tester (array, constructor) {
        var passed = true;
        for (var thisValue of thisValues) {
            try {
                eval("array." + name).call(thisValue);
                passed = false;
                debug("did not throw an error when given an invalid |this| on " + constructor);
            } catch (err) {}

        }

        return passed;
    }

    return forEachTypedArray(typedArrays, tester);
}

