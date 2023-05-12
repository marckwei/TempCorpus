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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}!`);
}

(function sourceIsJSArray() {
    for (var i = 0; i < 10_000; i++) {
        var sourceObj = [0, 1, 2];
        var slicedArr = sourceObj.slice(0, 1000);

        shouldBe(slicedArr.length, 3);
        shouldBe(slicedArr.join(), "0,1,2");
    }
})();

const MAX_ARRAY_LENGTH = 2 ** 32 - 1;

(function sourceIsFinalObject() {
    for (var i = 0; i < 10_000; i++) {
        var sourceObj = {};
        sourceObj[0] = "x";
        sourceObj[MAX_ARRAY_LENGTH] = "y";
        sourceObj.length = MAX_ARRAY_LENGTH + 1;
        sourceObj.slice = Array.prototype.slice;
        var slicedArr = sourceObj.slice(MAX_ARRAY_LENGTH, MAX_ARRAY_LENGTH + 2);

        shouldBe(slicedArr.length, 1);
        shouldBe(slicedArr[0], "y");
    }
})();
