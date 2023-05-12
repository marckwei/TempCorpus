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

var testCase = function (actual, expected, message) {
  if (actual !== expected) {
    throw message + ". Expected '" + expected + "', but was '" + actual + "'";
  }
};

var af1 = () => {};
var af2 = (a) => {a + 1};

noInline(af1);
noInline(af2);

for (var i = 0; i < 10000; ++i) {
  testCase(typeof af1, "function", "Error: Not correct type of the arrow function #1");
  testCase(typeof af2, "function", "Error: Not correct type of the arrow function #2");

//Fixme: Some bug in inlining typeof with following run parameters ftl-no-cjit-no-inline-validate
// --useFTLJIT\=true --useFunctionDotArguments\=true --useConcurrentJIT=false --thresholdForJITAfterWarmUp=100  --validateGraph=true --maximumInliningDepth=1
//
// for (var i = 0; i < 10000; ++i)  {
//   if (typeof (function () {}) !== 'function')
//       throw 'Wrong type';
// }
//  testCase(typeof ()=>{}, "function", "Error: Not correct type of the arrow function #3-" + i);

//  testCase(typeof ((b) => {b + 1}), "function", "Error: Not correct type of the arrow function #4");
}
