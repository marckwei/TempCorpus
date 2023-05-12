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
        throw new Error("Bad assertion")
}

function test(f, n = 1000) {
    for (let i = 0; i < n; ++i)
        f();
}

let o1 = {
    get foo() {
        "use strict";
        return this;
    }
};

let o2 = {
    __proto__: o1,
    a() {
        return super.foo;
    },

    aa() {
        let arr = () => super.foo;
        return arr();
    },

    b() {
        "use strict";
        return super.foo;
    },

    bb() {
        "use strict";
        let arr = () => super.foo;
        return arr();
    }
};

var A = o2.a;
var AA = o2.aa;
var B = o2.b;
var BB = o2.b;

let globalObj = this;

test(function() {
    let num = o2.a.call(25);
    assert(typeof num === "object");
    assert(num instanceof Number);

    let str = o2.a.call("foo bar");
    assert(typeof str === "object");
    assert(str instanceof String);
    assert(str == "foo bar");

    let o = {};
    assert(o2.a.call(o) === o);

    assert(A() === globalObj);
});

test(function() {
    let num = o2.aa.call(25);
    assert(typeof num === "object");
    assert(num instanceof Number);

    let str = o2.aa.call("foo bar");
    assert(typeof str === "object");
    assert(str instanceof String);
    assert(str == "foo bar");

    let o = {};
    assert(o2.aa.call(o) === o);

    assert(AA() === globalObj);
});

test(function() {
    let num = o2.b.call(25);
    assert(typeof num === "number");
    assert(num === 25);

    let str = o2.b.call("foo bar");
    assert(typeof str === "string");
    assert(str === "foo bar");

    let o = {};
    assert(o2.b.call(o) === o);

    assert(B() === undefined);
});

test(function() {
    let num = o2.bb.call(25);
    assert(typeof num === "number");
    assert(num === 25);

    let str = o2.bb.call("foo bar");
    assert(typeof str === "string");
    assert(str === "foo bar");

    let o = {};
    assert(o2.bb.call(o) === o);

    assert(BB() === undefined);
});
