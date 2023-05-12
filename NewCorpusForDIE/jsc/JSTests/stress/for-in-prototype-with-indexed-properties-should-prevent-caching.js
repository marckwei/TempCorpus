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
        throw new Error;
}


function test1() {
    function foo(o) {
        let result = [];
        for (let p in o)
            result.push(p);
        return result;
    }
    noInline(foo);

    let p = {};
    let x = {__proto__: p};
    p[0] = 25;
    for (let i = 0; i < 20; ++i) {
        let result = foo(x);
        assert(result.length === 1);
        assert(result[0] === "0");
    }

    p[1] = 30;
    for (let i = 0; i < 20; ++i) {
        let result = foo(x);
        assert(result.length === 2);
        assert(result[0] === "0");
        assert(result[1] === "1");
    }

    p[2] = {};
    for (let i = 0; i < 20; ++i) {
        let result = foo(x);
        assert(result.length === 3);
        assert(result[0] === "0");
        assert(result[1] === "1");
        assert(result[2] === "2");
    }
}
test1();

function test2() {
    function foo(o) {
        let result = [];
        for (let p in o)
            result.push(p);
        return result;
    }
    noInline(foo);

    let p = {};
    let x = {__proto__: p};
    for (let i = 0; i < 20; ++i) {
        let result = foo(x);
        assert(result.length === 0);
    }

    p[0] = 30;
    for (let i = 0; i < 20; ++i) {
        let result = foo(x);
        assert(result.length === 1);
        assert(result[0] === "0");
    }

    p[1] = {};
    for (let i = 0; i < 20; ++i) {
        let result = foo(x);
        assert(result.length === 2);
        assert(result[0] === "0");
        assert(result[1] === "1");
    }
}
test2();
