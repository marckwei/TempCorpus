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

function makeString(char) {
    var result = "";
    for (var i = 0; i < 10; ++i)
        result += char;
    return result;
}

var array = [ "a", "b", "c", "d" ];

for (var i = 0; i < array.length; ++i)
    array[i] = makeString(array[i]);

function foo(array, s) {
    for (var i = 0; i < array.length; ++i) {
        if (array[i] === s)
            return i;
    }
    return null;
}

noInline(foo);

var array2 = [ "a", "b", "c", "d", "e" ];

for (var i = 0; i < array2.length; ++i)
    array2[i] = makeString(array2[i]);

for (var i = 0; i < 100000; ++i) {
    var index = i % array2.length;
    var result = foo(array, array2[index]);
    var expected = index >= array.length ? null : index
    if (result !== expected)
        throw "Error: bad result: " + result + " but expected " + expected;
}

