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

function assert(b, m) {
    if (!b)
        throw new Error(m);
}

function test(f, iters = 1000) {
    noInline(f);
    for (let i = 0; i < iters; i++)
        f(i);
}

const globalConst = {};
class GlobalClass { }
let globalLet = {};
let f = new Function("", "return globalConst;");
test(function() {
    assert(f() === globalConst);
});

f = new Function("", "return GlobalClass;");
test(function() {
    let ctor = f();
    assert(ctor === GlobalClass);
    assert((new GlobalClass) instanceof GlobalClass);
});


f = new Function("", "return globalLet;");
test(function() {
    assert(f() === globalLet);
});

f = new Function("prop", "x", "globalLet[prop] = x;");
test(function(i) {
    f(i, i);
    assert(globalLet[i] === i);
});

f = new Function("prop", "x", "globalConst[prop] = x;");
test(function(i) {
    f(i, i);
    assert(globalConst[i] === i);
});

f = new Function("", "globalConst = 25");
test(function() {
    let threw = false;
    try {
        f();
    } catch(e) {
        threw = true;
        assert(e.toString() === "TypeError: Attempted to assign to readonly property.")
    }
    assert(threw);
});

f = new Function("", "globalConst = 25");
test(function() {
    let threw = false;
    try {
        f();
    } catch(e) {
        threw = true;
        assert(e.toString() === "TypeError: Attempted to assign to readonly property.")
    }
    assert(threw);
});

f = new Function("", "constTDZ = 25");
test(function() {
    let threw = false;
    try {
        f();
    } catch(e) {
        threw = true;
        assert(e.toString() === "ReferenceError: Cannot access uninitialized variable.")
    }
    assert(threw);
});

f = new Function("", "constTDZ;");
test(function() {
    let threw = false;
    try {
        f();
    } catch(e) {
        threw = true;
        assert(e.toString() === "ReferenceError: Cannot access uninitialized variable.")
    }
    assert(threw);
});

f = new Function("", "letTDZ;");
test(function() {
    let threw = false;
    try {
        f();
    } catch(e) {
        threw = true;
        assert(e.toString() === "ReferenceError: Cannot access uninitialized variable.")
    }
    assert(threw);
});

f = new Function("", "letTDZ = 20;");
test(function() {
    let threw = false;
    try {
        f();
    } catch(e) {
        threw = true;
        assert(e.toString() === "ReferenceError: Cannot access uninitialized variable.")
    }
    assert(threw);
});

f = new Function("", "ClassTDZ");
test(function() {
    let threw = false;
    try {
        f();
    } catch(e) {
        threw = true;
        assert(e.toString() === "ReferenceError: Cannot access uninitialized variable.")
    }
    assert(threw);
});


const constTDZ = 25;
let letTDZ = 25;
class ClassTDZ { }

