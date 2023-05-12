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
var e = Symbol(), f = Symbol(), g = Symbol();
function foo(o) {
    o[f] = 1;
}

function fu(o) {
    o[e] = 2;
}

function bar(func, o) {
    func(o);
}

for (var i = 0; i < 1000; ++i) {
    var o = {};
    o["i" + i] = 42;
    foo(o);
    fu({[f]:1, [e]:2});
    fu({[e]:1, [f]:2, [g]:3});
}
    
for (var i = 0; i < 100; ++i) {
    bar(foo, {[f]:1});
    bar(function() { }, null);
    bar(function() { return 42 }, null);
}
    
(function(func, o, p) {
    var result = 0;
    var n = 1000000;
    for (var i = 0; i < n; ++i) {
        fu(o);
        bar(func, o);
        var tmp = o;
        o = p;
        p = tmp;
    }
    if (o[e] != 2)
        throw "Error: bad value in o.e: " + o[e];
    if (o[f] != 1)
        throw "Error: bad value in o.f: " + o[f];
    if (p[e] != 2)
        throw "Error: bad value in p.e: " + p[e];
    if (p[f] != 1)
        throw "Error: bad value in p.f: " + p[f];
})(foo, {[f]:42, [e]:23}, {[e]:23, [f]:42, [g]:100});

