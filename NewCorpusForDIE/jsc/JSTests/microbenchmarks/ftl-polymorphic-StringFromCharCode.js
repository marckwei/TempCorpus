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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
//@ runFTLNoCJIT
var o1 = {
    i: 65,
    valueOf: function() { return this.i; }
};

result = 0;
function foo(a) {
    var result = String.fromCharCode(a);

    // Busy work just to allow the DFG and FTL to optimize this. If the above causes
    // us to speculation fail out to the baseline, this busy work will take a lot longer
    // to run.
    // This loop below also gets the DFG to compile this function sooner.
    var count = 0;
    for (var i = 0; i < 1000; i++)
        count++;
    return result + count;
}
noInline(foo);

var iterations;
var expectedResult;
if (this.window) {
    // The layout test doesn't like too many iterations and may time out.
    iterations = 10000;
    expectedResult = 10001;
} else {
    iterations = 100000;
    expectedResult = 100001;
}


for (var i = 0; i <= iterations; i++) {
    var resultStr;
    if (i % 2 == 2)
        resultStr = foo('65');
    else if (i % 2 == 1)
        resultStr = foo(o1);
    else
        resultStr = foo(65);
    if (resultStr == 'A1000')
        result++;
}

if (result != expectedResult)
    throw "Bad result: " + result;
