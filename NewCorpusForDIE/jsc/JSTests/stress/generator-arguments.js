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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error(`bad value: ${String(actual)}`);
}

(function () {
    function *g1(a, b, c)
    {
        yield arguments;
        yield arguments;
    }

    var g = g1(0, 1, 2);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);

    function *g2(a, b, c)
    {
        yield arguments;
        yield arguments;
        a = yield a;
        yield arguments;
        b = yield b;
        yield arguments;
        c = yield c;
        yield arguments;
    }
    var g = g2(0, 1, 2);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(g.next().value, 0);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":42,"1":1,"2":2}`);
    shouldBe(g.next().value, 1);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":42,"1":42,"2":2}`);
    shouldBe(g.next().value, 2);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":42,"1":42,"2":42}`);
}());

(function () {
    function *g1(a, b, c)
    {
        "use strict";
        yield arguments;
        yield arguments;
    }

    var g = g1(0, 1, 2);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);

    function *g2(a, b, c)
    {
        "use strict";
        yield arguments;
        yield arguments;
        a = yield a;
        yield arguments;
        b = yield b;
        yield arguments;
        c = yield c;
        yield arguments;
    }
    var g = g2(0, 1, 2);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(g.next().value, 0);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":0,"1":1,"2":2}`);
    shouldBe(g.next().value, 1);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":0,"1":1,"2":2}`);
    shouldBe(g.next().value, 2);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":0,"1":1,"2":2}`);
}());

(function () {
    "use strict";
    function *g1(a, b, c)
    {
        yield arguments;
        yield arguments;
    }

    var g = g1(0, 1, 2);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);

    function *g2(a, b, c)
    {
        yield arguments;
        yield arguments;
        a = yield a;
        yield arguments;
        b = yield b;
        yield arguments;
        c = yield c;
        yield arguments;
    }
    var g = g2(0, 1, 2);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(JSON.stringify(g.next().value), `{"0":0,"1":1,"2":2}`);
    shouldBe(g.next().value, 0);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":0,"1":1,"2":2}`);
    shouldBe(g.next().value, 1);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":0,"1":1,"2":2}`);
    shouldBe(g.next().value, 2);
    shouldBe(JSON.stringify(g.next(42).value), `{"0":0,"1":1,"2":2}`);
}());
