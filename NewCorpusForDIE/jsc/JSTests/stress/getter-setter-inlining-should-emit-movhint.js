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

//@ skip if not $jitTests
//@ runDefault("--useRandomizingFuzzerAgent=1", "--usePolymorphicCallInliningForNonStubStatus=1", "--seedOfRandomizingFuzzerAgent=2896922505", "--useLLInt=0", "--useConcurrentJIT=0")

function foo(o) {
    o.f = 0;
    return o.f;
}
noInline(foo);

let counter = 0;

function test(o, value) {
    var result = foo(o);
    if (result < value)
        throw new Error(result);
    if (counter < value)
        throw new Error(counter);
    Array.of(arguments);
}

for (var i = 0; i < 100000; ++i) {
    var o = {
        get f() {
            return o
        },
        set f(v) {
            counter++;
            this.z = 0;
        }
    };
    test(o, i, i);
}
