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
        throw new Error("Bad assertion")
}
noInline(assert);

function bar(...rest) {
    return rest;
}

function foo(a, b, c) {
    return bar(a, b, c);
}
noInline(foo);

for (let i = 0; i < 10000; i++) {
    let result = foo(10, 20, 30);
    assert(result.length === 3);
    assert(result[0] === 10);
    assert(result[1] === 20);
    assert(result[2] === 30);
}

function baz(...rest) {
    return rest;
}
function jaz(a, b, c) {
    return baz.apply(null, Array.prototype.slice.call(arguments));
}
noInline(jaz);

for (let i = 0; i < 50000; i++) {
    let result = jaz(10, 20, 30);
    assert(result.length === 3);
    assert(result[0] === 10);
    assert(result[1] === 20);
    assert(result[2] === 30);
}
