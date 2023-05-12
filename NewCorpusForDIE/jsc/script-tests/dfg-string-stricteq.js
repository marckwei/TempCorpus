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

description(
"Tests that the DFG does the right thing on strict equality for known strings."
);

function foo(a, b) {
    a = a.f;
    b = b.f;
    var c = a.length + b.length;
    return [c, a === b];
}

function bar(a, b) {
    a = a.f;
    b = b.f;
    var c = a.length + b.length;
    if (a === b)
        return c + 1;
    else
        return c - 1;
}

for (var i = 0; i < 1000; ++i) {
    var a = "blah" + i;
    var b = "blah" + (1000 - i);
    var areEqual = i == 500;
    shouldBe("foo({f:\"" + a + "\"}, {f:\"" + b + "\"})", "[" + (a.length + b.length) + ", " + areEqual + "]");
    shouldBe("bar({f:\"" + a + "\"}, {f:\"" + b + "\"})", "" + (areEqual ? a.length + b.length + 1 : a.length + b.length - 1));
}

