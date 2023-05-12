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

//@ runDefault("--useFTLJIT=0", "--useConcurrentJIT=false")

let num = 150;

function foo(comp, o, b) {
    let sum = o.f;
    if (b)
        OSRExit();
    for (let i = 0; i < comp; ++i) {
        sum += o.f;
    }
    return sum;
}
noInline(foo);

let o = {f:25};
let o2 = {f:25, g:44};
o2.f = 45;
o2.f = 45;
o2.f = 45;
o2.f = 45;
let comp = {
    valueOf() { return num; }
}

foo(comp, o2, true);
foo(comp, o2, true);
for (let i = 0; i < 500; ++i) {
    foo(comp, o2, false);
}

let o3 = {g:24, f:73};
num = 10000000;
let result = foo(comp, o3, false);

if (result !== (num + 1)*73) {
    throw new Error("Bad: " + result);
}
