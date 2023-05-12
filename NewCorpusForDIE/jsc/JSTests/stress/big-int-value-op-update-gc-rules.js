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

function assert(a, e) {
    if (a !== e)
        throw new Error("Expected: " + e + " but got: " + a);
}

function doesGCAdd(a) {
    let o = {};
    let c = a + 1n;
    o.b = c;

    return o;
}
noInline(doesGCAdd);

for (var i = 0; i < 10000; i++) {
    let o = doesGCAdd(3n);
    assert(o.b, 4n);
}

function doesGCSub(a) {
    let o = {};
    let c = a - 1n;
    o.b = c;

    return o;
}
noInline(doesGCSub);

for (var i = 0; i < 10000; i++) {
    let o = doesGCSub(3n);
    assert(o.b, 2n);
}

function doesGCDiv(a) {
    let o = {};
    let c = a / 2n;
    o.b = c;

    return o;
}
noInline(doesGCDiv);

for (var i = 0; i < 10000; i++) {
    let o = doesGCDiv(4n);
    assert(o.b, 2n);
}

function doesGCMul(a) {
    let o = {};
    let c = a * 2n;
    o.b = c;

    return o;
}
noInline(doesGCMul);

for (var i = 0; i < 10000; i++) {
    let o = doesGCMul(4n);
    assert(o.b, 8n);
}

function doesGCBitAnd(a) {
    let o = {};
    let c = a & 0b11n;
    o.b = c;

    return o;
}
noInline(doesGCBitAnd);

for (var i = 0; i < 10000; i++) {
    let o = doesGCBitAnd(0b1010n);
    assert(o.b, 0b10n);
}

function doesGCBitOr(a) {
    let o = {};
    let c = a | 0b11n;
    o.b = c;

    return o;
}
noInline(doesGCBitOr);

for (var i = 0; i < 10000; i++) {
    let o = doesGCBitOr(0b10n);
    assert(o.b, 0b11n);
}

function doesGCBitXor(a) {
    let o = {};
    let c = a ^ 0b11n;
    o.b = c;

    return o;
}
noInline(doesGCBitXor);

for (var i = 0; i < 10000; i++) {
    let o = doesGCBitXor(0b10n);
    assert(o.b, 0b1n);
}

