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

function assert(b) {
    if (!b)
        throw new Error("Bad assertion!");
}
noInline(assert);

let value = false;

function baz(x) {
    if (typeof x !== "number") {
        value = true;
    }
    return x;
}
noInline(baz);

function bar(...args) {
    return args;
}

let didEffects = false;
function effects() { didEffects = true; }
noInline(effects);

function foo(a) {
    let args = [1];
    let theArgs = [...args, a, ...args];
    baz(a);
    if (value) {
        effects();
    }
    let r = bar.apply(null, theArgs);
    return r;
}
noInline(foo);

for (let i = 0; i < 100000; i++) {
    foo(i);
    assert(!didEffects);
}
let o = {};
let [a, b, c] = foo(o);
assert(a === 1);
assert(b === o);
assert(c === 1);
assert(didEffects);
