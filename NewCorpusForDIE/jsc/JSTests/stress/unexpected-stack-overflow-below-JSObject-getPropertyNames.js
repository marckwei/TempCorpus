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

//@ requireOptions("--exceptionStackTraceLimit=0", "--defaultErrorStackTraceLimit=0")

let arr0 = [];
var afterFirstCatch = false;

function foo(arg0) {
    var exception;
    let arr1 = [];
    arg0.__proto__ = arr1;
    try {
        foo(arr1);
    } catch (e) {
        // This afterFirstCatch tracking is just to facilitate being able to end this
        // test quickly without having to run the for-in loop below on the entire return
        // path.
        if (afterFirstCatch)
            throw e;
        afterFirstCatch = true;
        exception = e;
    }
    for (let q in arr0) { }
    if (afterFirstCatch)
        throw exception; // We're done with the test. Let's end this quickly.
}

try {
    foo(arr0);
} catch (e) {
    if (e != "RangeError: Maximum call stack size exceeded.")
        throw e;
}
