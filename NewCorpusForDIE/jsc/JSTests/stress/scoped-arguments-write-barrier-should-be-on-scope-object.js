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

//@ runDefault
// This test should not crash.

var arr = [];
let numberOfIterations = 1000;

function captureScopedArguments(i) {
    try {
        eval("arr[" + i + "] = arguments");
    } catch(e) {
    }
}

function addPointersToEdenGenObjects(i) {
    Array.prototype.push.call(arr[i], [,,]);

    try {
        Array.prototype.reverse.call(arr[i])
    } catch (e) {
    }
}

for (var i = 0; i < numberOfIterations; i++) {
    captureScopedArguments(i);
}

gc(); // Promote those ScopeArguments to the old generation.

for (var i = 0; i < numberOfIterations; i++) {
    addPointersToEdenGenObjects(i);
}

edenGC(); // Do eden GC to scan the remembered set which should include the ScopedArguments.

gc(); // Scan the ScopedArguments again. They better not point to collected objects.
