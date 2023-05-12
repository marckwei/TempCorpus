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

//@ skip if $hostOS == "windows"

description(
"This tests that sort() is a stable sort."
);

function clone(source, target) {
    for (i = 0; i < source.length; i++) {
        target[i] = source[i];
    }
}

var arr = [];
arr[0] = new Number(1);
arr[1] = new Number(2);
arr[2] = new Number(1);
arr[3] = new Number(2);

var sortArr = [];
clone(arr, sortArr);
sortArr.sort();

shouldBe('arr[0]', 'sortArr[0]');
shouldBe('arr[1]', 'sortArr[2]');
shouldBe('arr[2]', 'sortArr[1]');
shouldBe('arr[3]', 'sortArr[3]');

// Just try again...
sortArr.sort();
shouldBe('arr[0]', 'sortArr[0]');
shouldBe('arr[1]', 'sortArr[2]');
shouldBe('arr[2]', 'sortArr[1]');
shouldBe('arr[3]', 'sortArr[3]');
