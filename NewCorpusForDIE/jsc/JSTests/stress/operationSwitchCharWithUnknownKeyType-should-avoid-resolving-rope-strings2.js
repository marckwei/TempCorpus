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

//@ if $memoryLimited then skip else runDefault("--useConcurrentJIT=false") end
//@ slow!

function f(o) {
    switch (o) {
        case "t":
        case "s":
        case "u":
    }
}
noInline(f);

for (var i = 0; i < 10000; i++) {
    let o;
    // This test needs to allocate a large rope string, which is slow.
    // The following is tweaked so that we only use this large string once each to
    // exercise the llint, baseline, DFG, and FTL, so that the test doesn't run too slow.
    if (i == 0 || i == 99 || i == 200 || i == 9999)
        o = (-1).toLocaleString().padEnd(2 ** 31 - 1, "a");
    else
        o = (-1).toLocaleString().padEnd(2, "a");
    f(o);
}

