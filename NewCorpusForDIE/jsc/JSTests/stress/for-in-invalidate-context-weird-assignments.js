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
        throw new Error("Bad");
}

function test(f) {
    noInline(f);
    for (let i = 0; i < 1000; ++i)
        f();
}

function shouldThrowSyntaxError(script) {
    let error;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }

    if (!(error instanceof SyntaxError))
        throw new Error('Expected SyntaxError!');
}

test(function() {
    let o = {xx: 0};
    for (let i in o) {
        for (i in [0, 1, 2]) { }
        assert(typeof i === "string");
        assert(o[i] === undefined);
    }
});

test(function() {
    let o = {xx: 0};
    for (let i in o) {
        for ({i} of [{i: 0}]) { }
        assert(typeof i === "number");
        assert(o[i] === undefined);
    }
});

test(function() {
    let o = {xx: 0};
    for (let i in o) {
        ;({i} = {i: 0});
        assert(typeof i === "number");
        assert(o[i] === undefined);
    }
});

test(function() {
    let o = {xx: 0};
    for (let i in o) {
        ;([i] = [0]);
        assert(typeof i === "number");
        assert(o[i] === undefined);
    }
});

test(function() {
    let o = {xx: 0};
    for (let i in o) {
        ;({...i} = {a:20, b:30});
        assert(typeof i === "object");
        assert(o[i] === undefined);
    }
});

test(function() {
    let o = {xx: 0};
    for (let i in o) {
        eval("i = 0;");
        assert(typeof i === "number");
        assert(o[i] === undefined);
    }
});

shouldThrowSyntaxError(
    `function f() {
        let o = {xx: 0};
        for (let i in o) {
            for (var i of [0]) { }
        }
    }`
);

shouldThrowSyntaxError(
    `function f() {
        let o = {xx: 0};
        for (let i in o) {
            var i = 0;
        }
    }`
);
