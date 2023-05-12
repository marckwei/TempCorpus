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

function foo(o) {
    return o.f;
}

function bar(o) {
    return o.g;
}

function baz(o, p, q) {
    var result = 0;
    if (isFinalTier()) {
        p = o;
        q = o;
        result += 10000;
    }
    result += foo(p);
    result += bar(q);
    return result;
}

noInline(baz);

for (var i = 0; i < 100000; ++i) {
    var o, p, q;
    var expected1;
    var expected2;
    o = {f:100, g:101};
    expected2 = 10000 + 100 + 101;
    if (i & 1) {
        p = {e:1, f:2, g:3};
        q = {e:4, f:5, g:6};
        expected1 = 2 + 6;
    } else {
        p = {f:7, g:8};
        q = {g:9, f:10};
        expected1 = 7 + 9;
    }
    var result = baz(o, p, q);
    if (result != expected1 && result != expected2)
        throw "Error: bad result: " + result + " (expected " + expected1 + " or " + expected2 + ")";
}

