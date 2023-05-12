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

let assert = {
    sameValue: function(i, e, m) {
        if (i !== e)
            throw new Error(m);
    }
}

function bigIntDiv(x, y) {
    return x / y;
}
noInline(bigIntDiv);

let o =  {valueOf: () => 10n};

for (let i = 0; i < 10000; i++) {
    let r = bigIntDiv(30n, o);
    assert.sameValue(r, 3n, 30n + " / {valueOf: () => 10n} = " + r);
}

o2 =  {valueOf: () => 10000n};

for (let i = 0; i < 10000; i++) {
    let r = bigIntDiv(o2, o);
    assert.sameValue(r, 1000n, "{valueOf: () => 10000n} / {valueOf: () => 10n}  = " + r);
}

o = Object(10n);
let r = bigIntDiv(30n, o);
assert.sameValue(r, 3n, 30n + " / Object(10n) = " + r);

o2 = Object(3240n);
r = bigIntDiv(o2, o);
assert.sameValue(r, 324n, "Object(3240n) / Object(10n) = " + r);

