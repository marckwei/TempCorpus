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

//@ skip if $architecture == "x86"
//@ $skipModes << :lockdown if $buildType == "debug"

function sumOfArithSeries(limit) {
    return limit * (limit + 1) / 2;
}

var n = 10000000;

function bar() { }

function verify(q, i) {
    if (q.f == q.g)
        throw "Error: q.f == q.g";
    if (q.f.f != q.g.f)
        throw "Error: q.f.f != q.g.f";
    if (q.f.f.f != i)
        throw "Error: q.f.f.f != i";
}

function foo() {
    var result = 0;
    for (var i = 0; i < n; ++i) {
        var leaf = {f:i};
        var o = {f:leaf};
        var p = {f:leaf};
        var q = {f:o, g:p};
        result += q.f.f.f;
        if (i >= n - 100) {
            // We want the materialization to happen in the exit. So, before calling the thing that
            // causes the materialization, we call bar(). We've never profiled this call at the time
            // of FTL compilation, so this should be an exit.
            bar();
            verify(q, i);
        }
    }
    return result;
}

noInline(foo);
noInline(verify);
noInline(bar);

var result = foo();
if (result != sumOfArithSeries(n - 1))
    throw "Error: bad result: " + result;
