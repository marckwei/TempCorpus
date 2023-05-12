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

var sab = new SharedArrayBuffer(1);
var a = new Int8Array(sab);
var result = Atomics.store(a, 0, 1000);
if (result != 1000)
    throw new Error("bad result: " + result);

sab = new SharedArrayBuffer(4);
a = new Uint32Array(sab);
result = Atomics.store(a, 0, 4000000000);
if (result != 4000000000)
    throw new Error("bad result: " + result);
if (a[0] != 4000000000)
    throw new Error("bad value read back: " + a[0]);
result = Atomics.store(a, 0, -4000000000);
if (result != -4000000000)
    throw new Error("bad result: " + result);
if (a[0] != 294967296)
    throw new Error("bad value read back: " + a[0]);

var count = 0;
result = Atomics.store(a, 0, { valueOf() { count++; return 42; } });
if (result != 42)
    throw new Error("bad result: " + result);
if (count != 1)
    throw new Error("bad count: " + count);

