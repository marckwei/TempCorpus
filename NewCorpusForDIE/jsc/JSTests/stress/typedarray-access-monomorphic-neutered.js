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

typedArrays = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];

function checkNoException(array, thunk, count) {
    thunk(array, count);
}
noInline(checkNoException);

function testNoException(thunk, array) {
    let fn = Function("array", "i", thunk);
    noInline(fn);
    for (let i = 0; i < 10000; i++)
        checkNoException(array, fn, i);
}

for (let constructor of typedArrays) {
    let array = new constructor(10);
    transferArrayBuffer(array.buffer);
    testNoException("array[0]", array);
    testNoException("delete array[0]", array);
    testNoException("Object.getOwnPropertyDescriptor(array, 0)", array);
    testNoException("array[0] = 1", array);
    testNoException("array[i] = 1", array);
}

function testFTLNoException(thunk, array, failArray) {
    let fn = Function("array", "i", thunk);
    noInline(fn);
    for (let i = 0; i < 10000; i++)
        fn(array, i)
    checkNoException(failArray, fn, 10000);
}

for (let constructor of typedArrays) {
    let array = new constructor(10);
    let failArray = new constructor(10);
    transferArrayBuffer(failArray.buffer);
    testFTLNoException("array[0]", array, failArray);
    testFTLNoException("delete array[0]", array, failArray);
    testFTLNoException("Object.getOwnPropertyDescriptor(array, 0)", array, failArray);
    testFTLNoException("array[0] = 1", array, failArray);
    testFTLNoException("array[i] = 1", array, failArray);
}
