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

description(
"This tests that op_get_by_pname is compiled correctly for non-final objects."
);

function foo(o) {
    var result = 0;
    for (var n in o)
        result += o[n];
    return result;
}

var o = new Date();
var p = new Date();
var q = new Date();
var r = new Date();
var s = new Date();
o.a = 1;
o.b = 3;
o.c = 7;
p.a = 1;
p.b = 2;
p.c = 3;
p.d = 4;
q.a = 1;
q.b = 2;
q.c = 3;
q.d = 4;
q.e = 3457;
r.a = 1;
r.b = 2;
r.c = 3;
r.d = 4;
r.e = 91;
r.f = 12;
s.a = 1;
s.b = 2;
s.c = 3;
s.d = 4;
s.e = 91;
s.f = 12;
s.g = 69;

for (var i = 0; i < 100; ++i) {
    shouldBe("foo(o)", "11");
    shouldBe("foo(p)", "10");
    shouldBe("foo(q)", "3467");
    shouldBe("foo(r)", "113");
    shouldBe("foo(s)", "182");
}

