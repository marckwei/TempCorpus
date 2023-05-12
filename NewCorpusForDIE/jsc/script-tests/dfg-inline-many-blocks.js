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

description("Tests that inlining many basic blocks does not trigger a bad assertion.");

function stuff(x) {
    debug(x); // This needs to be a side-effect.
}

function foo(a, b) {
    if (a) {
        stuff(a);
        return;
    } else {
        stuff(b);
        return;
    }
}

function fuzz(a, b) {
    if (a + b)
        foo(a, b);
    if (a / b)
        foo(b, a);
    foo(a, b);
}

function baz(a, b) {
    stuff(a);
    if (a * b)
        fuzz(a, b);
    if (a - b)
        fuzz(a, b);
    fuzz(b, a);
}

function bar(a, b) {
    stuff(a * b + a);
    if (a + b)
        baz(a, b);
    stuff(a - b);
}

for (var i = 0; i < 1000; ++i)
    bar(i, i + 1);

