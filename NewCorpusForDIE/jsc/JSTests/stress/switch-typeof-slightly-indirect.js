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

function foo(value) {
    var t = typeof value;
    if (!t)
        return -1;
    switch (t) {
    case "undefined":
        return 0;
    case "object":
        return 1;
    case "function":
        return 2;
    case "boolean":
        return 3;
    case "number":
        return 4;
    case "string":
        return 5;
    default:
        return 6;
    }
}

noInline(foo);

function test(value, expected) {
    var result = foo(value);
    if (result != expected)
        throw "Error: bad type code for " + value + ": " + result + " (expected " + expected + ")";
}

for (var i = 0; i < 10000; ++i) {
    test(void 0, 0);
    test({}, 1);
    test(function() { return 42; }, 2);
    test(true, 3);
    test(42, 4);
    test(42.5, 4);
    test("hello", 5);
}
