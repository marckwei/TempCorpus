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

var arr = [0, 0, 0, 0];
Object.defineProperty(arr, 0, {value: 0});
Object.defineProperty(arr, 1, {value: 1, writable: true});
Object.defineProperty(arr, 2, {value: 2, enumerable: true});
Object.defineProperty(arr, 3, {value: 3, configurable: true});

var lastIndex = arr.length - 1;
function reverseTwice() {
  for (var i = 0; i <= lastIndex; i++) {
    var el = arr[lastIndex - i];
    arr[lastIndex - i] = arr[i];
    arr[i] = el;
  }
}
noInline(reverseTwice);

for (var i = 0; i < 1e5; i++)
  reverseTwice();

if (arr.some((el, i) => el !== i))
  throw `Bad array: ${arr}`;
