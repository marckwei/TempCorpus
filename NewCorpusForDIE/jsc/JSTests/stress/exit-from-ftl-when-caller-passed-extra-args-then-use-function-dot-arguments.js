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
    var result = a + b;
    bar();
    return result;
}

var capturedArgs;
function bar() {
    capturedArgs = foo.arguments;
}

noInline(foo);
noInline(bar);

function arraycmp(a, b) {
    if (a.length != b.length)
        return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] != b[i])
            return false;
    }
    return true;
}

for (var i = 0; i < 10000; ++i) {
    var result = foo(1, 2, 3, 4, 5, 6);
    if (result != 3)
        throw "Error: bad result in loop: " + result;
    if (!arraycmp(capturedArgs, [1, 2, 3, 4, 5, 6]))
        throw "Error: bad captured arguments in loop: " + capturedArgs;
}

var result = foo(2000000000, 2000000000, 3, 4, 5, 6);
if (result != 4000000000)
    throw "Error: bad result at end: " + result;
if (!arraycmp(capturedArgs, [2000000000, 2000000000, 3, 4, 5, 6]))
    throw "Error: bad captured arguments at end: " + Array.prototype.join.apply(capturedArgs, ",");
