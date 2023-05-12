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

var af1 = () =>  {};
var af2 = (a) => {a + 1};
var af3 = (x) =>  x + 1;

noInline(af1);
noInline(af2);
noInline(af3);

for (var i = 0; i < 10000; ++i) {
  testCase(typeof af1.prototype, 'undefined', "Error: Not correct result for prototype of arrow function #1");
  testCase(typeof af2.prototype, 'undefined', "Error: Not correct result for prototype of arrow function #2");
  testCase(typeof af3.prototype, 'undefined', "Error: Not correct result for prototype of arrow function #5");
  testCase(af1.hasOwnProperty("prototype"), false, "Error: Not correct result for prototype of arrow function #3");
  testCase(af2.hasOwnProperty("prototype"), false, "Error: Not correct result for prototype of arrow function #4");
  testCase(af3.hasOwnProperty("prototype"), false, "Error: Not correct result for prototype of arrow function #6");
}
