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

function foo(a, b) {
    return a + "x" + b;
}

noInline(foo);

for (var i = 0; i < 10000; ++i) {
    var b;
    var expected;
    if (i & 1) {
        b = 42;
        expected = "ax42";
    } else {
        b = "b";
        expected = "axb";
    }
    var result = foo("a", b);
    if (result != expected)
        throw "Error: bad result: " + result;
}

var longStr = "l";
for (var i = 0; i < 30; ++i)
    longStr = longStr + longStr;

var result = null;
var didThrow = false;
try {
    result = foo(longStr, longStr);
} catch (e) {
    didThrow = true;
}

if (!didThrow)
    throw "Error: did not throw";
if (result !== null)
    throw "Error: did set result: " + result;
