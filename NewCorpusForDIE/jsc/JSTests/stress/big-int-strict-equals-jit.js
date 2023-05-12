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

//@ runDefault("--useConcurrentJIT=false")

function assert(a) {
    if (!a)
        throw new Error("Bad assertion");
}

function foo(a, b) {
    return a === b;
}
noInline(foo);

for (let i = 0; i < 100000; i++) {
    assert(!foo(2n, 3n));
    assert(foo(3n, 3n));
}

assert(!foo(3, 3n));
assert(!foo(0.33, 3n));
assert(!foo("3", 3n));
assert(!foo(Symbol("3"), 3n));
assert(!foo(true, 3n));
assert(!foo(false, 3n));
assert(!foo(NaN, 3n));
assert(!foo(null, 3n));
assert(!foo(undefined, 3n));
assert(!foo(+Infinity, 3n));
assert(!foo(-Infinity, 3n));

function bar() {
    return 3n;
}
noInline(bar);

for (let i = 0; i < 100000; i++)
    assert(bar() === bar());

