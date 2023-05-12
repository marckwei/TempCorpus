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

// Break type inference.
var o = {f: 42.5};

function foo(a, i) {
    return Atomics.exchange(a, i.f, 42);
}

noInline(foo);

var array = new Int32Array(new SharedArrayBuffer(4));

for (var i = 0; i < 10000; ++i) {
    array[0] = 13;
    var result = foo(array, {f: 0});
    if (result != 13)
        throw "Error in loop: bad result: " + result;
    if (array[0] != 42)
        throw "Error in loop: bad value in array: " + array[0];
}

var success = false;
try {
    array[0] = 14;
    var result = foo(array, {f: 42.5});
    success = true;
} catch (e) {
    if (e.name != "RangeError")
        throw "Error: bad error type: " + e;
}
if (success)
    throw "Error: expected to fail, but didn't."
