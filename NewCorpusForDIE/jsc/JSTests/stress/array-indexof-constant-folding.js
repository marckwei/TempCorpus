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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

(function () {
    function indexOfInt32Other(array, value, index)
    {
        return array.indexOf(value, index);
    }
    noInline(indexOfInt32Other);

    function indexOfInt32Cell(array, value, index)
    {
        return array.indexOf(value, index);
    }
    noInline(indexOfInt32Cell);

    function indexOfInt32Boolean(array, value, index)
    {
        return array.indexOf(value, index);
    }
    noInline(indexOfInt32Boolean);

    function indexOfDoubleOther(array, value, index)
    {
        return array.indexOf(value, index);
    }
    noInline(indexOfDoubleOther);

    function indexOfDoubleCell(array, value, index)
    {
        return array.indexOf(value, index);
    }
    noInline(indexOfDoubleCell);

    function indexOfDoubleBoolean(array, value, index)
    {
        return array.indexOf(value, index);
    }
    noInline(indexOfDoubleBoolean);

    var key = {};
    var int32Array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var doubleArray = [0, 1, 2, 3, 4.2, 5, 6, 7, 8, 9, 10.5, 11, 12];

    for (var i = 0; i < 1e4; ++i) {
        shouldBe(indexOfInt32Other(int32Array, null, 0), -1);
        shouldBe(indexOfInt32Other(int32Array, undefined, 0), -1);
        shouldBe(indexOfInt32Cell(int32Array, key, 0), -1);
        shouldBe(indexOfInt32Cell(int32Array, Symbol("Cocoa"), 0), -1);
        shouldBe(indexOfInt32Cell(int32Array, "Cocoa", 0), -1);
        shouldBe(indexOfInt32Boolean(int32Array, true, 0), -1);
        shouldBe(indexOfInt32Boolean(int32Array, false, 0), -1);

        shouldBe(indexOfDoubleOther(doubleArray, null, 0), -1);
        shouldBe(indexOfDoubleOther(doubleArray, undefined, 0), -1);
        shouldBe(indexOfDoubleCell(doubleArray, key, 0), -1);
        shouldBe(indexOfDoubleCell(doubleArray, Symbol("Cocoa"), 0), -1);
        shouldBe(indexOfDoubleCell(doubleArray, "Cocoa", 0), -1);
        shouldBe(indexOfDoubleBoolean(doubleArray, true, 0), -1);
        shouldBe(indexOfDoubleBoolean(doubleArray, false, 0), -1);
    }

    shouldBe(indexOfInt32Other(int32Array, 1, 0), 1);
    shouldBe(indexOfInt32Cell(int32Array, 1, 0), 1);
    shouldBe(indexOfInt32Boolean(int32Array, 1, 0), 1);
    shouldBe(indexOfDoubleOther(doubleArray, 1, 0), 1);
    shouldBe(indexOfDoubleCell(doubleArray, 1, 0), 1);
    shouldBe(indexOfDoubleBoolean(doubleArray, 1, 0), 1);
}());
