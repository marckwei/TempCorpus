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

//@ skip if not $jitTests
//@ requireOptions("--forcePolyProto=1", "--useLLInt=0", "--repatchBufferingCountdown=0")

function assert_eq(a, b) {
    if (a !== b)
        throw new Error("assertion failed: " + a + " === " + b);
}
noInline(assert_eq)

class A {
    set x(v) {
        if (v == 1) {
            Object.defineProperty(A.prototype, "x", {
                value: 42,
                writable: true
            });
        }
    }
}

class B extends A {
    set y(v) {}
    set y1(v) {}
    set y2(v) {}
}

class C extends B {

}

let a = new C();
for (let i = 0; i < 30; i++) {
    a.x = i;
    assert_eq(a.x, i == 0 ? undefined : i == 1 ? 42 : i);
}

