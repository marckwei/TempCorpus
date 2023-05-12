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

function testInLoopTests(array, index)
{
    let arrayLength = array.length;
    let sum = 0;
    for (let i = 0; i < 10; ++i) {
        if (index >= 0 && index < arrayLength) {
            sum += array[index];
        }
    }
    return sum;
}
noInline(testInLoopTests);


let testArray = [1, 2, 3];

// Warmup "in-bounds" up to FTL.
for (let i = 0; i < 1e5; ++i) {
    if (testInLoopTests(testArray, 1) !== 20)
        throw "Failed testInLoopTests(testArray, 1)"
    if (testInLoopTests(testArray, 2) !== 30)
        throw "Failed testInLoopTests(testArray, 2)"
}

let largeIntResult = testInLoopTests(testArray, 2147483647);
if (largeIntResult !== 0)
    throw "Failed testInLoopTests(testArray, 2147483647)";
let smallIntResult = testInLoopTests(testArray, -2147483647);
if (smallIntResult !== 0)
    throw "Failed testInLoopTests(testArray, -2147483647)";
