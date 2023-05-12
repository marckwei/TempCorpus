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

var foos = [
    function(o) { o.ff = 42; },
    function(o) { o.ff = 42; },
    function(o) { o.ff = 42; },
    function(o) { o.ff = 42; },
    function(o) { o.ff = 42; },
    function(o) { o.ff = 42; },
    function(o) { o.ff = 42; },
    function(o) { o.ff = 42; }
];

if (foos.length != 8)
    throw "Error";

function bar(o, n) {
    if (n == 0)
        return;
    o.na = 1;
    if (n == 1)
        return;
    o.nb = 2;
    if (n == 2)
        return;
    o.nc = 3;
    if (n == 3)
        return;
    o.nd = 4;
    if (n == 4)
        return;
    o.ne = 5;
    if (n == 5)
        return;
    o.nf = 6;
    if (n == 6)
        return;
    o.ng = 7;
    if (n == 7)
        return;
    o.nh = 8;
}

function baz(o, n) {
    if (n == 0)
        return;
    if (o.na != 1)
        throw "Memory corruption";
    if (n == 1)
        return;
    if (o.nb != 2)
        throw "Memory corruption";
    if (n == 2)
        return;
    if (o.nc != 3)
        throw "Memory corruption";
    if (n == 3)
        return;
    if (o.nd != 4)
        throw "Memory corruption";
    if (n == 4)
        return;
    if (o.ne != 5)
        throw "Memory corruption";
    if (n == 5)
        return;
    if (o.nf != 6)
        throw "Memory corruption";
    if (n == 6)
        return;
    if (o.ng != 7)
        throw "Memory corruption";
    if (n == 7)
        return;
    if (o.nh != 8)
        throw "Memory corruption";
}

for (var i = 0; i < 8; ++i)
    noInline(foos[i]);
noInline(bar);

for (var i = 0; i < 100000; ++i) {
    var o = {};
    var p = {a:1, b:2, c:3, d:4, e:5, f:6};
    bar(o, i % 8);
    bar(p, i % 8);
    
    foos[i % 8](o);
    foos[i % 8](p);
    
    if (o.ff != 42)
        throw "Bad result in o: " + o.ff;
    if (p.ff != 42)
        throw "Bad result in o: " + p.ff;
    
    if (p.a != 1 || p.b != 2 || p.c != 3 || p.d != 4 || p.e != 5 || p.f != 6)
        throw "Memory corruption"
    baz(o, i % 8);
    baz(p, i % 8);
}

