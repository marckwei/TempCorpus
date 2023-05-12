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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
let assert = {
    sameValue: function(i, e, m) {
        if (i !== e)
            throw new Error(m);
    }
}

function untypedMod(x, y) {
    return x % y;
}
noInline(untypedMod);

let o =  {valueOf: () => 10};

for (let i = 0; i < 100000; i++) {
    let r = untypedMod(30, o);
    assert.sameValue(r, 0, 30 + " % {valueOf: () => 10} = " + r);
}

o2 =  {valueOf: () => 10000};

for (let i = 0; i < 100000; i++) {
    let r = untypedMod(o2, o);
    assert.sameValue(r, 0, "{valueOf: () => 10000} % {valueOf: () => 10}  = " + r);
}

o = Object(10);
let r = untypedMod(30, o);
assert.sameValue(r, 0, 30 + " % Object(10) = " + r);

o2 = Object(3240);
r = untypedMod(o2, o);
assert.sameValue(r, 0, "Object(3240) % Object(10) = " + r);

for (let i = 0; i < 100000; i++) {
    let r = untypedMod("9", "8");
    assert.sameValue(r, 1, "9 % 8 = " + r);
}

