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
        throw new Error("Bad value.")
}
noInline(assert);

var v1 = 100;
var v2 = 200;
var flag = false;
var o1 = {
    get f() {
        if (flag)
            throw new Error("gotcha!");
        return v1;    
    }
}

function a() { return "a"; }
noInline(a);
function b() { return "b"; }
noInline(b);
function c() { return "c"; }
noInline(c);
function d() { return "d"; }
noInline(d);
function e() { return "e"; }
noInline(e);
function f() { return "f"; }
noInline(f);
function g() { return "g"; }
noInline(g);

var o2 = {
    get f() {
        assert(true);
        assert(true);
        assert(true);
        assert(true);
        assert(true);
        assert(true);
        assert(true);
        return v2;
    }
}

function foo(o) {
    try {
        var _a = a();
        var _b = b();
        var _c = c();
        var _d = d();
        var _e = e();
        var _f = f();
        var _g = g();

        o = o.f;

    } catch(e) {
        assert(o === o1);
        assert(_b === "b");
        assert(_c === "c");
        assert(_d === "d");
        assert(_e === "e");
        assert(_f === "f");
        assert(_g === "g");
    }
}
noInline(foo);

for (var i = 0; i < 1000000; i++)
    foo(i % 2 ? o1 : o2);
flag = true;
foo(o1);
