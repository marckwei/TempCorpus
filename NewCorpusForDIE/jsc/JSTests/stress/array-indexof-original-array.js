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
    function indexOfInt32(array, value)
    {
        return array.indexOf(value);
    }
    noInline(indexOfInt32);
    var int32Array = [0, 1, 2, 3, 4, , 6, 7, 8, 9, 10, 11, 12];

    var value = -1;
    for (var i = 0; i < 1e5; ++i) {
        shouldBe(indexOfInt32(int32Array, 5), value);
        shouldBe(indexOfInt32(int32Array, 6), 6);
        if (i === 1e4) {
            int32Array.hello = 42;
        }
    }
}());


(function () {
    function indexOfInt32(array, value)
    {
        return array.indexOf(value);
    }
    noInline(indexOfInt32);
    var int32Array = [0, 1, 2, 3, 4, , 6, 7, 8, 9, 10, 11, 12];

    var value = -1;
    for (var i = 0; i < 1e5; ++i) {
        shouldBe(indexOfInt32(int32Array, 5), value);
        shouldBe(indexOfInt32(int32Array, 6), 6);
        if (i === 1e4) {
            value = 5;
            int32Array.__proto__ = {
                __proto__: int32Array.__proto__,
                5: 5
            };
        }
    }
}());