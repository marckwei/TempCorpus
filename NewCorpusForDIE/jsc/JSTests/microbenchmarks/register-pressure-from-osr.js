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
function foo(o, p, q, r, s, t, u) {
    var a = o.f;
    var b = p.f;
    var c = q.f;
    var d = r.f;
    var e = s.f;
    var f = t.f;
    var g = u.f;
    
    a++;
    b++;
    c++;
    d++;
    e++;
    f++;
    g++;
    
    var h = o.f;
    var i = p.f;
    var j = q.f;
    var k = r.f;
    var l = s.f;
    var m = t.f;
    var n = u.f;
    
    return a + b + c + d + e + f + g + h + i + j + k + l + m + n;
}

var o = {a:1, b:2, c:3, d:4, e:5, g:7, h:8, i:9, f:6};
var p = {a:1, b:2, c:3, d:4, e:5, g:7, h:8, i:9, f:6};
var q = {a:1, b:2, c:3, d:4, e:5, g:7, h:8, i:9, f:6};
var r = {a:1, b:2, c:3, d:4, e:5, g:7, h:8, i:9, f:6};
var s = {a:1, b:2, c:3, d:4, e:5, g:7, h:8, i:9, f:6};
var t = {a:1, b:2, c:3, d:4, e:5, g:7, h:8, i:9, f:6};
var u = {a:1, b:2, c:3, d:4, e:5, g:7, h:8, i:9, f:6};

var result = 0;
for (var i = 0; i < 1000000; ++i)
    result += foo(o, p, q, r, s, t, u);

if (result != 91000000)
    throw "Bad result: " + result;


