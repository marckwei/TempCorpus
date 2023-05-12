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

// This microbenchmarks validates that the fix in https://webkit.org/b/170961
// does not regress the performance gains from r211670: <http://trac.webkit.org/changeset/211670>.
// r211670 reduces the size of operationToInt32SensibleSlow() for handling double numbers with
// binary exponent 31. Hence, this microbenchmark stresses doubleToIn32 conversion on
// numbers with binary exponents in the vicinity of 31.

let doubleValues = [
    2.147483648e8, // exp = 27
    2.147483648e9, // exp = 31
    2.147483648e10, // exp = 34
];

function test(q, r, s, t, u, v, w, x, y, z) {
    // Do a lot of double to int32 conversions to weigh more on the conversion.
    return q|0 + r|0 + s|0 + t|0 + u|0 + v|0 + w|0 + x|0 + y|0 + z|0;
}
noInline(test);

var result = 0;
let length = doubleValues.length;
for (var i = 0; i < 1000000; ++i) {
    for (var j = 0; j < length; j++) {
        var value = doubleValues[j];
        result |= test(value, value, value, value, value, value, value, value, value, value);
    }
}

if (result != -1932735284) {
    throw "Bad result: " + result;
}
