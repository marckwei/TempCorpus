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

// This file tests subclassing arrays.

class A extends Array { }
class B extends A { get 1() { return 1; } }
class C extends B { }

function test() {

    a = new A();
    b = new B();
    c = new C();

    if (!Array.isArray(a) || !Array.isArray(b) || !Array.isArray(c))
        throw "subclasses are not arrays";

    if (!(a instanceof Array && a instanceof A))
        throw "b has incorrect prototype chain";

    if (!(b instanceof Array && b instanceof A && b instanceof B))
        throw "b has incorrect prototype chain";

    if (!(c instanceof Array && c instanceof A && c instanceof B && c instanceof C))
        throw "c has incorrect prototype chain";

    a[1] = 2;
    b[1] = 2;
    c[1] = 2;

    if (a[1] !== 2 || b[1] !== 1 || c[1] !== 1)
        throw "bad indexing type";
}
noInline(test);

for(i = 0; i < 10000; i++)
    test();
