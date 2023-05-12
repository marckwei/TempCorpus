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

"use strict";
function assert(b) {
    if (!b)
        throw new Error("Bad assertion")
}

function test(f, n = 1000) {
    for (let i = 0; i < n; ++i)
        f();
}

class Base {
    get foo() { return this; }
}

class Child extends Base {
    a() {
        return super.foo;
    }

    b() {
        let arr = () => super.foo;
        return arr();
    }
};

let A = Child.prototype.a;
var AA = Child.prototype.a;
this.AAA = Child.prototype.a;

let globalObj = this;

test(function() {
    assert(Child.prototype.a.call("xyz") === "xyz");
    let obj = {};
    assert(Child.prototype.a.call(obj) === obj);
    assert(Child.prototype.a.call(25) === 25);
    assert(Child.prototype.a.call(globalObj) === globalObj);

    assert(Child.prototype.b.call("xyz") === "xyz");
    assert(Child.prototype.b.call(obj) === obj);
    assert(Child.prototype.b.call(25) === 25);
    assert(Child.prototype.b.call(globalObj) === globalObj);

    assert(A() === undefined);
    assert(AA() === undefined);
    assert(AAA() === undefined);
});
