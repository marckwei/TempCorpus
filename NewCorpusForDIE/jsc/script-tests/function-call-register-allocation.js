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

description(
"This test checks for a specific regression that caused function calls to allocate too many temporary registers."
);

var message = "PASS: Recursion did not run out of stack space."
try {
    // Call a function recursively.
    (function f(g, x) {
        if (x > 3000)
            return;

        // Do lots of function calls -- when the bug was present, each
        // of these calls would allocate a new temporary register. We can
        // detect profligate register allocation because it will substantially
        // curtail our recursion limit.
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();
        g(); g(); g(); g(); g(); g(); g(); g(); g(); g();

        f(g, ++x);
    })(function() {}, 0);
} catch(e) {
    message = "FAIL: Recursion threw an exception: " + e;
}

debug(message);
