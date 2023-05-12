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

// FIXME: Bring back something like the deferGC probability mode.
// https://bugs.webkit.org/show_bug.cgi?id=166627
//@ skip
// //@ runFTLNoCJIT("--deferGCShouldCollectWithProbability=true", "--deferGCProbability=1.0")

function foo(a) {
    return a.push(25);
}

function bar(a) {
    for (let i = 0; i < a.length; i++) {
        a[i] = i;
    }
    return foo(a);
}

noInline(bar);

for (let i = 0; i < 100; i++) {
    let smallArray = [1, 2, 3, 4, 5];
    bar(smallArray);
}

let largeArray = [];
for (let i = 0; i < 10000000; i++)
    largeArray.push(i);
bar(largeArray);
