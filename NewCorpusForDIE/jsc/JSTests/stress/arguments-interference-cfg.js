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

function bar() {
    return arguments;
}

function foo(p) {
    var a = bar(1, 2, 3);
    var b;
    if (p)
        b = bar(4, 5, 6);
    else
        b = [7, 8, 9];
    return (a[0] << 0) + (a[1] << 1) + (a[2] << 2) + (b[0] << 3) + (b[1] << 4) + (b[2] << 5);
}

noInline(foo);

for (var i = 0; i < 20000; ++i) {
    var p = i & 1;
    var q = (!p) * 3;
    var result = foo(p);
    if (result != (1 << 0) + (2 << 1) + (3 << 2) + ((4 + q) << 3) + ((5 + q) << 4) + ((6 + q) << 5))
        throw "Error: bad result: " + result;
}

