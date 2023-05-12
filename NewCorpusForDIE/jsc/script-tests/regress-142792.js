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

description("Verify that objects with numeric named properties don't set length like an array.");

var numOfIterations = 10000;
var count = 0;
var obj = {
    1: 'foo',
    8: 'bar',
    50: 'baz'
};

var expectedCount = Object.keys(obj).length;

function isArrayLike(collection) {
    var length = collection && collection.length;

    return typeof length == 'number';
}

function filter(obj, callback, context) {
    var results = [];
    var i, length;

    if (isArrayLike(obj)) {
        for (i = 0, length = obj.length; i < length; i++) {
            var value = obj[i];
            if (callback(value))
                results.push(value);
        }
    } else {
        for (var key in obj) {
            var value = obj[key];
            if (callback(value))
                results.push(value);
        }
    }

    return results;
}

for (var i = 0; i < numOfIterations; i++) {
    filter([], function() { return true; });
}

filter(obj, function() { 
    count++;
    return true;
});

if (count !== expectedCount)
    testFailed("Incorrect number of iterated keys: " + count + ", expected: " + expectedCount);
else
    testPassed("Correct number of iterated keys: " + count);
