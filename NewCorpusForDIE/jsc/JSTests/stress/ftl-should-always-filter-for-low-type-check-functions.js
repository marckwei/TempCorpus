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

//@ runDefault("--useConcurrentJIT=0", "--jitPolicyScale=0", "--maximumInliningDepth=2")

function foo(x, y) {
    var w = 0;
    for (var i = 0; i < x.length; ++i) {
        for (var j = 0; j < x.length; ++j)
            w += foo(j, i);
        y[i] = w;
    }
}

function test(x, a3) {
      a1 = [];
      a2 = [];

    for (i = 0; i < x; ++i)
        a1[i] = 0;

    for (i = 0; i < 10; ++i) {
        foo(a3, a2);
        foo(a3, a1);
    }
}
noDFG(test);

a3 = [];
for (var i = 0; i < 3; ++i)
    a3[i] = 0;

for (var i = 3; i <= 12; i *= 2)
    test(i, a3);
