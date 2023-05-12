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

function testSyntaxError(script, message) {
    var error = null;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("Expected syntax error not thrown");

    if (String(error) !== message)
        throw new Error("Bad error: " + String(error));
}

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function test() {
    let async = {
        super: Object
    };
    class A extends Object {
        constructor()
        {
            super();
        }
        get hey()
        {
            return Object;
        }
        get hey2()
        {
            return Object;
        }
        super()
        {
            return Object;
        }
    }

    class B extends A {
        constructor()
        {
            super();
            shouldBe(typeof (new super.hey), "object");
            shouldBe(typeof (new super.hey()), "object");
            shouldBe(typeof (new super["hey2"]()), "object");
            shouldBe(typeof new super.super``, "object");
            shouldBe(typeof new async.super(), "object");
            shouldBe(typeof new.target.super(), "object");
        }

        static get super() { return Object; }
    }

    new B();
}

test();
testSyntaxError(`
class A extends Object {
    constructor()
    {
        new super();
    }
}
`, `SyntaxError: Cannot use new with super call.`);
testSyntaxError(`
class A extends Object {
    constructor()
    {
        new super;
    }
}
`, `SyntaxError: Cannot use new with super call.`);
testSyntaxError(`
class A extends Object {
    constructor()
    {
        new super?.ok();
    }
}
`, `SyntaxError: Cannot call constructor in an optional chain.`);
