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

function assert(b, m="") {
    if (!b)
        throw new Error("Bad assertion: " + m);
}
noInline(assert);

function test1() {
    function bar(a, b, c, d) {
        return [a, b, c, d];
    }
    function foo(...args) {
        return bar(...args);
    }
    noInline(foo);

    for (let i = 0; i < 10000; i++) {
        let [a, b, c, d] = foo(i, i+1, i+2, i+3);
        assert(a === i);
        assert(b === i+1);
        assert(c === i+2);
        assert(d === i+3) ;
    }
}

function test2() {
    function bar(...args) {
        return args;
    }
    function foo(a, ...args) {
        return bar(...args, a, ...args);
    }
    noInline(foo);

    for (let i = 0; i < 10000; i++) {
        let r = foo(i, i+1, i+2, i+3);
        assert(r.length === 7);
        let [a, b, c, d, e, f, g] = r;
        assert(a === i+1);
        assert(b === i+2);
        assert(c === i+3);
        assert(d === i);
        assert(e === i+1);
        assert(f === i+2);
        assert(g === i+3);
    }
}

function test3() {
    function baz(...args) {
        return args;
    }
    function bar(...args) {
        return baz(...args);
    }
    function foo(a, b, c, ...args) {
        return bar(...args, a, ...args);
    }
    noInline(foo);

    for (let i = 0; i < 100000; i++) {
        let r = foo(i, i+1, i+2, i+3);
        assert(r.length === 3);
        let [a, b, c] = r;
        assert(a === i+3);
        assert(b === i);
        assert(c === i+3);
    }
}

function test4() {
    function baz(...args) {
        return args;
    }
    function bar(...args) {
        return baz(...args);
    }
    function foo(a, b, c, d, ...args) {
        return bar(...args, a, ...args);
    }
    noInline(foo);

    for (let i = 0; i < 100000; i++) {
        let r = foo(i, i+1, i+2, i+3);
        assert(r.length === 1);
        assert(r[0] === i);
    }
}

function test5() {
    function baz(a, b, c) {
        return [a, b, c];
    }
    function bar(...args) {
        return baz(...args);
    }
    function foo(a, b, c, d, ...args) {
        return bar(...args, a, ...args);
    }
    noInline(foo);

    for (let i = 0; i < 100000; i++) {
        let r = foo(i, i+1, i+2, i+3);
        assert(r.length === 3);
        let [a, b, c] = r;
        assert(a === i);
        assert(b === undefined);
        assert(c === undefined);
    }
}

test1();
test2();
test3();
test4();
test5();
