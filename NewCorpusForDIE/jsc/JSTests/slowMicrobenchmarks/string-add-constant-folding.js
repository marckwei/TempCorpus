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
        throw new Error("Bad assertion.");
}

let tests = [];
function test(f) {
    noInline(f);
    tests.push(f);
}

function runTests() {
    let start = Date.now();
    for (let f of tests) {
        for (let i = 0; i < 40000; i++)
            f();
    }
    const verbose = false;
    if (verbose)
        print(Date.now() - start);
}

function add(a,b) { return a + b; }
noInline(add);

test(function() {
    let a = "foo";
    let b = 20;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = null;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = undefined;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = 20.81239012821;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = true;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = false;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = NaN;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = -0;
    let b = "foo";
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = 0.0;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = Infinity;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = -Infinity;
    let b = "foo";
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = 1e10;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = 1e-10;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = 1e5;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = 1e-5;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = 1e-40;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

test(function() {
    let a = "foo";
    let b = 1e40;
    assert(a + b === add(a, b));
    assert(b + a === add(b, a));
});

runTests();
