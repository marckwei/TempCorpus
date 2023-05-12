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

function foo(arg) {
    return [...arg];
}
noInline(foo);

let arrays = [ ];
const size = 500;
{
    let arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(i);
    }
    arrays.push(arr);
}

{
    let arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(i + 0.5);
    }
    arrays.push(arr);
}

{
    let arr = [];
    for (let i = 0; i < size; i++) {
        arr.push({i: i});
    }
    arrays.push(arr);
}

let start = Date.now();
for (let i = 0; i < 100000; i++) {
    let array = arrays[i % arrays.length];
    foo(array);
}
const verbose = false;
if (verbose)
    print(Date.now() - start);
