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
"use strict";

function assert(b, m) {
    if (!b)
        throw new Error("Bad:" + m);
}
noInline(assert);

function foo(p) {
    function C() {
        this.y = 42;
    }
    C.prototype = p;
    let result = new C;
    return result;
}

function bar(p) {
    function C() {
        this.y = 42;
    }
    C.prototype = p;
    let result = new C;
    return result;
}

function access(item) {
    return item.x;
}

function makeLongChain(x) {
    let item = {x:42};
    for (let i = 0; i < x; ++i) {
        item = {__proto__:item}
    }
    return item;
}


let p1 = makeLongChain(10);
let a = foo(p1);
let b = bar(p1);
b.__proto__ = makeLongChain(10);
function accessY(x) { return x.y; }
accessY(a);
accessY(b);
accessY(a);
accessY(b);

let start = Date.now();
for (let i = 0; i < 10000; ++i) {
    let a = foo(p1);
    for (let i = 0; i < 1000; ++i) {
        assert(a.x === 42);
    }
    let proto = {x:42};
    let b = bar(proto);
    for (let i = 0; i < 100; ++i) {
        assert(b.x === 42);
    }
}

if (false)
    print(Date.now() - start);
