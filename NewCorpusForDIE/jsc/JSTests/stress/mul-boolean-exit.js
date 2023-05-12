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
    return Math.max(a.f, b.f);
}

noInline(foo);

var f = new Float64Array(1);
var i = new Int32Array(f.buffer);

function test(a, b, c) {
    var result = foo({f:a}, {f:b});
    f[0] = c;
    var expectedA = i[0];
    var expectedB = i[1];
    f[0] = result;
    if (i[0] != expectedA || i[1] != expectedB)
        throw "Error: expected " + c + " but got: " + result;
}

for (var i = 0; i < 100000; ++i)
    test(true, 42, 42);

// Now try some unexpected things, in descending order of possible badness.
test(true, 2147483647, 2147483647);
test(false, 42, 42);
test(false, -42, -0);
test(1, 2, 2);
test(true, true, 1);
test(1.5, 1.5, 2.25);
