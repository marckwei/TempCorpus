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

//@ skip

function foo(bytes) {
    return Atomics.isLockFree(bytes);
}
noInline(foo);

function foo0(bytes) {
    return Atomics.isLockFree(0);
}
noInline(foo0);

function foo1(bytes) {
    return Atomics.isLockFree(1);
}
noInline(foo1);

function foo2(bytes) {
    return Atomics.isLockFree(2);
}
noInline(foo2);

function foo3(bytes) {
    return Atomics.isLockFree(3);
}
noInline(foo3);

function foo4(bytes) {
    return Atomics.isLockFree(4);
}
noInline(foo4);

function foo5(bytes) {
    return Atomics.isLockFree(5);
}
noInline(foo5);

function foo6(bytes) {
    return Atomics.isLockFree(6);
}
noInline(foo6);

function foo7(bytes) {
    return Atomics.isLockFree(7);
}
noInline(foo7);

function foo8(bytes) {
    return Atomics.isLockFree(8);
}
noInline(foo8);

function foo9(bytes) {
    return Atomics.isLockFree(9);
}
noInline(foo9);

for (var i = 0; i < 10000; ++i) {
    var result = foo(0);
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo(1);
    if (result !== true)
        throw new Error("Bad result: " + result);
    var result = foo(2);
    if (result !== true)
        throw new Error("Bad result: " + result);
    var result = foo(3);
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo(4);
    if (result !== true)
        throw new Error("Bad result: " + result);
    var result = foo(5);
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo(6);
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo(7);
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo(8);
    if (result !== true)
        throw new Error("Bad result: " + result);
    var result = foo(9);
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo0();
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo1();
    if (result !== true)
        throw new Error("Bad result: " + result);
    var result = foo2();
    if (result !== true)
        throw new Error("Bad result: " + result);
    var result = foo3();
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo4();
    if (result !== true)
        throw new Error("Bad result: " + result);
    var result = foo5();
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo6();
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo7();
    if (result !== false)
        throw new Error("Bad result: " + result);
    var result = foo8();
    if (result !== true)
        throw new Error("Bad result: " + result);
    var result = foo9();
    if (result !== false)
        throw new Error("Bad result: " + result);
}
