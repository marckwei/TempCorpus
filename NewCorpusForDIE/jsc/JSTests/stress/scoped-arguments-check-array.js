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

//@ defaultRun
//@ runNoLLInt("--useConcurrentJIT=false", "--forceEagerCompilation=True")

// This is a regression test that verifies we handle direct arguments as ArrayStorage.  This test should complete and not crash.
// It is a reduction of a fuzzing bug produced testcase.  All of the code present was needed to reproduce the issue.

let a;
let f2;
let args;

function setup(arg1) {
    function foo() { return arg1; }
    a = [0];
    a.unshift(0);
    for (let z of [4, 4, 4, 4, 4]) {};
    new Float64Array(a);
    f2 = function() {};
    args = arguments;
    args.length = 0;
};

function forOfArray() {
    for (let z of [true, true, true, true, true, true, true]) {
    }
}

function forOfArgs() {
    for (let v of args) {
    }
}

function callEveryOnArgs() {
    for (i = 0; i < 1000; ++i) {
        Array.prototype.every.call(args, f2, {});
    }
}

setup();
forOfArray();
forOfArgs();
callEveryOnArgs();
