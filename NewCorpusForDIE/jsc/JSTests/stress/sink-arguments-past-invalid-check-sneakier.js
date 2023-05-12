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

function bar(o, p) {
    var o2 = {f: 0};
    if (p)
        o2.f = o;
    return +o2.f;
}

var globalResult;
Object.prototype.valueOf = function() { globalResult = 1; };

function foo(p, q) {
    globalResult = 0;
    var o = arguments;
    if (p)
        bar(o, q);
    return globalResult;
}

noInline(foo);

foo(true, false);

for (var i = 0; i < 10000; ++i) {
    bar(1, true);
    bar({}, false);
}

for (var i = 0; i < 10000; ++i) {
    var result = foo(false, true);
    if (result !== 0)
        throw "Error: bad result: " + result;
}

var result = foo(true, true);
if (result !== 1)
    throw "Error: bad result at end: " + result;
